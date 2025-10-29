# Restaurant Detail Analysis

Detailed value perception analysis for individual restaurants vs. Houston market benchmarks.

```js
// Load data
const restaurantGeo = FileAttachment("../data/gis/restaurant_value_metrics.geojson").json();
const restaurantMetrics = FileAttachment("../data/static/restaurant_value_metrics.json").json();
const reviewsEnriched = FileAttachment("../data/static/reviews_enriched.json").json();
const marketStats = restaurantMetrics.market_stats;
```

```js
// Prepare restaurant list
const restaurantsWithMetrics = restaurantGeo.features
  .filter(f => f.properties.num_reviews != null && f.properties.num_reviews > 0)
  .map(f => ({
    placeId: f.properties.placeId,
    title: f.properties.title || "Unknown",
    category: f.properties.categoryName || "N/A"
  }))
  .sort((a, b) => a.title.localeCompare(b.title));
```

## Select Restaurant

```js
const selectedPlaceId = view(Inputs.select(restaurantsWithMetrics, {
  label: "Restaurant",
  format: d => `${d.title} (${d.category})`,
  value: restaurantsWithMetrics[0],
  valueof: d => d.placeId
}));
```

```js
// Get selected restaurant data
const selectedRestaurant = restaurantGeo.features.find(f => f.properties.placeId === selectedPlaceId);
const props = selectedRestaurant?.properties || {};
const restaurantReviews = reviewsEnriched.filter(r => r.placeId === selectedPlaceId);
```

## Restaurant Profile

<div class="grid grid-cols-2">
  <div class="card">
    <h3>${props.title || "N/A"}</h3>
    <p><strong>Category:</strong> ${props.categoryName || "N/A"}</p>
    <p><strong>Address:</strong> ${props.address || "N/A"}</p>
    <p><strong>Price Range:</strong> ${props.price || "N/A"}</p>
    <p><strong>Neighborhood:</strong> ${props.neighborhood || "N/A"}</p>
  </div>
  <div class="card">
    <h3>Review Metrics</h3>
    <p><strong>Total Reviews:</strong> ${props.num_reviews || 0}</p>
    <p><strong>Overall Rating:</strong> ${props.totalScore?.toFixed(1) || "N/A"}</p>
    <p><strong>Reviews Count:</strong> ${props.reviewsCount || 0}</p>
  </div>
</div>

## Value Perception vs. Market

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${props.mean_value?.toFixed(2) || "—"}</h2>
    <span class="muted">Mean Value (Restaurant)</span>
  </div>
  <div class="card">
    <h2>${marketStats.market_mean_value.toFixed(2)}</h2>
    <span class="muted">Mean Value (Market)</span>
  </div>
  <div class="card">
    <h2 style="color: ${props.value_gap_to_market >= 0 ? '#22c55e' : '#ef4444'}">
      ${props.value_gap_to_market >= 0 ? '+' : ''}${props.value_gap_to_market?.toFixed(2) || "—"}
    </h2>
    <span class="muted">Value Gap to Market</span>
  </div>
  <div class="card">
    <h2>${props.mean_sentiment?.toFixed(2) || "—"}</h2>
    <span class="muted">Mean Sentiment</span>
  </div>
</div>

## Aspect Performance

```js
// Compute aspect comparison data
const aspectKeys = ["food", "service", "cleanliness", "ambience", "staff", "value"];
const aspectComparison = aspectKeys
  .filter(key => props[`mean_${key}`] != null)
  .map(key => ({
    aspect: key.charAt(0).toUpperCase() + key.slice(1),
    restaurant: props[`mean_${key}`],
    market: marketStats.market_mean_value  // Using market mean value as proxy
  }));
```

```js
// Radar chart data preparation
const radarData = aspectComparison.flatMap(d => [
  { aspect: d.aspect, value: d.restaurant, series: "Restaurant" },
  { aspect: d.aspect, value: d.market, series: "Market Avg" }
]);
```

```js
Plot.plot({
  width: 600,
  height: 400,
  projection: {
    type: "azimuthal-equal-area",
    rotate: [0, -90],
    domain: d3.geoCircle().center([0, 90]).radius(90)()
  },
  color: { legend: true },
  marks: [
    // Grid circles
    Plot.geo([1, 2, 3, 4, 5].map(r => d3.geoCircle().center([0, 90]).radius(90 * (r / 5))()),
      { stroke: "#e5e7eb", strokeWidth: 0.5 }),
    
    // Radar areas
    Plot.area(radarData.filter(d => d.series === "Restaurant"), {
      x1: d => {
        const angle = (aspectComparison.findIndex(a => a.aspect === d.aspect) / aspectComparison.length) * 360;
        const radius = (d.value / 5) * 90;
        return radius * Math.sin(angle * Math.PI / 180);
      },
      y1: d => {
        const angle = (aspectComparison.findIndex(a => a.aspect === d.aspect) / aspectComparison.length) * 360;
        const radius = (d.value / 5) * 90;
        return radius * Math.cos(angle * Math.PI / 180);
      },
      fill: "#3b82f6",
      fillOpacity: 0.3,
      stroke: "#3b82f6",
      strokeWidth: 2
    }),
    
    // Points
    Plot.dot(radarData, {
      x: d => {
        const angle = (aspectComparison.findIndex(a => a.aspect === d.aspect) / aspectComparison.length) * 360;
        const radius = (d.value / 5) * 90;
        return radius * Math.sin(angle * Math.PI / 180);
      },
      y: d => {
        const angle = (aspectComparison.findIndex(a => a.aspect === d.aspect) / aspectComparison.length) * 360;
        const radius = (d.value / 5) * 90;
        return radius * Math.cos(angle * Math.PI / 180);
      },
      fill: "series",
      r: 4,
      tip: true
    })
  ]
})
```

### Aspect Scores Table

```js
const aspectTable = aspectComparison.map(d => ({
  "Aspect": d.aspect,
  "Restaurant Score": d.restaurant.toFixed(2),
  "Market Average": d.market.toFixed(2),
  "Delta": (d.restaurant - d.market >= 0 ? "+" : "") + (d.restaurant - d.market).toFixed(2)
}));
```

```js
Inputs.table(aspectTable, { width: "100%" })
```

## Sample Reviews

```js
const sampleReviews = restaurantReviews.slice(0, 10).map((r, i) => ({
  "#": i + 1,
  "Summary": r.summary || "—",
  "Sentiment": r.sentiment_score?.toFixed(2) || "—",
  "Value": r.perceived_value_score?.toFixed(2) || "—"
}));
```

```js
Inputs.table(sampleReviews, { 
  width: "100%",
  layout: "auto"
})
```

---

_Showing ${Math.min(10, restaurantReviews.length)} of ${restaurantReviews.length} reviews for this restaurant._

