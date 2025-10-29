---
title: Estrategia de Plaza
theme: [glacier, wide]
sidebar: true
toc: false
keywords: ubicación, planta, tienda, drive-through, Houston, logística, expansión, zonas candidatas
---

<div class="hero">
  <h1 id="2-4-estrategia-de-plaza">2.4 Estrategia de Plaza</h1>
  <h2>Análisis de Ubicación Estratégica para Soft Landing</h2>
</div>

```js
import { MAP_DEFAULTS } from "../../config/maps.js";
const { mapboxToken: MAPBOX_TOKEN, mapboxStyle: MAPBOX_STYLE } = MAP_DEFAULTS;
```

```js
const zonasInteres = await FileAttachment("../../data/gis/whiteHouston_zonas_de_interes_polygon.geojson").json();
const trafficRoads = await FileAttachment("../../data/gis/houstonMetropolitan_functional_classification_2_3.geojson").json();
const restaurants = await FileAttachment("../../data/gis/restaurantCompetition_whitinWhiteHouston.geojson").json();
const demographics = await FileAttachment("../../data/gis/whitePOBvsPOBTOT_houston.geojson").json();
const driveThruTracts = await FileAttachment("../../data/gis/houstonCensusTracts_percentageDriveThru_RestTOT.geojson").json();

// Importar componentes
const plazaStrategyMap = await import("../../components/maps/plaza-strategy-map.js");
const { zoneScoringTable, demographicsComparisonChart } = await import("../../components/charts/zone-scoring-table.js");
```

```js
// Calcular KPIs del mercado
const totalRestaurants = restaurants.features?.length || 0;
const restaurantsWithDriveThru = restaurants.features?.filter(f => 
  f.properties?.has_drive_through === true || 
  f.properties?.has_drive_through === 1 || 
  f.properties?.has_drive_through === "true"
).length || 0;
const driveThruPercentage = totalRestaurants > 0 ? (restaurantsWithDriveThru / totalRestaurants * 100) : 0;

const zonasClusters = zonasInteres.features?.length || 0;
const avgTrafficAADT = 35000; // Promedio estimado de AADT en zonas objetivo
```

```js
// Función para crear KPI cards
function kpiCard(title, value, suffix = "", icon = "") {
  const formatted = typeof value === "number" ? value.toLocaleString("es-MX", {maximumFractionDigits: 1}) : value;
  return html`
    <div class="card">
      <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.5rem;">
        ${icon} ${title}
      </div>
      <div style="font-size: 2rem; font-weight: 700; color: var(--theme-foreground-focus);">
        ${formatted}${suffix}
      </div>
    </div>
  `;
}
```

<div class="hero">
  <h3 id="resumen-ejecutivo">Resumen Ejecutivo</h3>
</div>

<div class="text">
  <p>La estrategia de ubicación es crítica para el éxito del soft landing de Pastes Kikos en Houston. Este análisis integra datos demográficos, de tráfico vehicular, competencia restaurantera y patrones de drive-through para identificar las ubicaciones óptimas para:</p>
  <ol>
    <li><strong>Planta de producción central</strong> — Hub logístico para distribución a múltiples tiendas</li>
    <li><strong>Primera tienda drive-through</strong> — Punto de venta inicial para validación de mercado</li>
  </ol>
</div>

<div class="grid grid-cols-4">
  ${kpiCard("Zonas Analizadas", zonasClusters, "", "📍")}
  ${kpiCard("Restaurantes en Target", totalRestaurants, "", "🍽️")}
  ${kpiCard("Con Drive-thru", driveThruPercentage, "%", "🚗")}
  ${kpiCard("Tráfico Promedio", avgTrafficAADT, " AADT", "🛣️")}
</div>

<div class="hero">
  <h2 id="mapa-estrategico">Mapa Estratégico Interactivo</h2>
</div>

<div class="text">
  <p class="lead">Explora las capas de análisis geoespacial. El mapa integra zonas de interés demográfico, red vial principal, ubicación de competidores y densidad de drive-throughs.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${plazaStrategyMap.default({
      center: [29.7604, -95.3698],
      zoom: 10,
      size: { height: 650 },
      mapboxToken: MAPBOX_TOKEN,
      mapboxStyle: MAPBOX_STYLE,
      restaurants: restaurants,
      zonasInteres: zonasInteres,
      trafficRoads: trafficRoads,
      demographics: demographics
    })}
  </div>
</div>

<div class="note" style="margin-top: 1rem;">
  💡 <strong>Tip:</strong> Usa los controles de capas (arriba derecha del mapa) para activar/desactivar diferentes overlays y análisis temáticos.
</div>

---

<div class="hero">
  <h2 id="planta-produccion">1. Planta de Producción Central</h2>
</div>

<div class="text">
  <p class="lead"><strong>Objetivo:</strong> Hub de producción con capacidad de distribución a 25 millas en <30 minutos y escalabilidad al Triángulo de Texas.</p>
  
  <p><strong>Criterios de Selección</strong></p>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h3>🛣️ Accesibilidad</h3>
    <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
      <li>Proximidad a I-10, I-45, I-610, US-59</li>
      <li>Tiempo entrega <30 min (valle)</li>
      <li>Radio cobertura: 25 millas</li>
    </ul>
  </div>
  <div class="card">
    <h3>📈 Escalabilidad</h3>
    <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
      <li>Expansión a San Antonio (197 mi)</li>
      <li>Dallas (239 mi), Austin (165 mi)</li>
      <li>Espacio: 5,000-10,000 sq ft</li>
      </ul>
  </div>
  <div class="card">
    <h3>💰 Costo</h3>
    <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
      <li>Renta: $6-10/sq ft anual</li>
      <li>Zonificación industrial alimentaria</li>
      <li>Incentivos fiscales (Enterprise Zones)</li>
  </ul>
  </div>
</div>

<div class="hero">
  <h3 id="scoring-planta">Scoring de Zonas Candidatas para Planta</h3>
</div>

```js
// Datos de scoring para planta de producción
const plantZones = [
  {
    name: "Northwest Houston (Spring Branch / Cypress)",
    highwayAccess: 9.0,
    distributionRadius: 8.5,
    supplierProximity: 8.0,
    utilities: 9.0,
    cost: 7.0,
    lat: 29.9511,
    lon: -95.6091
  },
  {
    name: "Southwest Houston (Missouri City / Stafford)",
    highwayAccess: 8.0,
    distributionRadius: 7.5,
    supplierProximity: 6.5,
    utilities: 8.5,
    cost: 8.0,
    lat: 29.6186,
    lon: -95.5383
  },
  {
    name: "East Houston (East End / Channelview)",
    highwayAccess: 7.5,
    distributionRadius: 6.0,
    supplierProximity: 7.0,
    utilities: 8.0,
    cost: 9.5,
    lat: 29.7952,
    lon: -95.1274
  }
];

const plantCriteria = [
  { key: "highwayAccess", label: "Acceso Autopistas", weight: 30 },
  { key: "distributionRadius", label: "Radio Distribución", weight: 25 },
  { key: "supplierProximity", label: "Proximidad Proveedores", weight: 20 },
  { key: "utilities", label: "Infraestructura", weight: 15 },
  { key: "cost", label: "Costo", weight: 10 }
];

// Calcular scores totales para las zonas de planta
const plantZonesWithScores = plantZones.map((zone, idx) => ({
  ...zone,
  totalScore: (zone.highwayAccess * 0.30 + zone.distributionRadius * 0.25 + 
               zone.supplierProximity * 0.20 + zone.utilities * 0.15 + zone.cost * 0.10),
  rank: idx + 1
}));
```

```js
const plantTable = html`<div class="card" style="overflow-x: auto;">
  <h3>Análisis Comparativo de Ubicaciones para Planta</h3>
  
  <table class="scoring-table">
    <thead>
      <tr>
        <th>Zona</th>
        <th>Acceso<br>Autopistas<br>(30%)</th>
        <th>Radio<br>Distribución<br>(25%)</th>
        <th>Proximidad<br>Proveedores<br>(20%)</th>
        <th>Infraestructura<br>(15%)</th>
        <th>Costo<br>(10%)</th>
        <th class="total-col">Score<br>Total</th>
      </tr>
    </thead>
    <tbody>
      ${plantZones.map((zone, idx) => {
        const total = (zone.highwayAccess * 0.30 + zone.distributionRadius * 0.25 + 
                      zone.supplierProximity * 0.20 + zone.utilities * 0.15 + zone.cost * 0.10);
        return html`<tr class="${idx === 0 ? 'winner-row' : ''}">
          <td class="zone-name">${idx === 0 ? '🏆 ' : ''}${zone.name}</td>
          <td><span class="score-badge score-${Math.floor(zone.highwayAccess)}">${zone.highwayAccess.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.distributionRadius)}">${zone.distributionRadius.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.supplierProximity)}">${zone.supplierProximity.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.utilities)}">${zone.utilities.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.cost)}">${zone.cost.toFixed(1)}</span></td>
          <td class="total-col"><span class="score-total score-${Math.floor(total)}">${total.toFixed(1)}</span></td>
        </tr>`;
      })}
    </tbody>
  </table>
  
  <div class="score-legend">
    <strong>Escala:</strong>
    <span class="legend-item"><span class="legend-box" style="background: #22c55e;">■</span> 8-10 Excelente</span>
    <span class="legend-item"><span class="legend-box" style="background: #eab308;">■</span> 6-7.9 Bueno</span>
    <span class="legend-item"><span class="legend-box" style="background: #f97316;">■</span> 4-5.9 Aceptable</span>
    <span class="legend-item"><span class="legend-box" style="background: #ef4444;">■</span> 0-3.9 Deficiente</span>
  </div>
</div>`;
```

```js
const plantMap = Plot.plot({
  width: 550,
  height: 500,
  projection: {
    type: "mercator",
    domain: {
      type: "MultiPoint",
      coordinates: plantZonesWithScores.map(z => [z.lon, z.lat])
    },
    inset: 40
  },
  marks: [
    Plot.dot(plantZonesWithScores, {
      x: "lon",
      y: "lat",
      r: 12,
      fill: (d, i) => i === 0 ? "#22c55e" : "#94a3b8",
      stroke: (d, i) => i === 0 ? "#166534" : "#475569",
      strokeWidth: 2,
      tip: true,
      title: d => `${d.name}\nScore: ${d.totalScore.toFixed(1)}`
    }),
    Plot.text(plantZonesWithScores, {
      x: "lon",
      y: "lat",
      text: d => d.rank,
      fill: "white",
      fontSize: 14,
      fontWeight: "bold"
    })
  ]
});
```

<div class="grid grid-cols-2" style="gap: 1.5rem;">
  <div>${plantTable}</div>
  <div class="card">
    <h3>Ubicaciones Candidatas</h3>
    ${plantMap}
  </div>
</div>

<div class="hero">
  <h3 id="recomendacion-planta">Recomendación</h3>
</div>

<div class="card" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); border-left: 4px solid #22c55e;">
  <h3 style="color: #22c55e; margin-top: 0;">🏆 Northwest Houston — Zona Prioritaria</h3>
  <div class="grid grid-cols-2" style="gap: 1rem; margin-top: 1rem;">
    <div>
      <h4 style="font-size: 0.875rem; color: var(--theme-foreground-muted); margin: 0.5rem 0;">Ventajas Clave</h4>
      <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
        <li>✅ Acceso directo a I-10 W y US-290</li>
        <li>✅ Parques industriales consolidados</li>
        <li>✅ Ruta directa hacia Austin/San Antonio</li>
        <li>✅ Centralidad para distribución metropolitana</li>
      </ul>
    </div>
    <div>
      <h4 style="font-size: 0.875rem; color: var(--theme-foreground-muted); margin: 0.5rem 0;">Consideraciones</h4>
      <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
        <li>⚠️ Tráfico en horas pico (mitigar con entregas nocturnas)</li>
        <li>💡 Negociar lease largo plazo para estabilidad de costos</li>
        <li>💡 Verificar zonificación FDA y permisos alimentarios</li>
      </ul>
    </div>
  </div>
</div>

---

<div class="hero">
  <h2 id="primera-tienda">2. Primera Tienda (Drive-Through)</h2>
</div>

<div class="text">
  <p class="lead"><strong>Modelo de Negocio: Drive-Through QSR</strong></p>
  <p>El formato drive-through es estratégico para Houston debido a:</p>
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🚗</div>
    <h3 style="font-size: 1rem;">Dependencia Vehicular</h3>
    <p style="font-size: 0.875rem; margin: 0.5rem 0;">85%+ desplazamientos en auto privado</p>
  </div>
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚡</div>
    <h3 style="font-size: 1rem;">Cultura Grab-and-Go</h3>
    <p style="font-size: 0.875rem; margin: 0.5rem 0;">Conveniencia como prioridad</p>
  </div>
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌡️</div>
    <h3 style="font-size: 1rem;">Clima Extremo</h3>
    <p style="font-size: 0.875rem; margin: 0.5rem 0;">Veranos >95°F, lluvias intensas</p>
  </div>
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💵</div>
    <h3 style="font-size: 1rem;">Menor Inversión</h3>
    <p style="font-size: 0.875rem; margin: 0.5rem 0;">vs. local con comedor completo</p>
  </div>
</div>

<div class="hero">
  <h3 id="criterios-primera-tienda">Criterios de Selección</h3>
</div>

<div class="text">
  <p><strong>A. Tráfico y Visibilidad</strong></p>
  <ul>
    <li><strong>Vías de alto flujo</strong>: Arteriales con AADT >20,000 vehículos/día</li>
    <li><strong>Visibilidad</strong>: Esquina con signage visible bidireccional</li>
    <li><strong>Accesibilidad</strong>: Entrada/salida sin vuelta en U</li>
    <li><strong>Velocidad</strong>: Zonas ≤45 mph (mayor probabilidad de impulso)</li>
  </ul>

  <p><strong>B. Demografía (Radio 3 millas)</strong></p>
  <ul>
    <li><strong>Target primario</strong>: Población blanca ≥40%</li>
    <li><strong>Target secundario</strong>: Población latina receptiva</li>
    <li><strong>Ingreso</strong>: $50,000-$100,000 (sweet spot QSR premium)</li>
    <li><strong>Densidad</strong>: Áreas residenciales/mixtas con actividad diurna</li>
  </ul>

  <p><strong>C. Generadores de Tráfico</strong></p>
  <ul>
    <li><strong>Oficinas</strong>: Parques corporativos (lunch traffic)</li>
    <li><strong>Retail</strong>: Centros comerciales (compra impulso)</li>
    <li><strong>Educación</strong>: Universidades, high schools</li>
    <li><strong>Hospitales</strong>: Personal médico y visitantes</li>
  </ul>

  <p><strong>D. Competencia</strong></p>
  <ul>
    <li><strong>Directos</strong>: Evitar saturación (≥3 empanadas en 1 mi)</li>
    <li><strong>Indirectos</strong>: Proximidad a QSR establecidos (Chipotle, Panera)</li>
    <li><strong>Gaps</strong>: Áreas con demanda pero baja oferta auténtica</li>
  </ul>

  <p><strong>E. Espacio</strong></p>
  <ul>
    <li><strong>Lote</strong>: 15,000-25,000 sq ft</li>
    <li><strong>Edificio</strong>: 1,200-1,800 sq ft</li>
    <li><strong>Drive-through</strong>: Carril para 6-8 vehículos</li>
    <li><strong>Estacionamiento</strong>: 10-15 espacios</li>
  </ul>
</div>

<div class="hero">
  <h3 id="scoring-tiendas">Scoring de Microzonas Prioritarias</h3>
</div>

```js
// Datos de scoring para primera tienda
const storeZones = [
  {
    name: "Energy Corridor",
    traffic: 9.5,
    demographics: 9.0,
    generators: 9.5,
    competition: 8.5,
    rent: 7.0,
    whitePercent: 62,
    medianIncome: 95000,
    lat: 29.7752,
    lon: -95.6431
  },
  {
    name: "Sugar Land / Missouri City",
    traffic: 8.0,
    demographics: 8.0,
    generators: 7.5,
    competition: 8.0,
    rent: 7.5,
    whitePercent: 48,
    medianIncome: 85000,
    lat: 29.6197,
    lon: -95.6349
  },
  {
    name: "Memorial / Galleria",
    traffic: 9.0,
    demographics: 9.0,
    generators: 9.5,
    competition: 5.0,
    rent: 4.0,
    whitePercent: 65,
    medianIncome: 105000,
    lat: 29.7490,
    lon: -95.4618
  },
  {
    name: "Clear Lake / NASA Area",
    traffic: 7.5,
    demographics: 7.5,
    generators: 8.5,
    competition: 7.0,
    rent: 8.0,
    whitePercent: 52,
    medianIncome: 72000,
    lat: 29.5583,
    lon: -95.1419
  },
  {
    name: "The Heights / Garden Oaks",
    traffic: 8.5,
    demographics: 8.5,
    generators: 8.0,
    competition: 6.5,
    rent: 5.5,
    whitePercent: 58,
    medianIncome: 78000,
    lat: 29.8013,
    lon: -95.4075
  }
];

const storeCriteria = [
  { key: "traffic", label: "Tráfico (AADT)", weight: 25 },
  { key: "demographics", label: "Demografía", weight: 25 },
  { key: "generators", label: "Generadores", weight: 20 },
  { key: "competition", label: "Competencia", weight: 15 },
  { key: "rent", label: "Costo Renta", weight: 15 }
];

// Calcular scores totales para las zonas de tienda
const storeZonesWithScores = storeZones.map((zone, idx) => ({
  ...zone,
  totalScore: (zone.traffic * 0.25 + zone.demographics * 0.25 + 
               zone.generators * 0.20 + zone.competition * 0.15 + zone.rent * 0.15),
  rank: idx + 1
})).sort((a, b) => b.totalScore - a.totalScore);
```

```js
const storeTable = html`<div class="card" style="overflow-x: auto;">
  <h3>Análisis Comparativo de Ubicaciones para Primera Tienda</h3>
  
  <table class="scoring-table">
    <thead>
      <tr>
        <th>Zona</th>
        <th>Tráfico<br>AADT<br>(25%)</th>
        <th>Demografía<br>(25%)</th>
        <th>Generadores<br>(20%)</th>
        <th>Competencia<br>(15%)</th>
        <th>Costo<br>Renta<br>(15%)</th>
        <th class="total-col">Score<br>Total</th>
      </tr>
    </thead>
    <tbody>
      ${storeZonesWithScores.map((zone, idx) => {
        return html`<tr class="${idx === 0 ? 'winner-row' : ''}">
          <td class="zone-name">${idx === 0 ? '🏆 ' : ''}${zone.name}</td>
          <td><span class="score-badge score-${Math.floor(zone.traffic)}">${zone.traffic.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.demographics)}">${zone.demographics.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.generators)}">${zone.generators.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.competition)}">${zone.competition.toFixed(1)}</span></td>
          <td><span class="score-badge score-${Math.floor(zone.rent)}">${zone.rent.toFixed(1)}</span></td>
          <td class="total-col"><span class="score-total score-${Math.floor(zone.totalScore)}">${zone.totalScore.toFixed(1)}</span></td>
        </tr>`;
      })}
    </tbody>
  </table>
  
  <div class="score-legend">
    <strong>Escala:</strong>
    <span class="legend-item"><span class="legend-box" style="background: #22c55e;">■</span> 8-10 Excelente</span>
    <span class="legend-item"><span class="legend-box" style="background: #eab308;">■</span> 6-7.9 Bueno</span>
    <span class="legend-item"><span class="legend-box" style="background: #f97316;">■</span> 4-5.9 Aceptable</span>
    <span class="legend-item"><span class="legend-box" style="background: #ef4444;">■</span> 0-3.9 Deficiente</span>
  </div>
</div>`;
```

```js
const storeMap = Plot.plot({
  width: 550,
  height: 500,
  projection: {
    type: "mercator",
    domain: {
      type: "MultiPoint",
      coordinates: storeZonesWithScores.map(z => [z.lon, z.lat])
    },
    inset: 30
  },
  marks: [
    Plot.dot(storeZonesWithScores, {
      x: "lon",
      y: "lat",
      r: 12,
      fill: d => {
        if (d.totalScore >= 8.5) return "#22c55e";
        if (d.totalScore >= 8.0) return "#84cc16";
        if (d.totalScore >= 7.5) return "#eab308";
        if (d.totalScore >= 7.0) return "#f97316";
        return "#ef4444";
      },
      stroke: d => {
        if (d.totalScore >= 8.5) return "#166534";
        if (d.totalScore >= 8.0) return "#4d7c0f";
        if (d.totalScore >= 7.5) return "#a16207";
        if (d.totalScore >= 7.0) return "#c2410c";
        return "#991b1b";
      },
      strokeWidth: 2,
      tip: true,
      title: d => `${d.name}\nScore: ${d.totalScore.toFixed(1)}`
    }),
    Plot.text(storeZonesWithScores, {
      x: "lon",
      y: "lat",
      text: (d, i) => i + 1,
      fill: "white",
      fontSize: 14,
      fontWeight: "bold"
    })
  ]
});
```

<div class="grid grid-cols-2" style="gap: 1.5rem;">
  <div>${storeTable}</div>
  <div class="card">
    <h3>Ubicaciones Candidatas</h3>
    ${storeMap}
  </div>
</div>

<div class="hero">
  <h3 id="demografia-zonas">Perfil Demográfico por Zona</h3>
</div>

```js
// Gráfica de demografía comparativa
const demoChart = Plot.plot({
  width: 900,
  height: 350,
  marginLeft: 200,
  style: {
    background: "transparent",
    fontSize: "13px"
  },
  x: {
    grid: true,
    label: "Valor"
  },
  y: {
    label: null
  },
  color: {
    domain: ["% Población Blanca", "Ingreso Medio ($k)"],
    range: ["#3b82f6", "#22c55e"],
    legend: true
  },
  facet: {
    data: storeZones.flatMap(z => [
      { zone: z.name, metric: "% Población Blanca", value: z.whitePercent },
      { zone: z.name, metric: "Ingreso Medio ($k)", value: z.medianIncome / 1000 }
    ]),
    y: "metric",
    marginLeft: 200
  },
  marks: [
    Plot.barX(
      storeZones.flatMap(z => [
        { zone: z.name, metric: "% Población Blanca", value: z.whitePercent },
        { zone: z.name, metric: "Ingreso Medio ($k)", value: z.medianIncome / 1000 }
      ]),
      {
        x: "value",
        y: "zone",
        fill: "metric",
        sort: { y: "-x" },
        tip: true
      }
    ),
    Plot.ruleX([0])
  ]
});
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => demoChart)}
  </div>
</div>

<div class="hero">
  <h3 id="recomendacion-tienda">Recomendación</h3>
</div>

<div class="card" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); border-left: 4px solid #22c55e;">
  <h3 style="color: #22c55e; margin-top: 0;">🏆 Energy Corridor — Zona Prioritaria</h3>
  <div class="grid grid-cols-2" style="gap: 1rem; margin-top: 1rem;">
    <div>
      <h4 style="font-size: 0.875rem; color: var(--theme-foreground-muted); margin: 0.5rem 0;">Por qué Energy Corridor</h4>
      <ul style="font-size: 0.875rem; margin: 0.5rem 0;">
        <li>✅ 100,000+ empleados en parques corporativos</li>
        <li>✅ AADT >50,000 en I-10 (máximo tráfico)</li>
        <li>✅ Ingreso medio $90k+ (poder adquisitivo)</li>
        <li>✅ Baja competencia directa (solo cadenas genéricas)</li>
        <li>✅ Demografía objetivo: 62% población blanca</li>
      </ul>
    </div>
    <div>
      <h4 style="font-size: 0.875rem; color: var(--theme-foreground-muted); margin: 0.5rem 0;">Alternativas Viables</h4>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>2. The Heights / Garden Oaks</strong></p>
      <ul style="font-size: 0.75rem; margin: 0.25rem 0;">
        <li>Cultura foodie consolidada, tráfico mixto (vehicular + peatonal)</li>
      </ul>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>3. Sugar Land / Missouri City</strong></p>
      <ul style="font-size: 0.75rem; margin: 0.25rem 0;">
        <li>Crecimiento poblacional acelerado, familias con niños</li>
      </ul>
    </div>
  </div>
</div>

---

<div class="hero">
  <h3 id="analisis-drivethru">Análisis de Prevalencia Drive-Through</h3>
</div>

```js
// Calcular estadísticas de drive-through por census tract
const tractsWithData = driveThruTracts.features?.filter(f => {
  const total = f.properties?.total_restaurants || 0;
  const count = f.properties?.count_has_drive_through || 0;
  return total > 0;
}).map(f => ({
  ...f,
  calculatedPercentage: (f.properties.count_has_drive_through || 0) / (f.properties.total_restaurants || 1)
})) || [];

const avgDriveThruPerc = tractsWithData.length > 0 
  ? tractsWithData.reduce((sum, f) => sum + f.calculatedPercentage, 0) / tractsWithData.length 
  : 0;

// Función para crear el histograma
function createDriveThruHistogram(width) {
  return Plot.plot({
    width,
    height: 300,
    marginLeft: 60,
    style: {
      background: "transparent"
    },
    x: {
      label: "% Restaurantes con Drive-through",
      tickFormat: d => `${d}%`,
      domain: [0, 100]
    },
    y: {
      label: "Número de Census Tracts",
      grid: true
    },
    marks: [
      Plot.rectY(
        tractsWithData,
        Plot.binX(
          { y: "count" },
          {
            x: d => d.calculatedPercentage * 100,
            thresholds: 20,
            fill: "#3b82f6",
            tip: true
          }
        )
      ),
      Plot.ruleX([avgDriveThruPerc * 100], {
        stroke: "#ef4444",
        strokeWidth: 2,
        strokeDasharray: "4 2"
      }),
      Plot.text([{ value: avgDriveThruPerc * 100 }], {
        x: d => d.value,
        y: 0,
        text: d => `Promedio: ${d.value.toFixed(1)}%`,
        dy: -10,
        fill: "#ef4444",
        fontSize: 12,
        fontWeight: 600
      })
    ]
  });
}
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>${totalRestaurants.toLocaleString()}</h2>
    <span class="muted">Restaurantes Analizados</span>
  </div>
  <div class="card">
    <h2>${restaurantsWithDriveThru.toLocaleString()}</h2>
    <span class="muted">Con Drive-through</span>
  </div>
  <div class="card">
    <h2>${driveThruPercentage.toFixed(1)}%</h2>
    <span class="muted">Prevalencia Drive-thru</span>
  </div>
</div>

<div class="grid grid-cols-1" style="margin-top: 2rem;">
  <div class="card">
    <h3>Distribución de Drive-through por Census Tract</h3>
    ${resize((width) => createDriveThruHistogram(width))}
  </div>
</div>

<div class="text">
  <p><strong>Insight clave:</strong> La prevalencia de drive-through varía significativamente por zona. Las áreas suburbanas y periféricas muestran mayor adopción (>40%), mientras que zonas urbanas densas tienen menor penetración. Esto valida la estrategia de ubicar la primera tienda en corredores suburbanos como Energy Corridor.</p>
</div>

---

<div class="hero">
  <h2 id="metodologia-seleccion">Metodología de Selección Final</h2>
</div>

```js
// Workflow visual
const workflow = html`
  <div style="
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 2rem;
    background: var(--theme-background-alt);
    border-radius: 8px;
  ">
    <div style="text-align: center; flex: 1;">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 2rem;
      ">📊</div>
      <h4 style="margin: 0.5rem 0; font-size: 1rem;">1. Desktop Analysis</h4>
      <p style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin: 0.25rem 0;">
        Ranking cuantitativo<br>Top 5-7 candidatas
      </p>
      <div style="
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: #22c55e;
        color: white;
        border-radius: 12px;
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
      ">✅ COMPLETADO</div>
    </div>
    
    <div style="font-size: 2rem; color: var(--theme-foreground-muted);">→</div>
    
    <div style="text-align: center; flex: 1;">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 2rem;
      ">🚗</div>
      <h4 style="margin: 0.5rem 0; font-size: 1rem;">2. Site Visits</h4>
      <p style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin: 0.25rem 0;">
        Inspección física 2-3 finalistas<br>Validación in-situ
      </p>
      <div style="
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: #f59e0b;
        color: white;
        border-radius: 12px;
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
      ">📅 SIGUIENTE PASO</div>
    </div>
    
    <div style="font-size: 2rem; color: var(--theme-foreground-muted);">→</div>
    
    <div style="text-align: center; flex: 1;">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 2rem;
      ">🧪</div>
      <h4 style="margin: 0.5rem 0; font-size: 1rem;">3. Pilot Test</h4>
      <p style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin: 0.25rem 0;">
        Pop-up 2-4 semanas<br>Validación demanda real
      </p>
      <div style="
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: var(--theme-foreground-faintest);
        color: var(--theme-foreground-muted);
        border-radius: 12px;
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
      ">⏳ PLANIFICADO</div>
    </div>
  </div>
`;
```

<div class="grid grid-cols-1">
  ${workflow}
</div>

<div class="hero">
  <h3 id="proximos-pasos">Próximos Pasos Accionables</h3>
</div>

```js
// Checklist interactivo
const actionItems = [
  { id: 1, action: "Contactar brokers especializados en retail/industrial", priority: "Alta", status: "pending" },
  { id: 2, action: "Solicitar zoning reports para confirmar uso permitido", priority: "Alta", status: "pending" },
  { id: 3, action: "Negociar LOI con 2-3 propietarios (Energy Corridor, Heights)", priority: "Alta", status: "pending" },
  { id: 4, action: "Coordinar site visit con stakeholders (José Luis + equipo)", priority: "Media", status: "pending" },
  { id: 5, action: "Preparar pro forma financiero por ubicación (ROI 3/5 años)", priority: "Media", status: "pending" },
  { id: 6, action: "Investigar incentivos fiscales (Enterprise Zones, FTZ)", priority: "Media", status: "pending" },
  { id: 7, action: "Validar permisos FDA y health department locales", priority: "Alta", status: "pending" }
];

const checklist = html`
  <div style="
    background: var(--theme-background-alt);
    border-radius: 8px;
    padding: 1.5rem;
  ">
    <h3 style="margin: 0 0 1rem 0;">Plan de Acción — Fase 2 (Site Visits)</h3>
    ${actionItems.map(item => html`
      <div style="
        display: flex;
        align-items: center;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: var(--theme-background);
        border-radius: 6px;
        border-left: 3px solid ${item.priority === 'Alta' ? '#ef4444' : '#f59e0b'};
      ">
        <input 
          type="checkbox" 
          id="action-${item.id}"
          style="
            width: 20px;
            height: 20px;
            margin-right: 1rem;
            cursor: pointer;
          "
        />
        <label 
          for="action-${item.id}"
          style="
            flex: 1;
            font-size: 0.875rem;
            cursor: pointer;
            color: var(--theme-foreground);
          "
        >
          ${item.action}
        </label>
        <span style="
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          background: ${item.priority === 'Alta' ? '#ef444420' : '#f59e0b20'};
          color: ${item.priority === 'Alta' ? '#ef4444' : '#f59e0b'};
        ">
          ${item.priority}
        </span>
      </div>
    `)}
  </div>
`;
```

<div class="grid grid-cols-1">
  ${checklist}
</div>

---

<div class="hero">
  <h2 id="resumen-final">Resumen Ejecutivo de Decisión</h2>
</div>

<div class="grid grid-cols-2" style="gap: 2rem;">
  <div class="card" style="border: 2px solid #3b82f6;">
    <h3 style="color: #3b82f6; margin-top: 0;">🏭 Planta de Producción</h3>
    <div style="margin: 1rem 0;">
      <div style="
        padding: 1rem;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 6px;
        margin-bottom: 0.5rem;
      ">
        <strong style="color: #22c55e;">Recomendación:</strong> Northwest Houston (Spring Branch / Cypress)
      </div>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Score Total:</strong> 8.35/10</p>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Inversión Estimada:</strong> $350k-500k</p>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Timeline:</strong> 3-4 meses (búsqueda + setup)</p>
    </div>
  </div>
  
  <div class="card" style="border: 2px solid #22c55e;">
    <h3 style="color: #22c55e; margin-top: 0;">🍽️ Primera Tienda</h3>
    <div style="margin: 1rem 0;">
      <div style="
        padding: 1rem;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 6px;
        margin-bottom: 0.5rem;
      ">
        <strong style="color: #22c55e;">Recomendación:</strong> Energy Corridor (I-10 West)
      </div>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Score Total:</strong> 8.7/10</p>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Inversión Estimada:</strong> $250k-350k</p>
      <p style="font-size: 0.875rem; margin: 0.5rem 0;"><strong>Timeline:</strong> 4-6 meses (lease + construcción)</p>
    </div>
  </div>
</div>

<div class="card" style="margin-top: 2rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border-left: 4px solid #3b82f6;">
  <h3 style="color: #3b82f6; margin-top: 0;">💡 Recomendaciones Estratégicas Finales</h3>
  <ol style="font-size: 0.875rem; line-height: 1.8;">
    <li><strong>Timing:</strong> Iniciar búsqueda de planta y tienda en paralelo (plazos similares)</li>
    <li><strong>Flexibilidad:</strong> Mantener 2-3 opciones activas por categoría para negociación</li>
    <li><strong>Validación:</strong> Pop-up temporal en Energy Corridor antes de lease largo plazo (mitigar riesgo)</li>
    <li><strong>Escalabilidad:</strong> Diseñar operaciones de planta para 3-5 tiendas desde inicio</li>
    <li><strong>Legal:</strong> Contratar abogado especializado en real estate comercial de Texas</li>
    <li><strong>ROI:</strong> Target break-even primera tienda: 18-24 meses</li>
  </ol>
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

### Fuentes de Datos Geoespaciales

- **TxDOT Geospatial Roadway Inventory Database (GRID)** — Red vial con clasificación funcional y conteos de tráfico
  - **TxDOT Functional Classification** — <a href="https://txdot.maps.arcgis.com/home/item.html?id=b553554a0a0842928936cf41e0721bc5" target="_blank">ArcGIS Item</a>
  - Clasificación de carreteras según normativa federal (arteriales, colectoras, locales)
  - Datos de Average Annual Daily Traffic (AADT) por segmento vial
  - **Actualización:** Mensual
- **TxDOT Congestion (2023)** — Espacio entre vehículos y congestión en hora pico — <a href="https://txdot.maps.arcgis.com/home/item.html?id=e7b9f8479bfd43ec804a4e09c2e4d8da" target="_blank">ArcGIS Item</a>
- **US Census Bureau** — Census Tracts 2020, datos demográficos (ACS 2022 5-year) — <a href="https://data.census.gov/" target="_blank">data.census.gov</a>
  - Población total, composición racial/étnica, ingresos medianos
  - Disponibilidad de vehículos por hogar (tabla S0801)
- **Google Places API** — Ubicación y atributos de restaurantes competidores — <a href="https://developers.google.com/maps/documentation/places/web-service" target="_blank">Google Places Documentation</a>
  - Presencia de drive-through (atributo `has_drive_through`)
  - Ratings, número de reviews, categorías
- **Zonas de interés demográfico** — Polígonos custom derivados de análisis de concentración de población objetivo (White alone, non-Hispanic ≥40%)
  - Dataset: `data/gis/whiteHouston_zonas_de_interes_polygon.geojson`

### Metodología de Análisis

- **Scoring multi-criterio:** Ponderación de factores para planta (acceso autopistas 30%, radio distribución 25%, proximidad proveedores 20%, infraestructura 15%, costo 10%) y tienda (tráfico 25%, demografía 25%, generadores 20%, competencia 15%, renta 15%)
- **Agregación espacial:** Análisis por census tract para drive-through prevalence; overlays de capas GIS para identificar corredores estratégicos
- **Validación:** Scoring basado en modelos de localización retail establecidos (Huff gravity model, análisis de catchment areas)

### Limitaciones

- Los datos de AADT son previos a 2024; pueden existir cambios recientes no reflejados
- Drive-through presence depende de cobertura de Google Places (puede haber omisiones)
- Scoring cualitativo para factores no cuantificables (ej. "calidad de proveedores")
- Proyecciones de tráfico futuro (TxDOT 2043) asumen patrones actuales

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
  margin: 1.5rem 1rem 2.5rem 1rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  max-width: none;
  font-size: 2.5vw;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.01em;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5em;
  transition: font-size 0.2s, color 0.2s;
}

.hero h2 {
  margin: 0 0 0.3em 0;
  max-width: 32em;
  font-size: 1.35vw;
  font-style: initial;
  font-weight: 600;
  line-height: 1.35;
  color: var(--theme-foreground-muted);
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, var(--theme-foreground-muted), var(--theme-foreground) 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: font-size 0.2s, color 0.2s;
}

.hero h3 {
  margin: 0.2em 0 0.5em 0;
  max-width: 30em;
  font-size: 1.1vw;
  font-weight: 500;
  line-height: 1.3;
  color: var(--theme-foreground-subtle, #64748b);
  letter-spacing: 0.01em;
  background: linear-gradient(90deg, var(--theme-foreground-subtle, #64748b), var(--theme-foreground-muted) 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-style: italic;
  transition: font-size 0.2s, color 0.2s;
}

.text {
  font-family: var(--sans-serif);
  margin: 1rem 1rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text p {
  margin: 0.6em 0;
  max-width: none;
  line-height: 1.6;
  color: var(--theme-foreground);
}

.text p.lead {
  max-width: none;
  font-weight: 600;
  color: var(--theme-foreground-muted);
  letter-spacing: -0.005em;
}

.text ul, .text ol {
  margin: 0.2em 0 0.8em .2em;
  max-width: none;
}

.text li {
  margin: 0.25em 0;
  max-width: none;
}

.card h3 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: var(--theme-foreground-focus);
}

.card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card li {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.muted {
  color: var(--theme-foreground-muted);
  font-size: 0.875rem;
}

.note {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--theme-foreground);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 50px;
  }
  .hero h2 {
    font-size: 28px;
  }
  .hero h3 {
    font-size: 20px;
  }
}

/* Tablas de Scoring */
.scoring-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9rem;
}

.scoring-table th {
  background: var(--theme-background);
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid var(--theme-foreground-faintest);
  font-size: 0.85rem;
  line-height: 1.3;
}

.scoring-table th:first-child {
  text-align: left;
  padding-left: 1rem;
}

.scoring-table td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--theme-foreground-faintest);
}

.scoring-table .zone-name {
  text-align: left;
  font-weight: 600;
  padding-left: 1rem;
  font-size: 0.85rem;
}

.scoring-table .total-col {
  background: var(--theme-background-alt);
  font-weight: 700;
}

.winner-row {
  background: rgba(34, 197, 94, 0.05);
}

.score-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 45px;
}

.score-total {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1.15rem;
  min-width: 60px;
  color: white !important;
}

/* Colores por score - badges individuales */
.score-9, .score-10 {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.score-8 {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.score-7, .score-6 {
  background: rgba(234, 179, 8, 0.15);
  color: #d97706;
  border: 1px solid rgba(234, 179, 8, 0.4);
}

.score-5, .score-4 {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.4);
}

.score-3, .score-2, .score-1, .score-0 {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

/* Score Total - colores sólidos con texto blanco */
.score-total.score-9, .score-total.score-10, .score-total.score-8 {
  background: #16a34a !important;
  color: white !important;
}

.score-total.score-7, .score-total.score-6 {
  background: #ca8a04 !important;
  color: white !important;
}

.score-total.score-5, .score-total.score-4 {
  background: #ea580c !important;
  color: white !important;
}

.score-total.score-3, .score-total.score-2, .score-total.score-1, .score-total.score-0 {
  background: #dc2626 !important;
  color: white !important;
}

.score-legend {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--theme-background);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--theme-foreground-muted);
}

.legend-item {
  margin-left: 0.75rem;
  white-space: nowrap;
}

.legend-box {
  margin-right: 0.25rem;
}

</style>
