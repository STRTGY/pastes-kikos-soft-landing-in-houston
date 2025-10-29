# Deployment Guide - Pastes Kikos Soft Landing Houston

## Build & Deploy to GitHub Pages

### Prerequisites
- Node.js 18+
- Git configured with GitHub access
- GitHub Pages enabled on the repository

### Build Process

1. **Install dependencies** (first time only):
```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
npm install
```

2. **Build the site**:
```bash
npm run build
```

This generates static files in `dist/` directory.

### Deploy to GitHub Pages

#### Option A: Manual Deploy (via `gh-pages` branch)

```bash
# Install gh-pages utility (first time)
npm install -g gh-pages

# Deploy dist folder to gh-pages branch
gh-pages -d dist -b gh-pages
```

#### Option B: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml` in repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
          npm ci
          
      - name: Build
        run: |
          cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
          npm run build
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/dist
```

### GitHub Pages Configuration

1. Go to repository **Settings** → **Pages**
2. Set **Source** to `gh-pages` branch, `/` (root) folder
3. Save and wait for deployment (usually <1 min)

### Custom Domain (Optional)

If using a custom domain:

1. Add `CNAME` file to `static/` folder with your domain
2. Configure DNS:
   - A records pointing to GitHub Pages IPs
   - CNAME record for www subdomain
3. Enable HTTPS in Pages settings

### Verification Checklist

After deployment, verify:

- [ ] Homepage loads at `https://[username].github.io/[repo-name]/`
- [ ] All internal links work (navigation, pagination)
- [ ] Maps render correctly (check Mapbox token)
- [ ] Data files load (check browser DevTools Network tab)
- [ ] Search functionality works
- [ ] Mobile responsive layout
- [ ] No console errors

### Troubleshooting

**Issue**: Maps don't load
- **Solution**: Verify Mapbox token is valid and domain is whitelisted

**Issue**: 404 on page refresh
- **Solution**: GitHub Pages doesn't support SPA routing; links should work from homepage

**Issue**: GeoJSON files timeout
- **Solution**: Large files (>5MB) may be slow; consider compression or CDN

**Issue**: Search not working
- **Solution**: Ensure `_observablehq/minisearch.json` was generated during build

### Performance Optimization

For production deployment:

1. **Compress GeoJSON**:
```bash
# Use topojson for smaller file sizes
npm install -g topojson
geo2topo src/data/gis/*.geojson > combined.topojson
```

2. **CDN for heavy assets**:
   - Upload large GeoJSON to Cloudflare/AWS S3
   - Update `FileAttachment` URLs

3. **Enable caching headers** (via GitHub Pages or Cloudflare)

### Monitoring & Analytics

Add Google Analytics or similar:

1. Edit `observablehq.config.js`:
```js
export default {
  // ...
  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXX');
    </script>
  `,
};
```

### Updating Content

To update the site after initial deployment:

1. Edit source files in `src/`
2. Run `npm run build`
3. Deploy updated `dist/` folder
4. Deployment takes ~30 seconds to propagate

## Data Refresh Guide

### Customer Value Perception Data

The Customer Value Perception pages (section 4) use AI-parsed review data that needs periodic refresh:

#### Data Sources
- **Input**: `pasteskikos_softlanding_houston/data/processed/reviews_parsed.json`
- **Mapping CSV**: `pasteskikos_softlanding_houston/data/interim/df_reviews_total.csv`
- **Restaurant Base**: `pasteskikos_softlanding_houston/data/processed/restaurant_base.geojson`

#### Output Files (copied to Observable)
- `src/data/static/reviews_enriched.json` - Enriched reviews with placeId and value scores
- `src/data/static/restaurant_value_metrics.json` - Per-restaurant aggregates and market benchmarks
- `src/data/gis/restaurant_value_metrics.geojson` - Restaurants with metrics (for map)
- `src/data/gis/area_value.geojson` - Voronoi area aggregations

#### Refresh Process

1. **Update source reviews** (if new reviews available):
   - Place new parsed reviews in `pasteskikos_softlanding_houston/data/processed/reviews_parsed.json`
   - Update the batch CSV if restaurant list changes

2. **Run enrichment script**:
```bash
cd pasteskikos_softlanding_houston
python scripts/enrich_reviews_with_restaurant.py
```

This will:
- Map reviews to restaurants via `custom_id → placeId`
- Compute perceived value scores
- Aggregate per-restaurant metrics (mean_value, mean_sentiment, etc.)
- Calculate market-wide benchmarks
- Generate GeoJSON with spatial data

3. **Copy to Observable**:
```bash
# Automated copy commands (Windows PowerShell)
Copy-Item "pasteskikos_softlanding_houston/data/processed/reviews_enriched.json" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/static/"
Copy-Item "pasteskikos_softlanding_houston/data/processed/restaurant_value_metrics.json" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/static/"
Copy-Item "pasteskikos_softlanding_houston/data/processed/restaurant_value_metrics.geojson" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/gis/"
Copy-Item "pasteskikos_softlanding_houston/data/processed/area_value.geojson" "PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/gis/"
```

4. **Rebuild and deploy**:
```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
npm run build
# Then deploy via chosen method
```

#### Data Schema Notes

**reviews_enriched.json**:
- `custom_id`: Original batch request ID
- `placeId`: Google Maps Place ID
- `sentiment_score`: -1.0 to +1.0
- `perceived_value_score`: 0-5 scale (derived from sentiment or explicit value aspect)
- `aspects`: Object with aspect scores (food, service, cleanliness, etc.)

**restaurant_value_metrics.json**:
- `benchmark`: Market-wide means (market_mean_value, market_mean_sentiment, etc.)
- `restaurants`: Dict keyed by placeId with:
  - `num_reviews`: Count of analyzed reviews
  - `mean_value`: Average perceived value
  - `mean_sentiment`: Average sentiment
  - `value_gap_to_market`: Difference from market mean
  - `mean_food`, `mean_service`, `mean_cleanliness`: Aspect-specific scores

---

**Last updated**: October 2025  
**Framework version**: Observable Framework 1.13.3

