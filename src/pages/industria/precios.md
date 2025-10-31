---
title: Análisis de Precios - Industria Restaurantera
toc: false
---

```js
import mapboxgl from "npm:mapbox-gl@3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {html} from "npm:htl";
import {createPricingMap} from "../../components/maps/PricingMap.js";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatNumber,
  PLOT_DEFAULTS,
  COLOR_PALETTES
} from "../../components/plots/pricingPlots.js";

// Import new components
import {selectCurrentAggregation} from "../../components/data/pricingSelect.js";
import {computeCoverageStats, buildCategoryDetail, buildPriceDistribution} from "../../components/data/pricingStats.js";
import {filterMenuItems} from "../../components/data/menuFilters.js";
import {createKpiGrid} from "../../components/cards/KpiGrid.js";
import {createCoverageStatsCard} from "../../components/cards/CoverageStatsCard.js";
import {createEmptyStateNote} from "../../components/common/EmptyStateNote.js";
import {createPricingFiltersPanel} from "../../components/panels/PricingFiltersPanel.js";
import {createCategoryDetailCard} from "../../components/cards/CategoryDetailCard.js";
import {createPriceDistributionHistogram} from "../../components/charts/PriceDistributionHistogram.js";
import {createMenuKpiGrid} from "../../components/cards/MenuKpiGrid.js";
import {createMenuFiltersPanel} from "../../components/panels/MenuFiltersPanel.js";
import {createMenuPricesHistogram} from "../../components/charts/MenuPricesHistogram.js";
import {createRestaurantIQRChart} from "../../components/charts/RestaurantIQRChart.js";
import {createProductVariationBar} from "../../components/charts/ProductVariationBar.js";
import {createCategoryIQRChart} from "../../components/charts/CategoryIQRChart.js";
```

```js
import { MAP_DEFAULTS } from "../../config/maps.js";
const { mapboxToken: MAPBOX_TOKEN, mapboxStyle: MAPBOX_STYLE } = MAP_DEFAULTS;
```

```js
// Load enriched GeoJSON with both Google and Menu data
const hexEnriched = await FileAttachment("../../data/static/pricing/hex_r8_overall_enriched.geojson").json();
const tractsEnriched = await FileAttachment("../../data/static/pricing/tracts_overall_enriched.geojson").json();

// Load menu-only aggregations
const hexMenu = await FileAttachment("../../data/static/pricing/hex_r8_menu.geojson").json();
const tractsMenu = await FileAttachment("../../data/static/pricing/tracts_menu.geojson").json();

// Load category-based aggregations
const hexByCategory = await FileAttachment("../../data/static/pricing/hex_r8_by_category.geojson").json();
const tractsByCategory = await FileAttachment("../../data/static/pricing/tracts_by_category.geojson").json();

// Load summary statistics
const categorySummary = await FileAttachment("../../data/static/pricing/category_summaries.csv").csv({typed: true});
const summary = await FileAttachment("../../data/static/pricing/summary.csv").csv();

// Load menu data for detailed analysis
const menuItems = await FileAttachment("../../data/menu/items.json").json();
const priceStats = await FileAttachment("../../data/menu/price_stats.json").json();
const restaurantStats = await FileAttachment("../../data/menu/restaurants.json").json();
```

```js
// Estados reactivos para filtros
const aggregationView = view(Inputs.radio(["H3 Hexágonos", "Census Tracts"], {value: "H3 Hexágonos", label: "Agregación espacial"}));
const selectedCategory = view(Inputs.select(["overall", ...categorySummary.map(d => d.category)], {value: "overall", label: "Categoría de restaurante"}));
const selectedMetric = view(Inputs.radio(["price_mean", "price_median"], {value: "price_mean", label: "Métrica", format: x => x === "price_mean" ? "Promedio" : "Mediana"}));
const minCount = view(Inputs.range([1, 20], {value: 5, step: 1, label: "Mínimo de restaurantes por celda"}));

// NEW: Menu weight slider (0-100, where 100 = 100% menu data)
const weightMenu = view(Inputs.range([0, 100], {
  value: 70,
  step: 1,
  label: "Peso de datos de menú (%)"
}));

// Color scale selector
const colorScale = view(Inputs.radio(
  ["quantile", "equal", "stdev"],
  {value: "quantile", label: "Escala de color", format: x => ({quantile: "Cuantiles", equal: "Igual intervalo", stdev: "Desv. estándar"})[x]}
));

// Layer toggle
const showLayer = view(Inputs.radio(
  ["choropleth", "heatmap"],
  {value: "choropleth", label: "Tipo de capa", format: x => ({choropleth: "Celdas (coropletas)", heatmap: "Puntos (heatmap)"})[x]}
));
```

```js
// Seleccionar dataset según filtros (usar datos enriquecidos)
const currentData = selectCurrentAggregation({
  aggregationView,
  selectedCategory,
  minCount,
  hexEnriched,
  tractsEnriched,
  hexByCategory,
  tractsByCategory
});
```

```js
// Display note if no data available (returns null or DOM element)
const dataNote = createEmptyStateNote(currentData.isEmpty);
```

```js
// KPIs desde summary
const kpis = {
  total: summary.find(d => d.metric === "restaurants_total")?.value || "N/A",
  priceLevelCov: summary.find(d => d.metric === "price_level_coverage")?.value || "N/A",
  menuCov: summary.find(d => d.metric === "menu_price_coverage")?.value || "N/A",
  cityMean: summary.find(d => d.metric === "price_mean_city")?.value || "N/A",
  cityStd: summary.find(d => d.metric === "price_std_city")?.value || "N/A"
};
```

```js
// Create map container and instance
const pricingMapContainer = (() => {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "700px";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  container.style.position = "relative";
  
  const map = createPricingMap(container, {
    mapboxToken: MAPBOX_TOKEN,
    mapboxStyle: MAPBOX_STYLE,
    data: currentData,
    metric: selectedMetric,
    weight: weightMenu,
    scale: colorScale,
    aggregationView: aggregationView
  });
  
  // Setup cleanup on invalidation
  invalidation.then(() => {
    if (map) map.remove();
  });
  
  return container;
})();
```


<div class="hero">
  <h1>2.2 Análisis de Precios</h1>
  <h2>Distribución espacial de precios en la industria restaurantera de Houston</h2>
</div>

<div style="margin: 2rem 0;">
  ${createKpiGrid(kpis)}
</div>

```js
// Calculate coverage statistics for the enriched data
const coverageStats = computeCoverageStats(aggregationView, hexEnriched, tractsEnriched);
```

<div style="margin: 2rem 0;">
  ${createCoverageStatsCard(coverageStats)}
</div>

<div class="filters-section">
  ${createPricingFiltersPanel({
    aggregationView,
    selectedMetric,
    selectedCategory,
    minCount,
    weightMenu,
    colorScale,
    showLayer
  })}
</div>

${dataNote ? dataNote : ""}

<div class="card map-container" style="padding: 0; margin-top: 2rem;">
  ${pricingMapContainer}
</div>

<div class="insights-card">
  <h3>💡 Mejoras y Hallazgos Clave</h3>
  <div class="insights-grid">
    <div class="insight-item">
      <div class="insight-icon">🎚️</div>
      <div class="insight-content">
        <strong>Mezcla ajustable de fuentes</strong>
        <p>Control deslizante que permite ajustar el peso entre datos de menú (0-100%) y Google price_level, visualizando la integración en tiempo real.</p>
      </div>
    </div>
    <div class="insight-item">
      <div class="insight-icon">📊</div>
      <div class="insight-content">
        <strong>Escalas de color perceptuales</strong>
        <p>Tres métodos de clasificación (cuantiles, igual intervalo, desviaciones estándar) con leyenda dinámica para mejor interpretación.</p>
      </div>
    </div>
    <div class="insight-item">
      <div class="insight-icon">🗺️</div>
      <div class="insight-content">
        <strong>Agregación espacial dual</strong>
        <p>Hexágonos H3 (res 8, ~0.7 km²) y Census tracts permiten analizar patrones a escalas geográficas complementarias.</p>
      </div>
    </div>
    <div class="insight-item">
      <div class="insight-icon">🎯</div>
      <div class="insight-content">
        <strong>Tooltips enriquecidos</strong>
        <p>Comparación lado a lado de precios Google vs. Menú, con conteos independientes y top 3 restaurantes más caros por zona.</p>
      </div>
    </div>
    <div class="insight-item">
      <div class="insight-icon">📈</div>
      <div class="insight-content">
        <strong>Cobertura de datos</strong>
        <p>${kpis.priceLevelCov} de restaurantes con price_level de Google, ${kpis.menuCov} con precios extraídos de menús, permitiendo análisis complementarios.</p>
      </div>
    </div>
    <div class="insight-item">
      <div class="insight-icon">🔍</div>
      <div class="insight-content">
        <strong>Filtros dinámicos</strong>
        <p>Por categoría de restaurante, métrica (promedio/mediana), umbral mínimo de cobertura y tipo de visualización.</p>
      </div>
    </div>
  </div>
</div>

```js
const categoryDetailData = buildCategoryDetail(selectedCategory, categorySummary);
const categoryCard = createCategoryDetailCard(categoryDetailData);
```

${categoryCard ? categoryCard : ""}

```js
// Prepare simplified price data for distribution
const {filteredPrices} = buildPriceDistribution(currentData);
```

<div class="card chart-card">
  <div class="chart-header">
    <h3>Distribución de Precios Promedio por Celda</h3>
    <p class="chart-description">
      Histograma de precios promedio de items de menú por celda espacial (outliers removidos).
    </p>
  </div>
  ${resize((width) => createPriceDistributionHistogram({filteredPrices, width}))}
</div>

<div class="info-note">
  💡 <strong>Nota:</strong> Peso actual de mezcla: <span class="highlight">${weightMenu}% menú</span>, <span class="highlight">${100 - weightMenu}% Google</span>.
  Ajusta los filtros arriba para ver diferentes agregaciones.
</div>

---

<div class="section-header">
  <h2>Análisis de Precios de Menús Extraídos</h2>
  <p class="section-subtitle">Datos detallados de precios extraídos directamente de menús de restaurantes</p>
</div>

```js
// KPIs de menús
const menuKpis = {
  totalItems: menuItems.length,
  restaurants: restaurantStats.length,
  medianPrice: priceStats.overall?.median || 0,
  p25: priceStats.overall?.p25 || 0,
  p75: priceStats.overall?.p75 || 0,
  minPrice: priceStats.overall?.min || 0,
  maxPrice: priceStats.overall?.max || 0
};
```

```js
// Filtros para análisis de menús
const categoryOptions = ["all", ...(priceStats.by_category || []).map(d => d.category)];
const selectedCategoryMenu = view(Inputs.select(
  categoryOptions,
  {value: "all", label: "Categoría"}
));

const showOutliers = view(Inputs.toggle({label: "Mostrar outliers", value: true}));
const logScale = view(Inputs.toggle({label: "Escala logarítmica", value: false}));
```

<div style="margin: 2rem 0;">
  ${createMenuKpiGrid(menuKpis)}
</div>

```js
// Filter menu items data
const filteredMenuData = filterMenuItems({
  menuItems,
  selectedCategoryMenu,
  showOutliers,
  priceStats
});
```

<div class="filters-section" style="margin: 2rem 0;">
  ${createMenuFiltersPanel({
    selectedCategoryMenu,
    showOutliers,
    logScale
  })}
</div>

<div class="card chart-card">
  <div class="chart-header">
    <h3>Distribución de Precios de Menú</h3>
    <p class="chart-description">Histograma de precios individuales de items extraídos de menús</p>
  </div>
  ${resize((width) => createMenuPricesHistogram({filteredMenuData, logScale, width}))}
</div>

```js
// Obtener top 30 restaurantes por número de items
const restaurantData = (priceStats.by_restaurant || [])
  .filter(d => d.count >= 5) // Al menos 5 items
  .sort((a, b) => b.count - a.count)
  .slice(0, 30);
```

<div class="card chart-card">
  <div class="chart-header">
    <h3>Comparativa por Restaurante (Top 30)</h3>
    <p class="chart-description">Restaurantes con mayor número de items, ordenados por mediana de precio</p>
  </div>
  ${resize((width) => createRestaurantIQRChart({restaurantData, width}))}
  <div class="chart-note">
    Las barras azul claro representan el rango intercuartílico (IQR), y los puntos azul oscuro la mediana de precios.
  </div>
</div>

```js
const topVariation = (priceStats.by_product || []).slice(0, 15);
```

<div class="card chart-card">
  <div class="chart-header">
    <h3>Productos con Mayor Variación de Precio</h3>
    <p class="chart-description">Top 15 productos con mayor dispersión de precios entre restaurantes</p>
  </div>
  ${resize((width) => createProductVariationBar({topVariation, width}))}
  <div class="chart-note">
    Estos productos muestran la mayor variación de precio entre restaurantes, indicando diferentes posicionamientos o calidades.
  </div>
</div>

```js
const categoryPriceData = (priceStats.by_category || [])
  .filter(d => d.count >= 10) // Al menos 10 items
  .sort((a, b) => b.median - a.median);
```

<div class="card chart-card">
  <div class="chart-header">
    <h3>Precios por Categoría</h3>
    <p class="chart-description">Comparación de precios medianos y rangos por categoría de comida</p>
  </div>
  ${resize((width) => createCategoryIQRChart({categoryPriceData, width}))}
  <div class="chart-note">
    Las barras representan el rango intercuartílico (IQR) y los puntos la mediana de precios para cada categoría.
  </div>
</div>

---

<div class="section-header">
  <h2>Fuentes y Metodología</h2>
  <p class="section-subtitle">Información detallada sobre las fuentes de datos y métodos de análisis</p>
</div>

<div class="methodology-card">
  <h3>📊 Fuentes de Datos</h3>

  <div class="data-source">
    <h4>🌐 Google Places API</h4>
    <p>Datos de restaurantes (price_level, ratings, categorías) — <a href="https://developers.google.com/maps/documentation/places/web-service" target="_blank">Documentation ↗</a></p>
    <ul>
      <li><strong>Cobertura:</strong> ~${kpis.priceLevelCov} de restaurantes con price_level (escala 1-4)</li>
      <li><strong>Limitaciones:</strong> Price level es categórico; no refleja precios exactos de items</li>
    </ul>
  </div>

  <div class="data-source">
    <h4>📋 Datos de Menús Extraídos</h4>
    <p>Pipeline de scraping controlado y extracción de precios de imágenes de menús</p>
    <ul>
      <li><strong>Cobertura:</strong> ${kpis.menuCov} de restaurantes con precios extraídos</li>
      <li><strong>Metodología:</strong> Extracción via OCR/análisis de imágenes públicas de Google Maps, validación manual de muestra</li>
      <li><strong>Datasets:</strong> <code>items.json</code>, <code>price_stats.json</code>, <code>restaurants.json</code></li>
    </ul>
  </div>

  <div class="data-source">
    <h4>🗺️ Agregaciones Espaciales</h4>
    <ul>
      <li><strong>H3 Hexágonos</strong> (resolución 8, ~0.7 km²) — Agregación uniforme independiente de límites administrativos</li>
      <li><strong>Census Tracts</strong> — US Census Bureau 2020 — <a href="https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_13" target="_blank">Definición ↗</a></li>
    </ul>
  </div>

  <div class="data-source">
    <h4>⚖️ Mezcla de Fuentes</h4>
    <p>Ponderación ajustable entre datos de menú (0-100%) y Google price_level para análisis de sensibilidad</p>
  </div>

  <h3 style="margin-top: 2rem;">🔬 Notas Metodológicas</h3>
  <ul class="methodology-notes">
    <li>Los datos de Google Places <code>price_level</code> son categóricos (1=económico, 4=caro) y fueron normalizados a rangos USD aproximados para comparación.</li>
    <li>Los precios de menús son más precisos pero tienen menor cobertura espacial.</li>
    <li>La agregación H3 permite análisis multi-escala y comparaciones entre ciudades.</li>
    <li>Los filtros de umbral mínimo (min count) eliminan celdas con datos insuficientes para reducir ruido.</li>
    <li>Los datos de menús tienen cobertura parcial; las estimaciones asumen representatividad de la muestra.</li>
  </ul>

  <div class="update-date">
    <strong>📅 Última actualización:</strong> 29 de octubre de 2024
  </div>
</div>

---

<style>
/* Hero Section */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 2rem 1rem 3rem 1rem;
  text-align: center;
}
.hero h1 {
  font-size: 50px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin-bottom: 0.5em;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero h2 {
  font-size: 24px;
  font-weight: 500;
  color: var(--theme-foreground-muted);
  letter-spacing: -0.01em;
  margin: 0;
}

/* KPI Cards */
.kpi {
  background: var(--theme-background-alt);
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.kpi-title {
  font-size: 13px;
  color: var(--theme-foreground-muted);
  margin-bottom: 8px;
  font-weight: 500;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-foreground-focus);
}

/* Filters Section */
.filters-section {
  background: var(--theme-background-alt);
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
}

/* Map Container */
.map-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--theme-foreground-faint);
}

/* Insights Card */
.insights-card {
  background: var(--theme-background);
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}
.insights-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--theme-foreground);
}
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}
.insight-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--theme-background-alt);
  border-radius: 8px;
  border: 1px solid var(--theme-foreground-faint);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.insight-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.insight-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
}
.insight-content {
  flex: 1;
}
.insight-content strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--theme-foreground);
}
.insight-content p {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
  margin: 0;
}

/* Chart Cards */
.chart-card {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 12px;
}
.chart-header {
  margin-bottom: 1.5rem;
}
.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--theme-foreground);
}
.chart-description {
  font-size: 0.9rem;
  color: var(--theme-foreground-muted);
  margin: 0;
  line-height: 1.5;
}
.chart-note {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--theme-background-alt);
  border-radius: 6px;
  border-left: 3px solid var(--theme-foreground-focus);
}

/* Info Note */
.info-note {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--theme-background-alt);
  border-radius: 8px;
  border-left: 4px solid var(--theme-foreground-focus);
  line-height: 1.6;
}
.info-note .highlight {
  font-weight: 600;
  color: var(--theme-foreground-focus);
}

/* Section Headers */
.section-header {
  margin: 3rem 0 2rem 0;
  text-align: center;
}
.section-header h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--theme-foreground);
}
.section-subtitle {
  font-size: 1rem;
  color: var(--theme-foreground-muted);
  margin: 0;
  line-height: 1.5;
}

/* Methodology Card */
.methodology-card {
  background: var(--theme-background-alt);
  border-left: 4px solid var(--theme-foreground-focus);
  padding: 2rem;
  margin: 2rem 0;
  border-radius: 8px;
  line-height: 1.7;
}
.methodology-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--theme-foreground);
}
.methodology-card h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem 0;
  color: var(--theme-foreground);
}
.data-source {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--theme-foreground-faint);
}
.data-source:last-of-type {
  border-bottom: none;
}
.data-source p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--theme-foreground-muted);
}
.data-source ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  font-size: 0.9rem;
}
.data-source li {
  margin: 0.5rem 0;
  color: var(--theme-foreground-muted);
}
.data-source code {
  background: var(--theme-background);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.85em;
}
.methodology-notes {
  list-style: none;
  padding-left: 0;
}
.methodology-notes li {
  padding-left: 1.5rem;
  position: relative;
  margin: 0.75rem 0;
  font-size: 0.9rem;
  color: var(--theme-foreground-muted);
}
.methodology-notes li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: var(--theme-foreground-focus);
  font-weight: bold;
}
.update-date {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--theme-foreground-faint);
  font-size: 0.9rem;
  color: var(--theme-foreground-muted);
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }
  .hero h2 {
    font-size: 18px;
  }
  .insights-grid {
    grid-template-columns: 1fr;
  }
  .section-header h2 {
    font-size: 1.5rem;
  }
}
</style>
