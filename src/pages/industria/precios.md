---
title: Análisis de Precios - Industria Restaurantera
toc: false
---

```js
import mapboxgl from "npm:mapbox-gl@3";
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
  label: html`Mezcla de fuentes: <span style="color: #e67e22; font-weight: 600;">Menú ${d3.format(".0f")(weightMenu)}%</span> / <span style="color: #3498db; font-weight: 600;">Google ${d3.format(".0f")(100 - weightMenu)}%</span>`
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
// NEW: Función para mezclar valores de menú y Google basado en peso
function mixedValue(props, metric, weight) {
  const w = weight / 100; // Convertir 0-100 a 0-1
  const mMenu = props[`${metric}_menu`];
  const mGoogle = props[`${metric}_google`];
  
  // Si solo hay un valor disponible, usarlo
  if (mMenu == null && mGoogle == null) return null;
  if (mMenu == null) return mGoogle;
  if (mGoogle == null) return mMenu;
  
  // Mezcla ponderada
  return w * mMenu + (1 - w) * mGoogle;
}

// Función para filtrar datos por categoría y umbral mínimo
function filterData(geojson, category, minN) {
  if (!geojson || !geojson.features) return {type: "FeatureCollection", features: []};
  
  let filtered = geojson.features;
  
  // Filtrar por categoría si no es "overall"
  if (category !== "overall") {
    filtered = filtered.filter(f => f.properties.category_main === category);
  }
  
  // Filtrar por count mínimo (considerar ambas fuentes)
  filtered = filtered.filter(f => {
    const nGoogle = f.properties.n_google || 0;
    const nMenu = f.properties.n_menu || 0;
    return (nGoogle + nMenu) >= minN;
  });
  
  return {type: "FeatureCollection", features: filtered};
}
```

```js
// Seleccionar dataset según filtros (usar datos enriquecidos)
const currentData = (() => {
  const isH3 = aggregationView === "H3 Hexágonos";
  const isOverall = selectedCategory === "overall";
  
  let rawData;
  if (isH3 && isOverall) rawData = hexEnriched;
  else if (isH3 && !isOverall) rawData = hexByCategory;
  else if (!isH3 && isOverall) rawData = tractsEnriched;
  else rawData = tractsByCategory;
  
  return filterData(rawData, selectedCategory, minCount);
})();
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
// NEW: Calculate color breaks based on selected scale
function calculateColorBreaks(values, scale, numBreaks = 5) {
  const sorted = values.filter(v => v != null).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  
  if (scale === "quantile") {
    const breaks = [];
    for (let i = 0; i <= numBreaks; i++) {
      const idx = Math.floor((i / numBreaks) * (sorted.length - 1));
      breaks.push(sorted[idx]);
    }
    return breaks;
  } else if (scale === "equal") {
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const step = (max - min) / numBreaks;
    return Array.from({length: numBreaks + 1}, (_, i) => min + i * step);
  } else if (scale === "stdev") {
    const mean = d3.mean(sorted);
    const std = d3.deviation(sorted);
    return [
      mean - 2 * std,
      mean - std,
      mean,
      mean + std,
      mean + 2 * std
    ].filter(v => v >= sorted[0] && v <= sorted[sorted.length - 1]);
  }
  return [];
}

// Mapa Mapbox mejorado con métrica ponderada y leyenda
function createMap(container, data, metric, weight, scale) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const map = new mapboxgl.Map({
    container,
    style: MAPBOX_STYLE,
    center: [-95.3698, 29.7604],
    zoom: 9.5
  });
  
  map.on("load", () => {
    // Calcular valores mezclados para cada feature
    const enrichedData = {
      ...data,
      features: data.features.map(f => ({
        ...f,
        properties: {
          ...f.properties,
          mixed_value: mixedValue(f.properties, metric, weight)
        }
      }))
    };
    
    // Agregar source
    map.addSource("pricing-data", {
      type: "geojson",
      data: enrichedData
    });
    
    // Calcular breaks de color
    const values = enrichedData.features.map(f => f.properties.mixed_value).filter(v => v != null);
    const colorBreaks = calculateColorBreaks(values, scale, 5);
    
    // Color scale: OrRd (perceptual)
    const colorPalette = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];
    
    // Build color expression for Mapbox
    const colorExpression = ["case"];
    for (let i = 0; i < colorBreaks.length - 1; i++) {
      colorExpression.push(
        ["all",
          [">=", ["get", "mixed_value"], colorBreaks[i]],
          ["<", ["get", "mixed_value"], colorBreaks[i + 1]]
        ],
        colorPalette[i]
      );
    }
    colorExpression.push(colorPalette[colorPalette.length - 1]); // Default color
    
    // Agregar layer de relleno
    map.addLayer({
      id: "pricing-fill",
      type: "fill",
      source: "pricing-data",
      paint: {
        "fill-color": colorExpression,
        "fill-opacity": 0.7
      }
    });
    
    // Agregar borde
    map.addLayer({
      id: "pricing-outline",
      type: "line",
      source: "pricing-data",
      paint: {
        "line-color": "#374151",
        "line-width": 0.5,
        "line-opacity": 0.8
      }
    });
    
    // Agregar leyenda
    const legend = document.createElement("div");
    legend.style.cssText = `
      position: absolute;
      bottom: 30px;
      right: 10px;
      background: white;
      padding: 10px 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font: 11px/1.5 system-ui;
      z-index: 1;
    `;
    legend.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 6px;">Precio (USD)</div>
      ${colorBreaks.slice(0, -1).map((val, i) => `
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="width: 20px; height: 14px; background: ${colorPalette[i]}; margin-right: 6px; border: 1px solid #ddd;"></div>
          <span>$${val.toFixed(2)} – $${colorBreaks[i + 1].toFixed(2)}</span>
        </div>
      `).join("")}
    `;
    container.appendChild(legend);
    
    // Popup para tooltips
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    
    // Eventos del mouse
    map.on("mousemove", "pricing-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      
      const props = e.features[0].properties;
      const nGoogle = props.n_google || 0;
      const nMenu = props.n_menu || 0;
      const priceGoogle = props.price_mean_google;
      const priceMenu = props.price_mean_menu;
      const priceMixed = props.mixed_value;
      
      const topRestsGoogle = (props.top_restaurants || "").split(";;").filter(r => r).slice(0, 3);
      const topRestsMenu = (props.top_restaurants_menu || "").split(";;").filter(r => r).slice(0, 3);
      
      const html = `
        <div style="font: 13px/1.4 system-ui; max-width: 320px;">
          <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #111827;">
            ${aggregationView === "H3 Hexágonos" ? "Hexágono" : "Tract"} ${props.hex_id || props.GEOID || ""}
          </div>
          <div style="margin-bottom: 8px; padding: 6px; background: #f3f4f6; border-radius: 3px;">
            <strong>Precio mezclado (${weight}% menú):</strong> $${priceMixed ? priceMixed.toFixed(2) : "N/A"}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div style="padding: 6px; background: #fef3c7; border-radius: 3px;">
              <div style="font-weight: 600; color: #e67e22;">Google (${nGoogle})</div>
              <div>$${priceGoogle ? priceGoogle.toFixed(2) : "N/A"}</div>
            </div>
            <div style="padding: 6px; background: #dbeafe; border-radius: 3px;">
              <div style="font-weight: 600; color: #3498db;">Menú (${nMenu})</div>
              <div>$${priceMenu ? priceMenu.toFixed(2) : "N/A"}</div>
            </div>
          </div>
          ${topRestsMenu.length > 0 ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="font-weight: 600; margin-bottom: 4px; font-size: 11px;">Top 3 (menú):</div>
              <ul style="margin: 0; padding-left: 18px; font-size: 10px;">
                ${topRestsMenu.map(r => {
                  const [name, price] = r.split("|");
                  return `<li style="margin: 2px 0;">${name} (${price || "N/A"})</li>`;
                }).join("")}
              </ul>
            </div>
          ` : ""}
        </div>
      `;
      
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    
    map.on("mouseleave", "pricing-fill", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  });
  
  return map;
}
```

```js
const mapContainer = display((() => {
  const div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "700px";
  div.style.borderRadius = "8px";
  div.style.overflow = "hidden";
  div.style.position = "relative";
  
  // Crear mapa después de que el div esté en el DOM
  requestAnimationFrame(() => {
    createMap(div, currentData, selectedMetric, weightMenu, colorScale);
  });
  
  return div;
})());
```

<div class="hero">
  <h1>2.2 Análisis de Precios</h1>
  <h2>Distribución espacial de precios en la industria restaurantera de Houston</h2>
</div>

<div class="grid grid-cols-4" style="margin-bottom: 2rem;">
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Total Restaurantes</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.total}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Precio Promedio Ciudad</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.cityMean}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Cobertura Price Level</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.priceLevelCov}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Cobertura Menú</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.menuCov}</div>
  </div>
</div>

```js
// Calculate coverage statistics for the enriched data
const coverageStats = (() => {
  const isH3 = aggregationView === "H3 Hexágonos";
  const features = isH3 ? hexEnriched.features : tractsEnriched.features;
  
  const withGoogle = features.filter(f => (f.properties.n_google || 0) > 0).length;
  const withMenu = features.filter(f => (f.properties.n_menu || 0) > 0).length;
  const withBoth = features.filter(f => (f.properties.n_google || 0) > 0 && (f.properties.n_menu || 0) > 0).length;
  
  const totalCells = features.length;
  const pctWithMenu = ((withMenu / totalCells) * 100).toFixed(1);
  const pctWithBoth = ((withBoth / totalCells) * 100).toFixed(1);
  
  // Average items per cell
  const totalMenuItems = features.reduce((sum, f) => sum + (f.properties.n_menu || 0), 0);
  const avgItemsPerCell = (totalMenuItems / Math.max(withMenu, 1)).toFixed(1);
  
  return {withGoogle, withMenu, withBoth, totalCells, pctWithMenu, pctWithBoth, avgItemsPerCell};
})();
```

<div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h3 style="margin-top: 0; color: white; font-size: 18px;">📊 Estadísticas de Cobertura de Datos</h3>
  <div class="grid grid-cols-3" style="gap: 1rem;">
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Celdas con datos de menú</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.pctWithMenu}%</div>
      <div style="font-size: 11px; opacity: 0.8;">${coverageStats.withMenu} de ${coverageStats.totalCells}</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Celdas con ambas fuentes</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.pctWithBoth}%</div>
      <div style="font-size: 11px; opacity: 0.8;">${coverageStats.withBoth} celdas</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Items promedio/celda</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.avgItemsPerCell}</div>
      <div style="font-size: 11px; opacity: 0.8;">items de menú</div>
    </div>
  </div>
</div>

<div class="card" style="margin-bottom: 2rem;">
  <h3 style="margin-top: 0;">Filtros y Controles</h3>
  <div class="grid grid-cols-2" style="gap: 1.5rem;">
    <div>${aggregationView}</div>
    <div>${selectedMetric}</div>
    <div>${selectedCategory}</div>
    <div>${minCount}</div>
  </div>
  <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--theme-foreground-faint);">
    <h4 style="margin: 0 0 1rem 0; font-size: 15px; font-weight: 600;">Mezcla de Fuentes de Datos</h4>
    <div style="margin-bottom: 1rem;">${weightMenu}</div>
    <div class="grid grid-cols-2" style="gap: 1.5rem;">
      <div>${colorScale}</div>
      <div>${showLayer}</div>
    </div>
  </div>
</div>

<div class="card">
  ${mapContainer}
</div>

<div class="grid grid-cols-1" style="margin-top: 2rem;">
  <div class="card">
    <h3>Mejoras y Hallazgos Clave</h3>
    <ul>
      <li><strong>💡 Mezcla ajustable de fuentes:</strong> Control deslizante que permite ajustar el peso entre datos de menú (0-100%) y Google price_level, visualizando la integración en tiempo real.</li>
      <li><strong>📊 Escalas de color perceptuales:</strong> Tres métodos de clasificación (cuantiles, igual intervalo, desviaciones estándar) con leyenda dinámica para mejor interpretación.</li>
      <li><strong>🗺️ Agregación espacial dual:</strong> Hexágonos H3 (res 8, ~0.7 km²) y Census tracts permiten analizar patrones a escalas geográficas complementarias.</li>
      <li><strong>🎯 Tooltips enriquecidos:</strong> Comparación lado a lado de precios Google vs. Menú, con conteos independientes y top 3 restaurantes más caros por zona.</li>
      <li><strong>📈 Cobertura de datos:</strong> ${kpis.priceLevelCov} de restaurantes con price_level de Google, ${kpis.menuCov} con precios extraídos de menús, permitiendo análisis complementarios.</li>
      <li><strong>🔍 Filtros dinámicos:</strong> Por categoría de restaurante, métrica (promedio/mediana), umbral mínimo de cobertura y tipo de visualización.</li>
    </ul>
  </div>
</div>

${selectedCategory !== "overall" ? html`<div class="card" style="margin-top: 2rem;">
  <h3>Resumen de Categoría: ${selectedCategory}</h3>
  ${(() => {
    const catData = categorySummary.find(d => d.category === selectedCategory);
    if (!catData) return html`<p>No hay datos disponibles para esta categoría.</p>`;
    return html`<div class="grid grid-cols-3">
      <div class="kpi">
        <div class="kpi-title">Restaurantes</div>
        <div class="kpi-value">${catData.count}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Precio Promedio</div>
        <div class="kpi-value">${catData.price_mean?.toFixed(2)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Precio Mediana</div>
        <div class="kpi-value">${catData.price_median?.toFixed(2)}</div>
      </div>
    </div>`;
  })()}
</div>` : html``}

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
```

<div class="card" style="margin-top: 2rem;">
  <h3>Comparación de Distribuciones: Menú vs. Mezcla Ponderada</h3>
  <p style="color: var(--theme-foreground-muted); margin-bottom: 1rem;">
    Esta visualización compara la distribución de precios de los items de menú (azul) contra la distribución ponderada actual (naranja) según el slider de mezcla (${weightMenu}% menú).
  </p>
  ${(() => {
    // Prepare data: get all cell-level prices
    const cellPrices = currentData.features.map(f => {
      const menuPrice = f.properties.price_mean_menu;
      const mixedPrice = mixedValue(f.properties, "price_mean", weightMenu);
      return {menuPrice, mixedPrice};
    }).filter(d => d.menuPrice != null || d.mixedPrice != null);
    
    // Filter outliers for better visualization
    const menuPrices = cellPrices.map(d => d.menuPrice).filter(v => v != null);
    const mixedPrices = cellPrices.map(d => d.mixedPrice).filter(v => v != null);
    
    const menuQ75 = d3.quantile(menuPrices.sort((a, b) => a - b), 0.75);
    const menuQ25 = d3.quantile(menuPrices, 0.25);
    const menuIQR = menuQ75 - menuQ25;
    const menuUpper = menuQ75 + 1.5 * menuIQR;
    
    const filteredMenu = cellPrices.filter(d => d.menuPrice != null && d.menuPrice <= menuUpper)
      .map(d => ({value: d.menuPrice, source: "Menú"}));
    const filteredMixed = cellPrices.filter(d => d.mixedPrice != null && d.mixedPrice <= menuUpper)
      .map(d => ({value: d.mixedPrice, source: "Mezcla ponderada"}));
    
    const combined = [...filteredMenu, ...filteredMixed];
    
    return Plot.plot({
      height: 300,
      marginBottom: 60,
      x: {
        label: "Precio promedio por celda (USD)",
        grid: true
      },
      y: {
        label: "Frecuencia",
        grid: true
      },
      color: {
        domain: ["Menú", "Mezcla ponderada"],
        range: ["#3498db", "#e67e22"],
        legend: true
      },
      marks: [
        Plot.rectY(combined, Plot.binX({y: "count"}, {
          x: "value",
          fill: "source",
          thresholds: 30,
          opacity: 0.6
        })),
        Plot.ruleY([0])
      ]
    });
  })()}
  <p style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    💡 <strong>Interpretación:</strong> Ajusta el slider de mezcla arriba para ver cómo cambia la distribución naranja. 
    Con 100% menú, las distribuciones son idénticas; con 0%, muestra solo datos de Google.
  </p>
</div>

---

## Análisis de Precios de Menús Extraídos

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
```

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

<div class="card" style="margin-top: 3rem;">
  <h2>Precios Extraídos de Menús</h2>
  <p>Análisis detallado de ${menuKpis.totalItems.toLocaleString()} items de menú extraídos de ${menuKpis.restaurants} restaurantes.</p>
  
  <div class="grid grid-cols-4" style="margin-top: 1.5rem;">
    <div class="kpi">
      <div class="kpi-title">Mediana Global</div>
      <div class="kpi-value">$${menuKpis.medianPrice.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Rango Intercuartílico</div>
      <div class="kpi-value">$${menuKpis.p25.toFixed(2)} - $${menuKpis.p75.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Precio Mínimo</div>
      <div class="kpi-value">$${menuKpis.minPrice.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Precio Máximo</div>
      <div class="kpi-value">$${menuKpis.maxPrice.toFixed(2)}</div>
    </div>
  </div>
</div>

<div class="card" style="margin-top: 2rem;">
  <h3>Distribución Global de Precios</h3>
  <div style="margin-bottom: 1rem;">
    <div class="grid grid-cols-2">
      <div>${selectedCategoryMenu}</div>
      <div>${showOutliers} ${logScale}</div>
    </div>
  </div>
  ${(() => {
    let data = menuItems.filter(d => d.price_amount != null);
    
    // Filtrar por categoría
    if (selectedCategoryMenu !== "all") {
      data = data.filter(d => d.category === selectedCategoryMenu);
    }
    
    // Filtrar outliers si está desactivado
    if (!showOutliers) {
      const stats = selectedCategoryMenu === "all" 
        ? priceStats.overall 
        : (priceStats.by_category || []).find(c => c.category === selectedCategoryMenu);
      if (stats) {
        const iqr = stats.p75 - stats.p25;
        const lower = stats.p25 - 1.5 * iqr;
        const upper = stats.p75 + 1.5 * iqr;
        data = data.filter(d => d.price_amount >= lower && d.price_amount <= upper);
      }
    }
    
    return Plot.plot({
      height: 350,
      marginBottom: 60,
      x: {
        label: "Precio (USD)",
        type: logScale ? "log" : "linear",
        grid: true
      },
      y: {
        label: "Frecuencia",
        grid: true
      },
      marks: [
        Plot.rectY(data, Plot.binX({y: "count"}, {
          x: "price_amount",
          fill: "steelblue",
          thresholds: logScale ? 40 : 50,
          tip: true
        })),
        Plot.ruleY([0])
      ]
    });
  })()}
</div>

<div class="card" style="margin-top: 2rem;">
  <h3>Comparativa por Restaurante (Top 30)</h3>
  ${(() => {
    // Obtener top 30 restaurantes por número de items
    const restaurantData = (priceStats.by_restaurant || [])
      .filter(d => d.count >= 5) // Al menos 5 items
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
    
    return Plot.plot({
      height: 600,
      marginLeft: 200,
      x: {
        label: "Precio (USD)",
        grid: true
      },
      y: {
        label: null
      },
      marks: [
        // IQR bars
        Plot.barX(restaurantData, {
          x1: "p25",
          x2: "p75",
          y: "restaurant",
          fill: "#bfdbfe",
          sort: {y: "x", reverse: true}
        }),
        // Median dots
        Plot.dot(restaurantData, {
          x: "median",
          y: "restaurant",
          fill: "steelblue",
          r: 4,
          tip: true,
          title: d => `${d.restaurant}\nMediana: $${d.median.toFixed(2)}\nIQR: $${d.p25.toFixed(2)} - $${d.p75.toFixed(2)}\nItems: ${d.count}`
        }),
        Plot.ruleX([0])
      ]
    });
  })()}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Las barras azul claro representan el rango intercuartílico (IQR), y los puntos azul oscuro la mediana de precios. 
    Restaurantes ordenados por mediana de precio.
  </p>
</div>

<div class="card" style="margin-top: 2rem;">
  <h3>Productos con Mayor Variación de Precio</h3>
  ${(() => {
    const topVariation = (priceStats.by_product || []).slice(0, 15);
    
    return html`<div>
      ${Plot.plot({
        height: 400,
        marginLeft: 180,
        x: {
          label: "IQR (Rango Intercuartílico en USD)",
          grid: true
        },
        y: {
          label: null
        },
        marks: [
          Plot.barX(topVariation, {
            x: "iqr",
            y: "product_norm",
            fill: "iqr",
            sort: {y: "-x"},
            tip: true,
            title: d => `${d.product_norm}\nIQR: $${d.iqr.toFixed(2)}\nMediana: $${d.median.toFixed(2)}\nRestaurantes: ${d.count}`
          }),
          Plot.ruleX([0])
        ],
        color: {
          scheme: "Oranges"
        }
      })}
      <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
        Estos productos muestran la mayor variación de precio entre restaurantes, indicando diferentes posicionamientos o calidades.
      </p>
    </div>`;
  })()}
</div>

<div class="card" style="margin-top: 2rem;">
  <h3>Precios por Categoría</h3>
  ${(() => {
    const categoryData = (priceStats.by_category || [])
      .filter(d => d.count >= 10) // Al menos 10 items
      .sort((a, b) => b.median - a.median);
    
    return Plot.plot({
      height: 400,
      marginLeft: 120,
      x: {
        label: "Precio (USD)",
        grid: true
      },
      y: {
        label: null
      },
      marks: [
        // IQR bars
        Plot.barX(categoryData, {
          x1: "min",
          x2: "max",
          y: "category",
          fill: "#fed7aa",
          sort: {y: "x", reverse: true}
        }),
        // Median dots
        Plot.dot(categoryData, {
          x: "median",
          y: "category",
          fill: "darkorange",
          r: 5,
          tip: true,
          title: d => `${d.category}\nMediana: $${d.median.toFixed(2)}\nRango: $${d.min.toFixed(2)} - $${d.max.toFixed(2)}\nItems: ${d.count}`
        }),
        Plot.ruleX([0])
      ]
    });
  })()}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Comparación de precios medianos y rangos intercuartílicos por categoría de comida.
  </p>
</div>

---

## Fuentes y Metodología

<div style="
  background: var(--theme-background-alt);
  border-left: 4px solid #1f77b4;
  padding: 1.25rem;
  margin: 2rem 0;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.7;
">

### Fuentes de Datos

- **Google Places API** — Datos de restaurantes (price_level, ratings, categorías) — <a href="https://developers.google.com/maps/documentation/places/web-service" target="_blank">Google Places Documentation</a>
  - **Cobertura:** ~${kpis.priceLevelCov} de restaurantes con `price_level` (escala 1-4)
  - **Limitaciones:** Price level es categórico; no refleja precios exactos de items
- **Datos de menús extraídos** — Pipeline de scraping controlado y extracción de precios de imágenes de menús
  - **Cobertura:** ${kpis.menuCov} de restaurantes con precios extraídos de menús
  - **Metodología:** Extracción via OCR/análisis de imágenes públicas de Google Maps, validación manual de muestra
  - **Datasets:** `data/menu/items.json`, `data/menu/price_stats.json`, `data/menu/restaurants.json`
- **Agregaciones espaciales**
  - **H3 Hexágonos** (resolución 8, ~0.7 km²) — Agregación uniforme independiente de límites administrativos
  - **Census Tracts** — US Census Bureau 2020 — <a href="https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_13" target="_blank">Definición Census Tracts</a>
- **Mezcla de fuentes (slider):** Ponderación ajustable entre datos de menú (0-100%) y Google price_level para análisis de sensibilidad
- **Limitaciones:** Los datos de menús tienen cobertura parcial; las estimaciones asumen representatividad de la muestra; Popular Times no disponible vía API oficial

### Notas Metodológicas

- Los datos de Google Places `price_level` son categóricos (1=económico, 4=caro) y fueron normalizados a rangos USD aproximados para comparación.
- Los precios de menús son más precisos pero tienen menor cobertura espacial.
- La agregación H3 permite análisis multi-escala y comparaciones entre ciudades.
- Los filtros de umbral mínimo (min count) eliminan celdas con datos insuficientes para reducir ruido.

### Fecha de Actualización

**Última actualización:** 29 de octubre de 2024

</div>

---

<style>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 1.5rem 1rem 2rem 1rem;
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
.kpi {
  background: var(--theme-background-alt);
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
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
</style>
