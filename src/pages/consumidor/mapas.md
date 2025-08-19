---
title: Mapas y Hunger Index
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

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

// Renderizar el componente de mapa
import {consumerCentricityMap} from "../../components/consumer_centricity_map.js";

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
```

<div class="grid grid-cols-1">
  <div class="card">
    ${consumerCentricityMap({
      center: [29.7604, -95.3698],
      zoom: 10,
      roads: roads,
      demographics: demog,
      demographicProperty: "White_vs_Total",
      choropleths: [
        { data: demog, property: "White_vs_Total", name: "Demografía: White_vs_Total", colors: ["#eff6ff", "#1d4ed8"] },
        { data: driveThru, property: driveThruProp, name: "% Drive-through sobre restaurantes", colors: ["#fff7ed", "#c2410c"] }
      ],
      pointsLayers,
      size: {height: 720}
    })}
  </div>
  
</div>

### ¿Qué puedes hacer aquí?
- Activar/desactivar capas: jerarquía vial, demografía por tracto censal y puntos de interés.
- Explorar zonas y abrir tooltips con detalles por elemento.
- Cambiar fácilmente la métrica demográfica editando `demographicProperty`.