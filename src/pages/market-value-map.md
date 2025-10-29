# Houston Market Value Map

Interactive map showing customer-perceived value across Houston restaurants.

```js
// Load data
const restaurantGeo = FileAttachment("../data/gis/restaurant_value_metrics.geojson").json();
const restaurantMetrics = FileAttachment("../data/static/restaurant_value_metrics.json").json();
const marketStats = restaurantMetrics.market_stats;
```

```js
// Extract features with review metrics
const restaurantsWithMetrics = restaurantGeo.features.filter(f => 
  f.properties.num_reviews != null && f.properties.num_reviews > 0
);

// Get unique values for filters
const categories = [...new Set(restaurantsWithMetrics.map(f => f.properties.categoryName).filter(Boolean))].sort();
const priceCategories = [...new Set(restaurantsWithMetrics.map(f => f.properties.price_category).filter(Boolean))].sort();
const neighborhoods = [...new Set(restaurantsWithMetrics.map(f => f.properties.neighborhood).filter(Boolean))].sort();
```

## Filters

```js
const selectedCategory = view(Inputs.select(["All", ...categories], {
  label: "Category",
  value: "All"
}));

const selectedPrice = view(Inputs.select(["All", ...priceCategories], {
  label: "Price Range",
  value: "All"
}));

const selectedNeighborhood = view(Inputs.select(["All", ...neighborhoods], {
  label: "Neighborhood",
  value: "All"
}));

const minReviews = view(Inputs.range([0, 50], {
  label: "Min Reviews",
  value: 1,
  step: 1
}));
```

```js
// Apply filters
const filteredRestaurants = restaurantsWithMetrics.filter(f => {
  const p = f.properties;
  if (selectedCategory !== "All" && p.categoryName !== selectedCategory) return false;
  if (selectedPrice !== "All" && p.price_category !== selectedPrice) return false;
  if (selectedNeighborhood !== "All" && p.neighborhood !== selectedNeighborhood) return false;
  if (p.num_reviews < minReviews) return false;
  return true;
});
```

<div class="note">
  Showing <strong>${filteredRestaurants.length.toLocaleString()}</strong> of ${restaurantsWithMetrics.length.toLocaleString()} restaurants
</div>

## Map

```js
// Color scale for mean_value (0-5)
const valueColorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 5]);

Plot.plot({
  width: 1000,
  height: 700,
  projection: {
    type: "mercator",
    domain: {
      type: "MultiPoint",
      coordinates: filteredRestaurants.map(f => f.geometry.coordinates)
    }
  },
  color: {
    scheme: "RdYlGn",
    domain: [0, 5],
    legend: true,
    label: "Mean Perceived Value (0–5)"
  },
  marks: [
    Plot.geo(filteredRestaurants, {
      geometry: f => f.geometry,
      fill: f => f.properties.mean_value ?? marketStats.market_mean_value,
      stroke: "#333",
      strokeWidth: 0.5,
      r: f => Math.sqrt(f.properties.num_reviews) * 2,
      tip: true,
      title: f => {
        const p = f.properties;
        return [
          p.title || "Unknown",
          p.categoryName || "",
          `Value: ${p.mean_value?.toFixed(2) ?? "—"}`,
          `Gap: ${p.value_gap_to_market >= 0 ? "+" : ""}${p.value_gap_to_market?.toFixed(2) ?? "—"}`,
          `Reviews: ${p.num_reviews}`,
          p.neighborhood ? `Area: ${p.neighborhood}` : ""
        ].filter(Boolean).join("\n");
      }
    })
  ]
})
```

## Value Distribution (Filtered)

```js
const valueData = filteredRestaurants
  .filter(f => f.properties.mean_value != null)
  .map(f => ({ value: f.properties.mean_value }));
```

```js
Plot.plot({
  marginLeft: 60,
  height: 200,
  x: { label: "Mean Perceived Value", domain: [0, 5] },
  y: { label: "Count" },
  marks: [
    Plot.rectY(valueData, Plot.binX({ y: "count" }, { x: "value", thresholds: 20, fill: "#3b82f6" })),
    Plot.ruleX([marketStats.market_mean_value], { stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "4,4" }),
    Plot.text([{ x: marketStats.market_mean_value, y: 0, label: "Market Mean" }], { 
      x: "x", 
      y: "y", 
      text: "label",
      dy: -10,
      fill: "#dc2626"
    })
  ]
})
```

## Summary Statistics (Filtered)

```js
const filteredMeanValue = filteredRestaurants
  .map(f => f.properties.mean_value)
  .filter(v => v != null);

const filteredStats = {
  count: filteredRestaurants.length,
  mean: filteredMeanValue.reduce((a, b) => a + b, 0) / filteredMeanValue.length,
  min: Math.min(...filteredMeanValue),
  max: Math.max(...filteredMeanValue)
};
```

<div class="grid grid-cols-4">
  <div class="card">
    <h3>${filteredStats.count}</h3>
    <span class="muted">Restaurants</span>
  </div>
  <div class="card">
    <h3>${filteredStats.mean.toFixed(2)}</h3>
    <span class="muted">Mean Value</span>
  </div>
  <div class="card">
    <h3>${filteredStats.min.toFixed(2)}</h3>
    <span class="muted">Min Value</span>
  </div>
  <div class="card">
    <h3>${filteredStats.max.toFixed(2)}</h3>
    <span class="muted">Max Value</span>
  </div>
</div>

---

_Dot size reflects number of reviews. Market mean: ${marketStats.market_mean_value.toFixed(2)}_

