---
title: Mapas y Hunger Index
theme: [glacier, wide]
sidebar: true
toc: false
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

```js
import { consumerCentricityMapMapbox } from "../../components/core/mapbox-base.js";
import hungerIndexMapbox from "../../components/maps/hunger-index-map.js";
import { MAP_DEFAULTS } from "../../config/maps.js";
```

<div class="hero">
  <h1>1.4 Mapas y Hunger Index</h1>
  <h2>Consumer Centricity Houston</h2>
</div>

```js
const roads = await FileAttachment("../../data/gis/houstonMetropolitan_functional_classification_2_3.geojson").json();
const demog = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const driveThru = await FileAttachment("../../data/gis/houstonCensusTracts_percentageDriveThru_RestTOT_4326.geojson").json();
const futureCongestion = await FileAttachment("../../data/gis/future_congestion.geojson").json();
const permanentCounters = await FileAttachment("../../data/gis/permanent_count_stations.geojson").json();
const educationFacilities = await FileAttachment("../../data/gis/educationFacilities_whiteHouston.geojson").json();
const fuelingStations = await FileAttachment("../../data/gis/fuelingStation_whiteHouston.geojson").json();
const restaurantes = await FileAttachment("../../data/gis/restaurantes.geojson").json();
const competencia = await FileAttachment("../../data/gis/restaurantCompetition_whitinWhiteHouston.geojson").json();
const pastekos = await FileAttachment("../../data/gis/pastekos.geojson").json();
```

```js
// Infer best property name for drive-thru percentage
const driveThruProp = (() => {
  const props = driveThru?.features?.[0]?.properties || {};
  const key = Object.keys(props).find((k) => /drive|thru|through|pct|perc/i.test(k));
  return key || "perc_drive_thru";
})();

const pointsLayers = {
  "Restaurantes": restaurantes,
  "Competencia": competencia,
  "Pastekos": pastekos,
  "Estaciones permanentes": permanentCounters,
  "Estaciones de servicio": fuelingStations,
  "Centros educativos": educationFacilities
};

const lineOverlays = [
  {
    data: futureCongestion,
    name: "Congestión futura",
    property: "FUT_CONG",
    styleMap: {
      "Uncongested": "#16a34a",
      "Moderately Congested": "#f59e0b",
      "Congested": "#dc2626",
      "Severely Congested": "#991b1b",
      "Heavily Congested": "#7f1d1d"
    },
    line: { widthDefault: 3, opacity: 0.85, cap: "round", join: "round" }
  }
];

// Centralized styling configuration per layer to simplify edits
const layerStyles = {
  "Demografía: White_vs_Total": {
    choropleth: { colors: ["#eff6ff", "#1d4ed8"], steps: 6, range: [0, 100], borderColor: "#1e3a8a", borderWidth: 0.75, fillOpacity: 0.6 }
  },
  "% Drive-through sobre restaurantes": {
    choropleth: { colors: ["#fff7ed", "#c2410c"], steps: 5, range: [0, 100] }
  },
  "Restaurantes": { point: { color: "#f97316", fillColor: "#fb923c", weight: 1 } },
  "Competencia": { point: { color: "#ef4444", fillColor: "#f87171", weight: 1 } },
  "Pastekos": { point: { color: "#a855f7", fillColor: "#c084fc", weight: 1.5 } },
  "Estaciones permanentes": { point: { color: "#2563eb", fillColor: "#60a5fa", weight: 2 } },
  "Estaciones de servicio": { point: { color: "#f59e0b", fillColor: "#fbbf24", weight: 1.5 } },
  "Centros educativos": { point: { color: "#6366f1", fillColor: "#818cf8", weight: 1 } }
};
```

```js
// JSON editable de títulos y descripciones por capa
// Agrega o modifica entradas según el nombre de la capa tal como aparece en el control del mapa
const layerDescriptions = {
  "Jerarquía vial": {
    title: "Jerarquía vial",
    description: "Red vial clasificada por F_SYSTEM, que corresponde a la clasificación funcional de las carreteras según su importancia y función dentro de la red de transporte (por ejemplo: arterias principales, colectoras, locales). Esta categorización es utilizada en sistemas de información geográfica (SIG) para la planificación y gestión vial. Fuente de datos: Geospatial Roadway Inventory Database (GRID), TxDOT."
  },
  "Demografía: White_vs_Total": {
    title: "Demografía: White_vs_Total",
    description: "Proporción de población blanca vs total por tracto censal. Su principal uso fue el de identificar zonas anglosajonas en la zona metropolitana de Houston, así como para inferir principales rutas de traslado entre ellas."
  },
  "% Drive-through sobre restaurantes": {
    title: "% Drive-through sobre restaurantes",
    description: "Porcentaje de restaurantes con servicio drive-through por tracto censal. Útil para evaluar la penetración del modelo QSR con drive-through en cada zona."
  },
  "Congestión futura": {
    title: "Congestión futura",
    description: "Proyecciones de congestión vial para el año 2043 según TxDOT. Las líneas se clasifican en cinco niveles: Uncongested (verde), Moderately Congested (naranja), Congested (rojo), Severely Congested (rojo oscuro) y Heavily Congested (marrón). Útil para planificar ubicaciones en corredores de alto flujo vehicular."
  },
  "Restaurantes": { 
    title: "Restaurantes", 
    description: "Todos los restaurantes en la zona metropolitana de Houston, incluyendo cadenas QSR, independientes, food trucks y cafeterías."
  },
  "Competencia": { 
    title: "Competencia", 
    description: "Restaurantes competidores directos e indirectos (empanadas, hand pies, comida rápida mexicana), incluyendo Pasteko."
  },
  "Pastekos": { 
    title: "Pastekos", 
    description: "Ubicaciones potenciales o existentes de Pastekos (competidor directo con producto similar de pastes) en Houston."
  },
  "Estaciones permanentes": { 
    title: "Estaciones permanentes", 
    description: "Estaciones permanentes de conteo de tráfico vehicular (TxDOT). Útil para correlacionar flujo de vehículos con ubicaciones estratégicas."
  },
  "Estaciones de servicio": { 
    title: "Estaciones de servicio", 
    description: "Gasolineras y estaciones de servicio. Alta correlación con puntos de conveniencia y tráfico vehicular para modelos drive-through."
  },
  "Centros educativos": { 
    title: "Centros educativos", 
    description: "Escuelas, universidades y centros de formación. Zonas de alto tráfico peatonal y vehicular en horarios específicos (entrada/salida de clases)."
  }
};
```

```js
const mapEl = consumerCentricityMapMapbox({
  center: MAP_DEFAULTS.center,
  zoom: MAP_DEFAULTS.zoom,
  mapboxToken: MAP_DEFAULTS.mapboxToken,
  mapboxStyle: MAP_DEFAULTS.mapboxStyle,
  roads: roads,
  demographics: demog,
  demographicProperty: "White_vs_Total",
  choropleths: [
    { data: demog, property: "White_vs_Total", name: "Demografía: White_vs_Total" },
    { data: driveThru, property: driveThruProp, name: "% Drive-through sobre restaurantes" }
  ],
  lineOverlays,
  pointsLayers,
  layerStyles,
  initialVisibleLayers: []
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${mapEl}
  </div>
</div>

```js
// Renderizar listado dinámico de capas visibles bajo el mapa
const layersList = (() => {
  const el = html`<div class="card"><h3 style="margin:0 0 8px 0;">Capas visibles</h3><ul style="margin:0;padding-left:18px;"></ul></div>`;
  const ul = el.querySelector("ul");
  const render = (visible) => {
    ul.innerHTML = "";
    if (!visible || visible.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Ninguna capa visible.";
      ul.appendChild(li);
      return;
    }
    for (const name of visible) {
      const meta = layerDescriptions[name] || { title: name, description: "" };
      const li = document.createElement("li");
      li.innerHTML = `<strong>${meta.title}</strong>${meta.description ? ` — ${meta.description}` : ""}`;
      ul.appendChild(li);
    }
  };
  mapEl.addEventListener("layerschange", (e) => render(e.detail?.visible || []));
  render([]); // estado inicial
  return el;
})();
```

<div class="grid grid-cols-1">
  <div class="card">
    ${layersList}
  </div>
</div>

<div class="hero">
  <h3>¿Qué puedes hacer aquí?</h3>
</div>

<div class="text">
  <ul>
    <li>Activar/desactivar capas: jerarquía vial, demografía por tracto censal, congestión futura, restaurantes, competencia y otros puntos estratégicos.</li>
    <li>Explorar zonas y abrir tooltips con detalles por elemento.</li>
    <li>Cambiar fácilmente la métrica demográfica editando <code>demographicProperty</code>.</li>
    <li>Las capas se organizan visualmente: coropletas (rellenos) en la base, líneas (vialidad y congestión) encima, y puntos de interés en la capa superior.</li>
  </ul>
</div>

---

<div class="hero">
  <h2>Hunger Index: Demanda Espacial y Temporal</h2>
  <h3>Mapa interactivo de densidad de oportunidad gastronómica</h3>
</div>

<div class="text">
  <p>El <strong>Hunger Index</strong> es un índice sintético (0-100) que estima la demanda potencial de alimentos en Houston, calculado a partir de datos de ocupación (Popular Times) de restaurantes. Este mapa muestra cómo varía geográficamente la demanda a lo largo de la semana (7 días × 24 horas).</p>
  <p>Usa los controles para:</p>
  <ul>
    <li><strong>Recorrer días y horas</strong>: Desliza los selectores para ver la distribución de hambre en diferentes momentos.</li>
    <li><strong>Alternar visualizaciones</strong>: Grid (malla de celdas coloreadas por índice), Heatmap (mapa de calor continuo) y Restaurantes (puntos individuales con clustering).</li>
    <li><strong>Cambiar paleta de colores</strong>: YlOrRd (amarillo-naranja-rojo), Viridis, Cividis, GoRR (verde-naranja-rojo).</li>
    <li><strong>Exportar datos</strong>: Descarga PNG del mapa actual, GeoJSON de la grilla con valores de hambre, o CSV con datos tabulares.</li>
  </ul>
</div>

```js
const restaurantsHouston = await FileAttachment("../../data/gis/restaurants_houston.geojson").json();
```

```js
const hungerMapEl = hungerIndexMapbox({
  center: MAP_DEFAULTS.center,
  zoom: MAP_DEFAULTS.zoom,
  mapboxToken: MAP_DEFAULTS.mapboxToken,
  mapboxStyle: MAP_DEFAULTS.mapboxStyle,
  restaurants: restaurantsHouston,
  cellSizeMeters: 500,
  normalization: { type: "quantile", ignoreZeros: true },
  palette: "YlOrRd",
  showGrid: true,
  showHeatmap: false,
  showRestaurants: false,
  throttleMs: 120
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${hungerMapEl}
  </div>
</div>

<div class="text">
  <p><strong>Interpretación:</strong></p>
  <ul>
    <li><strong>Colores cálidos (rojo/naranja)</strong>: Alta demanda potencial (muchos restaurantes con alta ocupación).</li>
    <li><strong>Colores fríos (amarillo/verde)</strong>: Baja demanda o baja ocupación.</li>
    <li><strong>Celdas vacías</strong>: Sin restaurantes en esa área.</li>
  </ul>
  <p>Este índice permite identificar <strong>corredores de alta demanda</strong> en horarios específicos (p.ej., zonas de oficinas a mediodía, zonas de entretenimiento por la noche), útil para planificar ubicación de puntos de venta, horarios de operación y estrategias de marketing geolocalizadas.</p>
</div>

---