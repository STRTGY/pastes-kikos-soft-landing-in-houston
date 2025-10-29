# Customer Value Perception Pages

## Overview

Three new pages analyzing customer-perceived value across Houston restaurants, based on AI-parsed Google reviews.

## Pages

### 4.1 Overview (`/pages/customer-value/overview`)
Market-level analysis with:
- KPI cards: total reviews, restaurant count, market means
- Sentiment distribution histogram
- Top aspects by mention frequency (colored by mean score)
- Top/bottom 15 restaurants by perceived value

### 4.2 Market Map (`/pages/customer-value/map`)
Interactive geospatial visualization:
- Point map of restaurants colored by `mean_value` (0–5 scale)
- Dot size reflects review count
- Filters: category, price range, neighborhood, min reviews
- Hover tooltips with restaurant details
- Distribution histogram with market mean indicator

### 4.3 Restaurant Detail (`/pages/customer-value/detail`)
Individual restaurant deep-dive:
- Restaurant profile card (name, address, category, price)
- Value metrics vs market benchmark
- Value gap indicator (color-coded)
- Aspect performance radar chart (planned, currently table)
- Sample review summaries (up to 10)

## Data Sources

All pages load from:
- `src/data/static/reviews_enriched.json` - 10 AI-parsed reviews with placeId mapping
- `src/data/static/restaurant_value_metrics.json` - Per-restaurant aggregates + market stats
- `src/data/gis/restaurant_value_metrics.geojson` - 7,348 restaurants with spatial data

## Key Metrics

- **perceived_value_score**: 0–5 scale derived from sentiment or explicit value aspect
- **mean_value**: Restaurant average of perceived value scores
- **value_gap_to_market**: Delta from market mean (3.18 in current dataset)
- **mean_sentiment**: -1 to +1 sentiment average
- Aspect scores: food, service, cleanliness, ambience, staff (when available)

## Data Refresh

To update with new reviews:

1. Place new `reviews_parsed.json` in `pasteskikos_softlanding_houston/data/processed/`
2. Run enrichment script:
   ```bash
   cd pasteskikos_softlanding_houston
   python scripts/enrich_reviews_with_restaurant.py
   ```
3. Copy outputs to Observable:
   ```bash
   # From project root
   Copy-Item "pasteskikos_softlanding_houston/data/processed/reviews_enriched.json" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/static/"
   Copy-Item "pasteskikos_softlanding_houston/data/processed/restaurant_value_metrics.json" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/static/"
   Copy-Item "pasteskikos_softlanding_houston/data/processed/restaurant_value_metrics.geojson" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/gis/"
   ```
4. Rebuild site:
   ```bash
   cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
   npm run build
   ```

## Current Dataset Statistics

- **Total Reviews**: 10
- **Restaurants with Reviews**: 1
- **Market Mean Value**: 3.18
- **Market Mean Sentiment**: 0.27

_Note: Current dataset is limited to 10 sample reviews for development. Production deployment should use full review dataset._

## Navigation

Pages are accessible via section "4. Percepción de Valor (Houston)" in the main navigation, configured in `observablehq.config.js`.

---

**Created**: October 2025  
**Framework**: Observable Framework 1.13.3  
**Status**: ✅ Built and deployed

