#!/usr/bin/env python3
"""
Aggregate menu pricing data by H3 cells and Census tracts.
Creates enriched GeoJSON files with menu pricing statistics.
"""
import json
import numpy as np
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher

try:
    import h3
except ImportError:
    print("Installing h3...")
    import subprocess
    subprocess.check_call(["pip", "install", "h3"])
    import h3

try:
    from shapely.geometry import Point, shape
except ImportError:
    print("Installing shapely...")
    import subprocess
    subprocess.check_call(["pip", "install", "shapely"])
    from shapely.geometry import Point, shape


def normalize_name(name):
    """Normalize restaurant name for fuzzy matching"""
    return name.lower().strip().replace("  ", " ")


def fuzzy_match_score(str1, str2):
    """Calculate fuzzy match score between two strings"""
    return SequenceMatcher(None, normalize_name(str1), normalize_name(str2)).ratio()


def load_data():
    """Load all required data files"""
    data_dir = Path(__file__).parent.parent / "src" / "data"
    
    print("Loading menu items...")
    with open(data_dir / "menu" / "items.json", encoding="utf-8") as f:
        items = json.load(f)
    
    print("Loading restaurants geojson...")
    with open(data_dir / "gis" / "restaurants_houston.geojson", encoding="utf-8") as f:
        restaurants_geo = json.load(f)
    
    print("Loading existing pricing hex data...")
    with open(data_dir / "static" / "pricing" / "hex_r8_overall.geojson", encoding="utf-8") as f:
        hex_overall = json.load(f)
    
    print("Loading existing pricing tract data...")
    with open(data_dir / "static" / "pricing" / "tracts_overall.geojson", encoding="utf-8") as f:
        tracts_overall = json.load(f)
    
    return items, restaurants_geo, hex_overall, tracts_overall


def join_items_to_restaurants(items, restaurants_geo):
    """Join menu items to restaurant locations using fuzzy matching"""
    
    # Create restaurant lookup by title
    rest_by_title = {}
    for feature in restaurants_geo["features"]:
        title = feature["properties"].get("title", "")
        if title:
            rest_by_title[title] = feature
    
    # Match items to restaurants
    matched_items = []
    unmatched_count = 0
    match_stats = defaultdict(int)
    
    print(f"\nMatching {len(items)} items to {len(rest_by_title)} restaurants...")
    
    for item in items:
        rest_name = item["restaurant"]
        
        # Try exact match first
        if rest_name in rest_by_title:
            restaurant = rest_by_title[rest_name]
            matched_items.append({
                **item,
                "lat": restaurant["geometry"]["coordinates"][1],
                "lon": restaurant["geometry"]["coordinates"][0],
                "place_id": restaurant["properties"]["id"],
                "match_type": "exact"
            })
            match_stats["exact"] += 1
        else:
            # Try fuzzy match
            best_match = None
            best_score = 0.0
            
            for title, restaurant in rest_by_title.items():
                score = fuzzy_match_score(rest_name, title)
                if score > best_score:
                    best_score = score
                    best_match = restaurant
            
            # Accept matches with >85% similarity
            if best_score > 0.85:
                matched_items.append({
                    **item,
                    "lat": best_match["geometry"]["coordinates"][1],
                    "lon": best_match["geometry"]["coordinates"][0],
                    "place_id": best_match["properties"]["id"],
                    "match_type": "fuzzy",
                    "match_score": best_score
                })
                match_stats["fuzzy"] += 1
            else:
                unmatched_count += 1
                match_stats["unmatched"] += 1
    
    print(f"\nMatch results:")
    print(f"  Exact matches: {match_stats['exact']}")
    print(f"  Fuzzy matches: {match_stats['fuzzy']}")
    print(f"  Unmatched: {match_stats['unmatched']}")
    print(f"  Total matched: {len(matched_items)}")
    
    return matched_items


def aggregate_by_h3(matched_items, resolution=8):
    """Aggregate items by H3 cell"""
    
    print(f"\nAggregating by H3 resolution {resolution}...")
    
    # Group items by H3 cell
    h3_cells = defaultdict(list)
    
    for item in matched_items:
        if item.get("lat") and item.get("lon") and item.get("price_amount"):
            h3_id = h3.latlng_to_cell(item["lat"], item["lon"], resolution)
            h3_cells[h3_id].append(item)
    
    # Calculate statistics for each cell
    features = []
    
    for h3_id, items in h3_cells.items():
        prices = [item["price_amount"] for item in items if item.get("price_amount")]
        
        if not prices:
            continue
        
        # Get cell boundary (returns list of (lat, lon) tuples)
        boundary_coords = h3.cell_to_boundary(h3_id)
        # Convert to GeoJSON format (lon, lat)
        boundary = [[lon, lat] for lat, lon in boundary_coords]
        
        # Calculate statistics
        price_mean = np.mean(prices)
        price_median = np.median(prices)
        n = len(items)
        
        # Get top 3 most expensive restaurants in this cell
        rest_prices = defaultdict(list)
        for item in items:
            rest_prices[item["restaurant"]].append(item["price_amount"])
        
        top_restaurants = sorted(
            [(name, max(prices)) for name, prices in rest_prices.items()],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        top_restaurants_str = ";;".join([f"{name}|${price:.2f}" for name, price in top_restaurants])
        
        features.append({
            "type": "Feature",
            "properties": {
                "hex_id": h3_id,
                "price_mean_menu": round(price_mean, 2),
                "price_median_menu": round(price_median, 2),
                "n_menu": n,
                "top_restaurants_menu": top_restaurants_str
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [boundary]
            }
        })
    
    print(f"Created {len(features)} H3 cells with menu data")
    
    return {
        "type": "FeatureCollection",
        "name": "hex_r8_menu",
        "features": features
    }


def aggregate_by_tracts(matched_items, tracts_overall):
    """Aggregate items by Census tracts using point-in-polygon"""
    
    print("\nAggregating by Census tracts...")
    
    # Build spatial index of tracts
    tract_shapes = []
    for feature in tracts_overall["features"]:
        tract_shapes.append({
            "geoid": feature["properties"]["GEOID"],
            "shape": shape(feature["geometry"]),
            "feature": feature
        })
    
    # Assign items to tracts
    tract_items = defaultdict(list)
    unassigned = 0
    
    for item in matched_items:
        if not (item.get("lat") and item.get("lon") and item.get("price_amount")):
            continue
        
        point = Point(item["lon"], item["lat"])
        assigned = False
        
        for tract in tract_shapes:
            if tract["shape"].contains(point):
                tract_items[tract["geoid"]].append(item)
                assigned = True
                break
        
        if not assigned:
            unassigned += 1
    
    print(f"Assigned items to {len(tract_items)} tracts ({unassigned} items outside tracts)")
    
    # Calculate statistics for each tract
    features = []
    
    for tract_data in tract_shapes:
        geoid = tract_data["geoid"]
        items = tract_items.get(geoid, [])
        
        if not items:
            continue
        
        prices = [item["price_amount"] for item in items]
        
        # Calculate statistics
        price_mean = np.mean(prices)
        price_median = np.median(prices)
        n = len(items)
        
        # Get top 3 most expensive restaurants in this tract
        rest_prices = defaultdict(list)
        for item in items:
            rest_prices[item["restaurant"]].append(item["price_amount"])
        
        top_restaurants = sorted(
            [(name, max(prices)) for name, prices in rest_prices.items()],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        top_restaurants_str = ";;".join([f"{name}|${price:.2f}" for name, price in top_restaurants])
        
        # Add menu stats to existing feature
        feature = tract_data["feature"].copy()
        feature["properties"]["price_mean_menu"] = round(price_mean, 2)
        feature["properties"]["price_median_menu"] = round(price_median, 2)
        feature["properties"]["n_menu"] = n
        feature["properties"]["top_restaurants_menu"] = top_restaurants_str
        
        features.append(feature)
    
    print(f"Created {len(features)} tract features with menu data")
    
    return {
        "type": "FeatureCollection",
        "name": "tracts_menu",
        "features": features
    }


def enrich_existing_geojson(hex_overall, tracts_overall, hex_menu, tracts_menu):
    """Enrich existing GeoJSON with separate menu and Google fields"""
    
    print("\nEnriching existing GeoJSON files...")
    
    # Create lookup for menu data
    hex_menu_lookup = {f["properties"]["hex_id"]: f["properties"] for f in hex_menu["features"]}
    tract_menu_lookup = {f["properties"]["GEOID"]: f["properties"] for f in tracts_menu["features"]}
    
    # Enrich hex data
    hex_enriched = hex_overall.copy()
    for feature in hex_enriched["features"]:
        hex_id = feature["properties"]["hex_id"]
        
        # Rename existing fields to *_google
        feature["properties"]["price_mean_google"] = feature["properties"].pop("price_mean")
        feature["properties"]["price_median_google"] = feature["properties"].pop("price_median")
        feature["properties"]["n_google"] = feature["properties"].pop("n")
        
        # Add menu fields if available
        if hex_id in hex_menu_lookup:
            menu_props = hex_menu_lookup[hex_id]
            feature["properties"]["price_mean_menu"] = menu_props["price_mean_menu"]
            feature["properties"]["price_median_menu"] = menu_props["price_median_menu"]
            feature["properties"]["n_menu"] = menu_props["n_menu"]
            feature["properties"]["top_restaurants_menu"] = menu_props.get("top_restaurants_menu", "")
        else:
            feature["properties"]["price_mean_menu"] = None
            feature["properties"]["price_median_menu"] = None
            feature["properties"]["n_menu"] = 0
            feature["properties"]["top_restaurants_menu"] = ""
    
    # Enrich tract data
    tracts_enriched = tracts_overall.copy()
    for feature in tracts_enriched["features"]:
        geoid = feature["properties"].get("GEOID") or feature["properties"].get("geoid")
        
        # Rename existing fields to *_google
        feature["properties"]["price_mean_google"] = feature["properties"].pop("price_mean")
        feature["properties"]["price_median_google"] = feature["properties"].pop("price_median")
        feature["properties"]["n_google"] = feature["properties"].pop("n")
        
        # Add menu fields if available
        if geoid in tract_menu_lookup:
            menu_props = tract_menu_lookup[geoid]
            feature["properties"]["price_mean_menu"] = menu_props["price_mean_menu"]
            feature["properties"]["price_median_menu"] = menu_props["price_median_menu"]
            feature["properties"]["n_menu"] = menu_props["n_menu"]
            feature["properties"]["top_restaurants_menu"] = menu_props.get("top_restaurants_menu", "")
        else:
            feature["properties"]["price_mean_menu"] = None
            feature["properties"]["price_median_menu"] = None
            feature["properties"]["n_menu"] = 0
            feature["properties"]["top_restaurants_menu"] = ""
    
    print(f"Enriched {len(hex_enriched['features'])} hex cells and {len(tracts_enriched['features'])} tracts")
    
    return hex_enriched, tracts_enriched


def main():
    """Main execution function"""
    
    # Load data
    items, restaurants_geo, hex_overall, tracts_overall = load_data()
    
    # Join items to restaurants
    matched_items = join_items_to_restaurants(items, restaurants_geo)
    
    # Aggregate by H3
    hex_menu = aggregate_by_h3(matched_items, resolution=8)
    
    # Aggregate by tracts
    tracts_menu = aggregate_by_tracts(matched_items, tracts_overall)
    
    # Enrich existing GeoJSON
    hex_enriched, tracts_enriched = enrich_existing_geojson(
        hex_overall, tracts_overall, hex_menu, tracts_menu
    )
    
    # Save outputs
    output_dir = Path(__file__).parent.parent / "src" / "data" / "static" / "pricing"
    
    print("\nSaving outputs...")
    
    with open(output_dir / "hex_r8_menu.geojson", "w", encoding="utf-8") as f:
        json.dump(hex_menu, f, ensure_ascii=False, indent=2)
    print(f"  Saved hex_r8_menu.geojson")
    
    with open(output_dir / "tracts_menu.geojson", "w", encoding="utf-8") as f:
        json.dump(tracts_menu, f, ensure_ascii=False, indent=2)
    print(f"  Saved tracts_menu.geojson")
    
    with open(output_dir / "hex_r8_overall_enriched.geojson", "w", encoding="utf-8") as f:
        json.dump(hex_enriched, f, ensure_ascii=False, indent=2)
    print(f"  Saved hex_r8_overall_enriched.geojson")
    
    with open(output_dir / "tracts_overall_enriched.geojson", "w", encoding="utf-8") as f:
        json.dump(tracts_enriched, f, ensure_ascii=False, indent=2)
    print(f"  Saved tracts_overall_enriched.geojson")
    
    print("\n✓ Data aggregation complete!")


if __name__ == "__main__":
    main()

