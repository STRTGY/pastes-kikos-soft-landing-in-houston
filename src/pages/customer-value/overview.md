# Houston Market Value Perception — Overview

Customer perception analysis for the Houston restaurant market based on AI-parsed reviews.

```js
// Load data
const restaurantMetrics = FileAttachment("../../data/static/restaurant_value_metrics.json").json();
const reviewsEnriched = FileAttachment("../../data/static/reviews_enriched.json").json();
const restaurantGeo = FileAttachment("../../data/gis/restaurant_value_metrics.geojson").json();
```

```js
// Extract market stats and restaurant data
const marketStats = restaurantMetrics.market_stats;
const restaurants = Object.entries(restaurantMetrics.restaurants).map(([placeId, metrics]) => ({
  placeId,
  ...metrics
}));

// Filter restaurants with enough data
const restaurantsWithReviews = restaurants.filter(r => r.num_reviews > 0);
```

## Market-Level KPIs

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${marketStats.total_reviews.toLocaleString()}</h2>
    <span class="muted">Total Reviews Analyzed</span>
  </div>
  <div class="card">
    <h2>${marketStats.restaurants_with_reviews.toLocaleString()}</h2>
    <span class="muted">Restaurants</span>
  </div>
  <div class="card">
    <h2>${marketStats.market_mean_value.toFixed(2)}</h2>
    <span class="muted">Market Mean Value (0–5)</span>
  </div>
  <div class="card">
    <h2>${marketStats.market_mean_sentiment.toFixed(2)}</h2>
    <span class="muted">Market Mean Sentiment (-1–1)</span>
  </div>
</div>

## Sentiment Distribution

```js
// Bin sentiment scores
const sentimentBins = [
  { label: "Very Negative", min: -1, max: -0.6, count: 0 },
  { label: "Negative", min: -0.6, max: -0.2, count: 0 },
  { label: "Neutral", min: -0.2, max: 0.2, count: 0 },
  { label: "Positive", min: 0.2, max: 0.6, count: 0 },
  { label: "Very Positive", min: 0.6, max: 1.0, count: 0 }
];

reviewsEnriched.forEach(review => {
  const sentiment = review.sentiment_score;
  if (sentiment != null) {
    for (const bin of sentimentBins) {
      if (sentiment >= bin.min && sentiment < bin.max) {
        bin.count++;
        break;
      }
      if (sentiment === 1.0 && bin.max === 1.0) {
        bin.count++;
        break;
      }
    }
  }
});
```

```js
Plot.plot({
  marginLeft: 120,
  height: 250,
  x: { label: "Number of Reviews" },
  y: { label: null },
  marks: [
    Plot.barX(sentimentBins, {
      y: "label",
      x: "count",
      fill: d => {
        if (d.label.includes("Negative")) return "#ef4444";
        if (d.label === "Neutral") return "#94a3b8";
        return "#22c55e";
      },
      tip: true
    }),
    Plot.ruleX([0])
  ]
})
```

## Top Mentioned Aspects

```js
// Count aspect mentions and compute mean scores
const aspectData = {};

reviewsEnriched.forEach(review => {
  const aspects = review.aspects || {};
  Object.entries(aspects).forEach(([key, data]) => {
    if (typeof data === "object" && data.score != null) {
      if (!aspectData[key]) {
        aspectData[key] = { aspect: key, scores: [], count: 0 };
      }
      aspectData[key].scores.push(data.score);
      aspectData[key].count++;
    }
  });
});

const aspectSummary = Object.values(aspectData)
  .map(d => ({
    aspect: d.aspect.charAt(0).toUpperCase() + d.aspect.slice(1),
    count: d.count,
    mean_score: d.scores.reduce((a, b) => a + b, 0) / d.scores.length
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
```

```js
Plot.plot({
  marginLeft: 100,
  height: 350,
  x: { label: "Number of Mentions" },
  y: { label: null },
  color: { 
    scheme: "blues",
    domain: [0, 5],
    legend: true,
    label: "Mean Score (0–5)"
  },
  marks: [
    Plot.barX(aspectSummary, {
      y: "aspect",
      x: "count",
      fill: "mean_score",
      sort: { y: "-x" },
      tip: true
    }),
    Plot.ruleX([0])
  ]
})
```

## Restaurant Leaderboard

### Top 15 by Perceived Value

```js
const topRestaurants = restaurantsWithReviews
  .filter(r => r.mean_value != null)
  .sort((a, b) => b.mean_value - a.mean_value)
  .slice(0, 15);

const topRestaurantsTable = topRestaurants.map(r => ({
  placeId: r.placeId,
  "Mean Value": r.mean_value.toFixed(2),
  "Value Gap": r.value_gap_to_market >= 0 ? `+${r.value_gap_to_market.toFixed(2)}` : r.value_gap_to_market.toFixed(2),
  "Reviews": r.num_reviews,
  "Sentiment": r.mean_sentiment?.toFixed(2) ?? "—"
}));

const topRestaurantsGeo = restaurantGeo.features.filter(f => 
  topRestaurants.some(r => r.placeId === f.properties.placeId)
);
```

<div class="grid grid-cols-2">
  <div>

```js
Inputs.table(topRestaurantsTable, {
  layout: "auto",
  width: "100%"
})
```

  </div>
  <div>

```js
Plot.plot({
  width: 500,
  height: 400,
  projection: {
    type: "mercator",
    domain: {
      type: "MultiPoint",
      coordinates: topRestaurantsGeo.map(f => f.geometry.coordinates)
    }
  },
  marks: [
    Plot.geo(topRestaurantsGeo, {
      geometry: f => f.geometry,
      fill: "#22c55e",
      stroke: "#166534",
      strokeWidth: 1.5,
      r: 6,
      tip: true,
      title: f => `${f.properties.title}\nValue: ${f.properties.mean_value?.toFixed(2) ?? "—"}`
    }),
    Plot.text(topRestaurantsGeo, {
      geometry: f => f.geometry,
      text: (f, i) => `${i + 1}`,
      fill: "white",
      fontSize: 10,
      fontWeight: "bold"
    })
  ]
})
```

  </div>
</div>

### Bottom 15 by Perceived Value

```js
const bottomRestaurants = restaurantsWithReviews
  .filter(r => r.mean_value != null)
  .sort((a, b) => a.mean_value - b.mean_value)
  .slice(0, 15);

const bottomRestaurantsTable = bottomRestaurants.map(r => ({
  placeId: r.placeId,
  "Mean Value": r.mean_value.toFixed(2),
  "Value Gap": r.value_gap_to_market >= 0 ? `+${r.value_gap_to_market.toFixed(2)}` : r.value_gap_to_market.toFixed(2),
  "Reviews": r.num_reviews,
  "Sentiment": r.mean_sentiment?.toFixed(2) ?? "—"
}));

const bottomRestaurantsGeo = restaurantGeo.features.filter(f => 
  bottomRestaurants.some(r => r.placeId === f.properties.placeId)
);
```

<div class="grid grid-cols-2">
  <div>

```js
Inputs.table(bottomRestaurantsTable, {
  layout: "auto",
  width: "100%"
})
```

  </div>
  <div>

```js
Plot.plot({
  width: 500,
  height: 400,
  projection: {
    type: "mercator",
    domain: {
      type: "MultiPoint",
      coordinates: bottomRestaurantsGeo.map(f => f.geometry.coordinates)
    }
  },
  marks: [
    Plot.geo(bottomRestaurantsGeo, {
      geometry: f => f.geometry,
      fill: "#ef4444",
      stroke: "#991b1b",
      strokeWidth: 1.5,
      r: 6,
      tip: true,
      title: f => `${f.properties.title}\nValue: ${f.properties.mean_value?.toFixed(2) ?? "—"}`
    }),
    Plot.text(bottomRestaurantsGeo, {
      geometry: f => f.geometry,
      text: (f, i) => `${i + 1}`,
      fill: "white",
      fontSize: 10,
      fontWeight: "bold"
    })
  ]
})
```

  </div>
</div>

---

_Market benchmark computed across ${marketStats.restaurants_with_reviews} restaurants with review data._

