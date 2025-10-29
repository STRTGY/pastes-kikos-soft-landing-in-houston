---
title: Ubicaciones Relevantes
theme: [glacier, wide]
sidebar: true
toc: false
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

<div class="hero">
  <h1 id="1-1-ubicaciones-relevantes">1.1 Ubicaciones Relevantes</h1>
</div>

<div class="text">
  <p>Esta sección identifica las zonas estratégicas dentro de Houston que concentran mayor potencial para la instalación de un concepto de comida rápida como Pastes Kikos. Se analizan corredores gastronómicos, distritos comerciales, centros de entretenimiento, áreas residenciales densas y puntos de alto flujo peatonal y vehicular. El objetivo es entender cómo la geografía urbana condiciona las oportunidades de mercado y delimitar las microzonas prioritarias para expansión.</p>
  <p>Se identificaron los barrios con mayoría de población anglosajona, zonas de alta densidad problacional, corredores gastronómicos, vialidades más importantes en cuánto a tráfico y abundancia de restaurantes con Drive-thru</p>
</div>

<div class="hero">
  <h2 id="poblacion-anglosajona">Población anglosajona</h2>
</div>

```js
import demographicsMap from "../../components/maps/demographics-map.js";
```

```js
const demog = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const pobAngloEl = await demographicsMap({
  demog,
  ariaLabel: "Mapa de población anglosajona en Houston"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${pobAngloEl}
    </div>
  </div>
</div>

<div class="text">
  <p>Con base en el mapa, se observa una mayor concentración de población anglosajona en los anillos suburbanos del oeste y noroeste de Houston, con continuidad hacia el suroeste. Destacan zonas como Katy–Cinco Ranch y el corredor de I‑10 West (Energy Corridor, Memorial, CityCentre), Cypress–Jersey Village y el eje de US‑290, así como Sugar Land y áreas adyacentes a US‑59. Estas áreas aparecen en tonos más oscuros. Por el contrario, el centro, el este y sureste (Downtown/EaDo, Pasadena y entorno) muestran menor proporción relativa, reflejada en tonos más claros.</p>
  <p>Adicionalmente, dentro del eje centro‑occidental se identifican Spring Valley Village, Bunker Hill Village, Hunters Creek Village, Greenway, West University Place, Bellaire y partes de Midtown como bolsillos con alta proporción de población anglosajona, conectados por los corredores de Memorial Dr., Buffalo Bayou y US‑59/I‑69. Este corredor combina residencial consolidado y empleo de oficinas y salud, con alto poder adquisitivo y densa población flotante entre semana.</p>
</div>

<div class="hero">
  <h3>Implicaciones para selección de microzonas de entrada</h3>
</div>

<div class="text">
  <ul>
    <li><strong>I‑10 West (Energy Corridor–Memorial–CityCentre)</strong>: alto poder adquisitivo y flujo laboral/vehicular.</li>
    <li><strong>Corredor centro‑occidental (Spring Valley–Bunker Hill–Hunters Creek–Greenway–West U–Bellaire–Midtown)</strong>: alta proporción anglosajona y gasto; densidad diurna por oficinas y hospitales; óptimo para ubicaciones de alto flujo con acceso peatonal y vehicular.</li>
    <li><strong>Cypress / US‑290</strong>: crecimiento residencial con centros comerciales de destino y strip centers.</li>
    <li><strong>Katy–Cinco Ranch / Grand Pkwy (SH‑99)</strong>: familias y desarrollos master‑planned; buena tracción para formato drive‑thru.</li>
    <li><strong>Sugar Land (US‑59)</strong>: mezcla de oficinas y residencial consolidado; alto ticket potencial.</li>
  </ul>
</div>

<div class="hero">
  <h3>Recomendaciones operativas</h3>
</div>

<div class="text">
  <p>Priorizar ubicaciones con salida directa a arterias principales, facilidad de giro para drive‑thru, co‑ubicación con anclas de supermercado y escuelas/iglesias cercanas; ajustar comunicación de marca para familias y trabajadores de oficina, manteniendo oferta bilingüe.</p>
</div>

<div class="hero">
  <h2 id="restaurantes">Restaurantes</h2>
</div>

```js
import restaurantsAllMap from "../../components/maps/restaurants-all-map.js";
```

```js
const restaurantes = await FileAttachment("../../data/gis/restaurantes.geojson").json();
const restaurantesEl = await restaurantsAllMap({
  restaurants: restaurantes,
  ariaLabel: "Mapa de restaurantes en Houston"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${restaurantesEl}
    </div>
  </div>
</div>

<div class="text">
  <p>Para el análisis de Houston, se extrajeron +7300 restaurantes en el área metropolitana de Houston. Con información relacionada con rango de precios, ubicación geográfica, categoría, reseñas y otras variables capturadas por Google Maps.</p>
</div>

<div class="hero">
  <h3 id="restaurantes-de-categorias-que-compiten">Restaurantes de categorías que compiten</h3>
</div>

```js
import restaurantsCompetitionMap from "../../components/maps/restaurants-competition-map.js";
```

```js
const competition = await FileAttachment("../../data/gis/restaurantCompetition_whitinWhiteHouston.geojson").json();
const restaurantesCompEl = await restaurantsCompetitionMap({
  competition,
  ariaLabel: "Mapa de competencia de restaurantes"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${restaurantesCompEl}
    </div>
  </div>
</div>

<div class="hero">
  <h3 id="restaurantes-con-drive-thru">Restaurantes con Drive-thru</h3>
</div>

```js
import restaurantsDriveThruMap from "../../components/maps/restaurants-drivethru-map.js";
```

```js
const restaurantesDriveThruEl = await restaurantsDriveThruMap({
  restaurants: restaurantes,
  ariaLabel: "Mapa de restaurantes con drive-thru"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${restaurantesDriveThruEl}
    </div>
  </div>
</div>

<div class="hero">
  <h2 id="zonas-de-interes">Zonas de interés</h2>
</div>

```js
import zonesInterestMap from "../../components/maps/zones-interest-map.js";
```

```js
const angloZones = await FileAttachment("../../data/gis/whiteHouston_zonas_de_interes_polygon.geojson").json();
const angloClustersEl = await zonesInterestMap({
  angloZones,
  ariaLabel: "Mapa de zonas de interés en Houston"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${angloClustersEl}
    </div>
  </div>
</div>

<div class="hero">
  <h3 id="vialidades-relevantes">Vialidades relevantes</h3>
</div>

```js
import roadsFunctionalMap from "../../components/maps/roads-functional-map.js";
```

```js
const roads23 = await FileAttachment("../../data/gis/houstonMetropolitan_functional_classification_2_3.geojson").json();
const roadsEl = await roadsFunctionalMap({
  roads: roads23,
  ariaLabel: "Mapa de clasificación funcional de vialidades"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${roadsEl}
    </div>
  </div>
</div>

<div class="text">
  <p>El mapa muestra la jerarquía vial metropolitana de Houston, destacando las arteriales principales (F_SYSTEM 3) y arteriales menores (F_SYSTEM 4) que estructuran los corredores de mayor accesibilidad vehicular. Estas vialidades conectan los principales centros de empleo, comercio y residenciales, facilitando el flujo de tráfico a lo largo del área metropolitana.</p>
  <p>Los corredores arteriales principales incluyen interestatales como IH‑10, IH‑45, US‑59/I‑69 e IH‑610, que forman la columna vertebral del sistema de transporte. Las arteriales menores complementan esta red, proporcionando acceso distribuido a barrios, centros comerciales y distritos de oficinas. La identificación de estas vialidades es crucial para seleccionar ubicaciones con accesos favorables, facilidad de giro y alta visibilidad vehicular.</p>
</div>

<div class="hero">
  <h2 id="vialidades-con-mayor-trafico">Vialidades con mayor tráfico</h2>
</div>

```js
import trafficRoadsMap from "../../components/maps/traffic-roads-map.js";
```

```js
const congestion = await FileAttachment("../../data/gis/future_congestion.geojson").json();
const stations = await FileAttachment("../../data/gis/permanent_count_stations.geojson").json();
const trafficEl = await trafficRoadsMap({
  congestion,
  stations,
  ariaLabel: "Mapa de tráfico y congestión"
});
```

<div class="grid grid-cols-1">
  <div class="card map-card">
    <div class="map-container">
      ${trafficEl}
    </div>
  </div>
</div>

<div class="text">
  <p>Este mapa integra tres capas conmutables que revelan patrones de tráfico y congestión: (1) <strong>Congestión futura</strong> por corredor, clasificada por severidad (desde no congestionado hasta severamente congestionado); (2) <strong>Estaciones permanentes de conteo</strong>, que marcan puntos con medición continua de flujo vehicular; y (3) <strong>Heatmap de densidad de estaciones</strong>, resaltando zonas con mayor intensidad de monitoreo y potencial de flujo.</p>
  <p>Los corredores en rojo y naranja indican mayor congestión prevista, típicamente concentrada en IH‑10 West, IH‑45 North y South, US‑59/I‑69 Southwest, e IH‑610 Loop. Estos segmentos experimentan alta demanda durante horas pico, lo que aumenta la visibilidad pero puede complicar accesos. Las estaciones permanentes validan la intensidad del tráfico y ayudan a identificar frentes con flujo constante y oportunidades de captura vehicular.</p>
</div>

<div class="hero">
  <h3>Implicaciones para selección de sitios</h3>
</div>

<div class="text">
  <ul>
    <li><strong>Corredores de alta congestión</strong>: Priorizar localizaciones con acceso directo a IH‑10, IH‑45, US‑59/I‑69 e IH‑610, validando facilidad de giro y retornos seguros.</li>
    <li><strong>Arteriales con flujo constante</strong>: Buscar frentes sobre arteriales principales y menores con estaciones de conteo cercanas, indicando tráfico estable y predecible.</li>
    <li><strong>Visibilidad y accesibilidad</strong>: Combinar vialidades de alto tráfico con diseño de sitio que favorezca entrada/salida rápida, especialmente para formato drive‑thru.</li>
    <li><strong>Horarios de operación</strong>: Considerar patrones de congestión matutina (hacia Downtown) y vespertina (hacia suburbios) para ajustar horarios de mayor demanda.</li>
  </ul>
</div>

---
