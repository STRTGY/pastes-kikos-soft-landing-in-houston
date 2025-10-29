# Scripts Directory

This directory contains data processing scripts for the Observable Framework project.

## aggregate_menu_pricing.py

**Purpose**: Aggregates menu pricing data from individual restaurant menu items into spatial cells (H3 hexagons and Census tracts) and enriches existing GeoJSON files with menu pricing statistics.

### Requirements

```bash
pip install h3 shapely numpy
```

### Usage

```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
python scripts/aggregate_menu_pricing.py
```

### Input Files

- `src/data/menu/items.json` - Menu items with pricing
- `src/data/gis/restaurants_houston.geojson` - Restaurant locations
- `src/data/static/pricing/hex_r8_overall.geojson` - Existing H3 aggregation (Google data)
- `src/data/static/pricing/tracts_overall.geojson` - Existing tract aggregation (Google data)

### Output Files

- `src/data/static/pricing/hex_r8_menu.geojson` - H3 cells with menu pricing only
- `src/data/static/pricing/tracts_menu.geojson` - Census tracts with menu pricing only
- `src/data/static/pricing/hex_r8_overall_enriched.geojson` - H3 cells with both Google and menu pricing
- `src/data/static/pricing/tracts_overall_enriched.geojson` - Census tracts with both Google and menu pricing

### What It Does

1. **Joins** menu items to restaurant locations using:
   - Exact name matching (first priority)
   - Fuzzy matching with >85% similarity (fallback)

2. **Aggregates** matched items into spatial cells:
   - H3 hexagons at resolution 8 (~0.7 km²)
   - Census tracts using point-in-polygon

3. **Calculates** statistics for each cell:
   - Mean price
   - Median price
   - Count of items
   - Top 3 most expensive restaurants

4. **Enriches** existing GeoJSON files by:
   - Renaming old fields to `*_google`
   - Adding new fields as `*_menu`
   - Preserving original geometry

### Field Schema (Enriched GeoJSON)

```json
{
  "properties": {
    "hex_id": "88446c0211fffff",  // H3 cell ID (or GEOID for tracts)
    
    "price_mean_google": 2.2,      // Google price_level derived
    "price_median_google": 2.2,
    "n_google": 2,
    "top_restaurants": "Name|$$;;Name2|$",
    
    "price_mean_menu": 9.5,        // Menu extracted prices
    "price_median_menu": 8.75,
    "n_menu": 15,
    "top_restaurants_menu": "Name|$12.50;;Name2|$10.99;;Name3|$9.50"
  }
}
```

### Performance

- Processing ~10,000 items takes approximately 10-30 seconds
- Memory usage: < 500 MB
- Output file sizes: ~1-3 MB per GeoJSON

### Troubleshooting

**Error: `module 'h3' has no attribute 'geo_to_h3'`**
- Update h3 library: `pip install --upgrade h3`
- New API uses `h3.latlng_to_cell()` instead

**Error: `UnicodeDecodeError`**
- Ensure JSON files are UTF-8 encoded
- Script uses `encoding='utf-8'` for all file operations

**High number of unmatched items**
- Check restaurant name consistency between sources
- Adjust fuzzy match threshold (currently 0.85) in script
- Review `match_stats` output for diagnostics

### Extending

To aggregate by different spatial units:

1. Add new aggregation function (e.g., `aggregate_by_zipcodes()`)
2. Follow the pattern from `aggregate_by_h3()` or `aggregate_by_tracts()`
3. Add corresponding output file save in `main()`

To add new statistics:

1. Modify the aggregation loop to calculate additional metrics
2. Add new fields to the feature properties
3. Update the enrichment logic to preserve new fields

