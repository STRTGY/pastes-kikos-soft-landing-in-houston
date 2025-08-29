---
title: Ubicaciones Relevantes
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

# 1.1 Ubicaciones Relevantes

Esta sección identifica las zonas estratégicas dentro de Houston que concentran mayor potencial para la instalación de un concepto de comida rápida como Pastes Kikos. Se analizan corredores gastronómicos, distritos comerciales, centros de entretenimiento, áreas residenciales densas y puntos de alto flujo peatonal y vehicular. El objetivo es entender cómo la geografía urbana condiciona las oportunidades de mercado y delimitar las microzonas prioritarias para expansión.

Se identificaron los barrios con mayoría de población anglosajona, zonas de alta densidad problacional, corredores gastronómicos, vialidades más importantes en cuánto a tráfico y abundancia de restaurantes con Drive-thru

## Población anglosajona

```js
// Importar el componente específico para el mapa de población anglosajona
import pobAngloMap from "../../components/11_1_pob_anglo_map.js";
```

```js
// Instanciar el mapa (solo capa: Demografía White_vs_Total)
const demog = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const pobAngloEl = await pobAngloMap({
  center: [29.7604, -95.3698],
  zoom: 10,
  size: { height: 720 },
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw",
  demog
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${pobAngloEl}
  </div>
</div>


Con base en el mapa, se observa una mayor concentración de población anglosajona en los anillos suburbanos del oeste y noroeste de Houston, con continuidad hacia el suroeste. Destacan zonas como Katy–Cinco Ranch y el corredor de I‑10 West (Energy Corridor, Memorial, CityCentre), Cypress–Jersey Village y el eje de US‑290, así como Sugar Land y áreas adyacentes a US‑59. Estas áreas aparecen en tonos más oscuros. Por el contrario, el centro, el este y sureste (Downtown/EaDo, Pasadena y entorno) muestran menor proporción relativa, reflejada en tonos más claros.

Adicionalmente, dentro del eje centro‑occidental se identifican Spring Valley Village, Bunker Hill Village, Hunters Creek Village, Greenway, West University Place, Bellaire y partes de Midtown como bolsillos con alta proporción de población anglosajona, conectados por los corredores de Memorial Dr., Buffalo Bayou y US‑59/I‑69. Este corredor combina residencial consolidado y empleo de oficinas y salud, con alto poder adquisitivo y densa población flotante entre semana.

Implicaciones para selección de microzonas de entrada:

- **I‑10 West (Energy Corridor–Memorial–CityCentre)**: alto poder adquisitivo y flujo laboral/vehicular.
- **Corredor centro‑occidental (Spring Valley–Bunker Hill–Hunters Creek–Greenway–West U–Bellaire–Midtown)**: alta proporción anglosajona y gasto; densidad diurna por oficinas y hospitales; óptimo para ubicaciones de alto flujo con acceso peatonal y vehicular.
- **Cypress / US‑290**: crecimiento residencial con centros comerciales de destino y strip centers.
- **Katy–Cinco Ranch / Grand Pkwy (SH‑99)**: familias y desarrollos master‑planned; buena tracción para formato drive‑thru.
- **Sugar Land (US‑59)**: mezcla de oficinas y residencial consolidado; alto ticket potencial.

Recomendaciones operativas: priorizar ubicaciones con salida directa a arterias principales, facilidad de giro para drive‑thru, co‑ubicación con anclas de supermercado y escuelas/iglesias cercanas; ajustar comunicación de marca para familias y trabajadores de oficina, manteniendo oferta bilingüe.

## Restaurantes

```js
// Importar componente de restaurantes
import restaurantesMap from "../../components/11_2_restaurantes.js";
```

```js
// Cargar geojson de restaurantes y renderizar mapa con tres modos: todos, por categoría, heatmap
const restaurantes = await FileAttachment("../../data/gis/restaurantes.geojson").json();

const restaurantesEl = await restaurantesMap({
  center: [29.7604, -95.3698],
  zoom: 10,
  size: { height: 720 },
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw",
  restaurants: restaurantes
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${restaurantesEl}
  </div>
</div>

Para el análisis de Houston, se extrajeron +7300 restaurantes en el área metropolitana de Houston. Con información relacionada con rango de precios, ubicación geográfica, categoría, reseñas y otras variables capturadas por Google Maps. 

### Restaurantes de categorías que compiten

```js
// Importar componente de restaurantes competencia
import restaurantesCompetenciaMap from "../../components/11_3_restaurantes_competencia.js";
```

```js
// Cargar geojson de competencia y renderizar mapa con tres modos: todos, por categoría, heatmap
const competition = await FileAttachment("../../data/gis/restaurantCompetition_whitinWhiteHouston.geojson").json();

const restaurantesCompEl = await restaurantesCompetenciaMap({
  center: [29.7604, -95.3698],
  zoom: 10,
  size: { height: 720 },
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw",
  competition
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${restaurantesCompEl}
  </div>
</div>

### Restaurantes con Drive-thru

```js
// Importar componente de restaurantes con split por Drive-thru
import restaurantesDriveThruMap from "../../components/11_4_restaurantes_drive_thru.js";
```

```js
// Cargar todos los restaurantes de Houston
const restaurantesHouston = await FileAttachment("../../data/gis/restaurantes.geojson").json();

const restaurantesDriveThruEl = await restaurantesDriveThruMap({
  center: [29.7604, -95.3698],
  zoom: 10,
  size: { height: 720 },
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw",
  restaurants: restaurantesHouston
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${restaurantesDriveThruEl}
  </div>
</div>

### Vialidades relevantes

### Vialidades con mayor tráfico