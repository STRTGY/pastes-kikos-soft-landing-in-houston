---
title: Mapas y Hunger Index
theme: [glacier, wide]
sidebar: true
toc: false
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

```js
// Renderizar el componente de mapa (versión Mapbox)
import consumerCentricityMap from "../../components/consumer_centricity_map_mapbox.js";
```

## Consumer Centricity Houston

Título del mapa: Consumer Centricity Houston

```js
// Cargar datos GeoJSON locales
const roads = await FileAttachment("../../data/gis/houstonMetropolitan_functional_classification_2_3.geojson").json();
const demog = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const driveThru = await FileAttachment("../../data/gis/houstonCensusTracts_percentageDriveThru_RestTOT_4326.geojson").json();
const futureCongestion = await FileAttachment("../../data/gis/future_congestion.geojson").json();
const permanentCounters = await FileAttachment("../../data/gis/permanent_count_stations.geojson").json();
const educationFacilities = await FileAttachment("../../data/gis/educationFacilities_whiteHouston.geojson").json();
const fuelingStations = await FileAttachment("../../data/gis/fuelingStation_whiteHouston.geojson").json();
const pois = await FileAttachment("../../data/gis/whiteHouston_zonas_de_interes_polygon.geojson").json();
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
  "POIs relevantes": pois,
  "Restaurantes": restaurantes,
  "Competencia": competencia,
  "Pastes Kikos": pastekos,
  "Estaciones permanentes": permanentCounters,
  "Estaciones de servicio": fuelingStations,
  "Centros educativos": educationFacilities,
  "Congestión futura": futureCongestion
};

// Centralized styling configuration per layer to simplify edits
const layerStyles = {
  "Demografía: White_vs_Total": {
    choropleth: { colors: ["#eff6ff", "#1d4ed8"], steps: 6, range: [0, 100], borderColor: "#1e3a8a", borderWidth: 0.75, fillOpacity: 0.6 }
  },
  "% Drive-through sobre restaurantes": {
    choropleth: { colors: ["#fff7ed", "#c2410c"], steps: 5, range: [0, 100] }
  },
  "POIs relevantes": { point: { color: "#0f766e", fillColor: "#14b8a6", weight: 1, radiusBase: 2, radiusScale: 0.2, fillOpacity: 0.8 } },
  "Restaurantes": { point: { color: "#f97316", fillColor: "#fb923c", weight: 1 } },
  "Competencia": { point: { color: "#ef4444", fillColor: "#f87171", weight: 1 } },
  "Pastes Kikos": { point: { color: "#a855f7", fillColor: "#c084fc", weight: 1.5 } },
  "Estaciones permanentes": { point: { color: "#2563eb", fillColor: "#60a5fa", weight: 2 } },
  "Estaciones de servicio": { point: { color: "#f59e0b", fillColor: "#fbbf24", weight: 1.5 } },
  "Centros educativos": { point: { color: "#6366f1", fillColor: "#818cf8", weight: 1 } },
  "Congestión futura": { categories: { "Uncongested": "#16a34a", "Moderately Congested": "#f59e0b", "Congested": "#dc2626", "Severely Congested": "#991b1b", "Heavily Congested": "#7f1d1d" } }
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
    description: "Porcentaje de restaurantes con servicio drive-through por tracto."
  },
  "POIs relevantes": { title: "POIs relevantes", description: "" },
  "Restaurantes": { title: "Restaurantes", description: "" },
  "Competencia": { title: "Competencia", description: "" },
  "Pastes Kikos": { title: "Pastes Kikos", description: "" },
  "Estaciones permanentes": { title: "Estaciones permanentes", description: "" },
  "Estaciones de servicio": { title: "Estaciones de servicio", description: "" },
  "Centros educativos": { title: "Centros educativos", description: "" },
  "Congestión futura": { title: "Congestión futura", description: "" }
};
```

```js
// Instanciar el mapa y exponer el elemento para escuchar eventos de visibilidad de capas
const mapEl = consumerCentricityMap({
  center: [29.7604, -95.3698],
  zoom:10,
  roads: roads,
  demographics: demog,
  demographicProperty: "White_vs_Total",
  choropleths: [
    { data: demog, property: "White_vs_Total", name: "Demografía: White_vs_Total" },
    { data: driveThru, property: driveThruProp, name: "% Drive-through sobre restaurantes" }
  ],
  pointsLayers,
  layerStyles,
  size: {height: 720},
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw"
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

### ¿Qué puedes hacer aquí?
- Activar/desactivar capas: jerarquía vial, demografía por tracto censal y puntos de interés.
- Explorar zonas y abrir tooltips con detalles por elemento.
- Cambiar fácilmente la métrica demográfica editando `demographicProperty`.