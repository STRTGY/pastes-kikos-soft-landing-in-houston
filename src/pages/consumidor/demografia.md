---
title: Demografía y Comportamiento
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

```js
// Cargar datos GeoJSON locales
const whitePOBvsPOBTOT_houston = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const driveThru = await FileAttachment("../../data/gis/houstonCensusTracts_percentageDriveThru_RestTOT_4326.geojson").json();
const educationFacilities = await FileAttachment("../../data/gis/educationFacilities_whiteHouston.geojson").json();
const fuelingStations = await FileAttachment("../../data/gis/fuelingStation_whiteHouston.geojson").json();
const clustersWhiteHouston = await FileAttachment("../../data/gis/whiteHouston_zonas_de_interes_polygon.geojson").json();
const restaurantes = await FileAttachment("../../data/gis/restaurantes.geojson").json();
const competencia = await FileAttachment("../../data/gis/restaurantCompetition_whitinWhiteHouston.geojson").json();
const pastekos = await FileAttachment("../../data/gis/pastekos.geojson").json();
```

## 1.4 Demografía y Comportamiento

Aquí se presentan las características sociodemográficas de la ciudad y sus implicaciones de consumo. Se consideran variables de edad, ingresos, origen étnico y estilos de vida, con énfasis en los segmentos anglosajón y latino. También se revisan patrones de movilidad, zonas de mayor crecimiento poblacional y el papel del clima en la elección de formatos de compra (especialmente drive-through). El objetivo es mapear el perfil del consumidor potencial y los entornos donde se concentra.