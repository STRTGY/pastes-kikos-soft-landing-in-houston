# Observable Framework - Refactored Architecture Guide

## Quick Start

### 1. Setup Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Mapbox token
# MAPBOX_TOKEN=pk.your_token_here
```

### 2. Run Development Server
```bash
npm run dev
```
The `predev` script will automatically generate `src/config/public-env.generated.js` from your `.env` file.

### 3. Build for Production
```bash
npm run build
```
The `prebuild` script ensures the environment config is generated before building.

## Architecture Overview

### Configuration Layer
```
.env (not in git)
  ↓
scripts/generate-public-env.js
  ↓
src/config/public-env.generated.js
  ↓
src/config/maps.js (MAP_DEFAULTS)
  ↓
Map Components & Pages
```

### File Structure
```
hello-framework/
├── .env                          # Your local environment (create from .env.example)
├── .env.example                  # Template for environment variables
├── scripts/
│   └── generate-public-env.js    # Generates config from .env
├── src/
│   ├── config/
│   │   ├── public-env.generated.js  # Auto-generated, do not edit
│   │   └── maps.js                   # Centralized map defaults
│   ├── static/styles/
│   │   ├── typography.css            # Global text & hero styles
│   │   ├── layout.css                # Grid & card utilities
│   │   └── maps.css                  # Map container styles
│   ├── components/maps/
│   │   └── *.js                      # Map components using MAP_DEFAULTS
│   └── pages/
│       └── **/*.md                   # Page content files
└── observablehq.config.js            # Loads global stylesheets
```

## Usage Patterns

### Loading Data
```js
// In your .md file code blocks
const restaurants = await FileAttachment("../../data/gis/restaurantes.geojson").json();
const stats = await FileAttachment("../../data/static/stats.json").json();

// For CSV files
const csvData = await FileAttachment("../../data/file.csv").csv({typed: true});
```

**Important:** `FileAttachment` is a global function provided by Observable Framework, available only in page (.md) context. It automatically handles caching and optimization.

### Creating Maps
```js
// Import the map component you need
import restaurantsMap from "../../components/maps/restaurants-all-map.js";

// Load your data using Observable's FileAttachment
const restaurants = await FileAttachment("../../data/gis/restaurantes.geojson").json();

// Create map (defaults automatically applied)
const mapEl = await restaurantsMap({
  restaurants,
  ariaLabel: "Mapa de restaurantes en Houston"
});

// Render in a responsive container
<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${mapEl}
    </div>
  </div>
</div>
```

**What happens behind the scenes:**
- `MAP_DEFAULTS` provides center, zoom, token, and style
- Map component adds `role="img"` and `aria-label` for accessibility
- `.map-container` applies responsive height via CSS
- No need to specify token or size in every map call

### Overriding Defaults
```js
// If you need custom center/zoom
const mapEl = await someMap({
  center: [30.0, -96.0],  // Override center
  zoom: 12,                // Override zoom
  data: myData,
  ariaLabel: "Custom label"
});
// Other defaults (token, style) still applied
```

### Using Global Styles
Pages automatically have access to these classes:

**Typography & Sections:**
```html
<div class="hero">
  <h1>Main Title</h1>
  <h2>Subtitle</h2>
  <h3>Details</h3>
</div>

<div class="text">
  <p>Your content here...</p>
  <ul>
    <li>Bullet points</li>
  </ul>
</div>
```

**Layout:**
```html
<div class="grid grid-cols-2">
  <div class="card">Content 1</div>
  <div class="card">Content 2</div>
</div>
```

**Maps:**
```html
<div class="card map-card">
  <div class="map-container">
    ${yourMapElement}
  </div>
</div>
```

## Available Map Components

All map components in `src/components/maps/` support:
- `defaults` parameter (uses `MAP_DEFAULTS` by default)
- `ariaLabel` parameter for accessibility
- Automatic token injection
- Responsive sizing via `.map-container`

### Current Components:
- `demographics-map.js` - Population demographics
- `restaurants-all-map.js` - All restaurants with multiple views
- `restaurants-competition-map.js` - Competition analysis
- `restaurants-drivethru-map.js` - Drive-thru focus
- `roads-functional-map.js` - Road classification
- `traffic-roads-map.js` - Traffic and congestion
- `zones-interest-map.js` - Interest zones
- `plaza-strategy-map.js` - Strategic location analysis
- `hunger-index-map.js` - Hunger index visualization

## Migrating Old Pages

### Step 1: Keep FileAttachment as-is
```js
// FileAttachment is correct - do not change
const data = await FileAttachment("path/to/file.json").json();
```

### Step 2: Simplify map calls
```js
// Before
const mapEl = await someMap({
  center: [29.7604, -95.3698],
  zoom: 10,
  size: { height: 720 },
  mapboxToken: "pk.hardcoded_token...",
  mapboxStyle: "mapbox://styles/...",
  data: myData
});

// After
const mapEl = await someMap({
  data: myData,
  ariaLabel: "Descriptive label for screen readers"
});
```

### Step 3: Use map container classes
```html
<!-- Wrap map output -->
<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${mapEl}
    </div>
  </div>
</div>
```

### Step 4: Remove inline styles
Delete any `<style>` blocks that duplicate global styles (`.hero`, `.text`, `.card`, etc.)

## Troubleshooting

### Token Not Found Error
**Console error:** `❌ MAPBOX_TOKEN no configurado`

**Solution:**
1. Create `.env` file in project root
2. Add `MAPBOX_TOKEN=your_token_here`
3. Run `npm run dev` again (predev script will regenerate config)

### Map Not Rendering
1. Check browser console for errors
2. Verify data loaded successfully (`console.log` in page)
3. Confirm `.map-container` class is applied to wrapper div
4. Check that `mapboxToken` is present in `public-env.generated.js`

### Data Not Loading
1. Check file path is correct (relative to page location)
2. Look for error in console (path logged by `loadAttachmentJson`)
3. Verify GeoJSON/JSON file is valid

### Styles Not Applied
1. Verify stylesheets are linked in `observablehq.config.js`
2. Check browser Network tab to confirm CSS files loaded
3. Clear browser cache and reload

## Performance Tips

1. **Reuse loaded data**: Store `FileAttachment` results in variables, Observable handles caching automatically
2. **Optimize GeoJSON**: Simplify complex geometries if maps are slow
3. **Lazy load**: Import heavy components only when needed
4. **Let Framework optimize**: Observable Framework automatically caches and optimizes data loading

## Maintenance

### Updating Mapbox Token
Edit `.env` file and restart dev server. Token will be automatically regenerated.

### Changing Default Map Settings
Edit `src/config/maps.js` and modify `MAP_DEFAULTS` object. Changes apply to all maps.

### Adding New Global Styles
Edit files in `src/static/styles/` and they'll be available on all pages immediately.

### Adding New Map Component
1. Create component in `src/components/maps/`
2. Import `MAP_DEFAULTS` from `../../config/maps.js`
3. Accept `defaults`, `ariaLabel`, and data parameters
4. Use pattern from existing components
5. Add a11y attributes before returning

## Security Notes

- **Never commit `.env`** - It's in `.gitignore`
- **Rotate tokens regularly** - Mapbox allows multiple tokens
- **Use restrictive token scopes** - Limit to necessary permissions
- **Monitor token usage** - Check Mapbox dashboard

## Reference

- **Observable Framework Docs**: https://observablehq.com/framework/
- **Mapbox GL JS**: https://docs.mapbox.com/mapbox-gl-js/
- **D3**: https://d3js.org/
- **Observable Plot**: https://observablehq.com/plot/

---

For questions or issues with the refactored architecture, see `REFACTORING_SUMMARY.md` for implementation details.

