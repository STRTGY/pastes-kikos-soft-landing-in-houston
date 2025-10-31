// Pure utility functions for filtering pricing geojson data
// No FileAttachment, no reactive state - only pure transformations

export function filterGeojsonByCategoryAndMinCount(geojson, category, minN) {
  if (!geojson || !geojson.features) {
    return { type: "FeatureCollection", features: [] };
  }

  let filtered = geojson.features;

  // Filter by category if not "overall"
  if (category !== "overall") {
    filtered = filtered.filter(f => f.properties.category_main === category);
  }

  // Filter by minimum count (consider both sources)
  filtered = filtered.filter(f => {
    const nGoogle = f.properties.n_google || 0;
    const nMenu = f.properties.n_menu || 0;
    return (nGoogle + nMenu) >= minN;
  });

  return { type: "FeatureCollection", features: filtered };
}

