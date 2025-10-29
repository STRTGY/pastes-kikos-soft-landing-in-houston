# Selección de Ubicaciones: Top 5 Zonas en Houston

```js
import * as L from "npm:leaflet";
```

```js
const metadata = FileAttachment("../../data/static/site-selection/metadata.json").json();
```

```js
const zones = FileAttachment("../../data/gis/site-selection/top5_locations.geojson").json();
```

```js
const candidateCells = FileAttachment("../../data/gis/site-selection/candidate_cells.geojson").json();
```

```js
const competition = FileAttachment("../../data/gis/site-selection/competition_all.geojson").json();
```

```js
const education = FileAttachment("../../data/gis/site-selection/education.geojson").json();
```

```js
const government = FileAttachment("../../data/gis/site-selection/government.geojson").json();
```

```js
const malls = FileAttachment("../../data/gis/site-selection/malls.geojson").json();
```

```js
const transit = FileAttachment("../../data/gis/site-selection/transit.geojson").json();
```

```js
const pricingHex = FileAttachment("../../data/gis/site-selection/pricing_hex.geojson").json();
```

```js
const valueMetrics = FileAttachment("../../data/gis/site-selection/value_metrics.geojson").json();
```

## Metodología de Análisis Multicriterio

Este mapa presenta las **5 mejores ubicaciones** para la expansión de Pastes Kikos en Houston, identificadas mediante un análisis multicriterio que integra:

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **Población Anglosajona** | 40% | Proporción de población objetivo en el área |
| **Aptitud Drive-Through** | 30% | Proximidad a arteriales y aceptación de formato rápido |
| **Ocasión de Consumo** | 20% | Densidad de POIs de desayuno/almuerzo (educación, gobierno, comercio) |
| **Oportunidad Precio/Valor** | 10% | Análisis de precios locales y brechas de percepción |

**Unidades evaluadas**: ${metadata.methodology.cell_count.toLocaleString()} hexágonos H3 (R8) cubriendo áreas de Houston con ≥40% población anglosajona.

---

## Controles de Visualización

```js
const layerControls = view(Inputs.checkbox(
  [
    "Zonas Seleccionadas",
    "Celdas Candidatas",
    "Competencia",
    "Educación",
    "Gobierno",
    "Centros Comerciales",
    "Transporte Público",
    "Precios (Hex)",
    "Valor Percibido"
  ],
  {
    value: ["Zonas Seleccionadas", "Celdas Candidatas"],
    label: "Capas visibles:"
  }
));
```

```js
const selectedZone = view(Inputs.select(
  [0, ...metadata.zones.map(z => z.zone_id)],
  {
    label: "Zoom a zona:",
    format: (d) => d === 0 ? "Vista general" : `Zona ${d}`
  }
));
```

---

## Mapa Interactivo

```js
// Create map container and initialize everything in one block
(function() {
  const container = display(document.createElement("div"));
  container.style = "height: 700px; width: 100%; border-radius: 8px; overflow: hidden;";
  
  const theMap = L.map(container, {
    center: [29.76, -95.36],
    zoom: 10,
    zoomControl: true
  });

  // Base layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CartoDB',
    maxZoom: 19
  }).addTo(theMap);

  // Layer groups
  const layerGroups = {
    "Zonas Seleccionadas": L.layerGroup(),
    "Celdas Candidatas": L.layerGroup(),
    "Competencia": L.layerGroup(),
    "Educación": L.layerGroup(),
    "Gobierno": L.layerGroup(),
    "Centros Comerciales": L.layerGroup(),
    "Transporte Público": L.layerGroup(),
    "Precios (Hex)": L.layerGroup(),
    "Valor Percibido": L.layerGroup()
  };

  // Color scales
  const scoreColor = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);
  const priceColor = d3.scaleSequential(d3.interpolateBlues).domain([0, 4]);
  const valueColor = d3.scaleDiverging(d3.interpolateRdYlGn).domain([-1, 0, 1]);

  // 1. Zones layer
  L.geoJSON(zones, {
    style: (feature) => ({
      color: '#2c3e50',
      weight: 3,
      fillColor: scoreColor(feature.properties.mean_score),
      fillOpacity: 0.3
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindPopup(`
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Zona ${props.zone_id}</h3>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center;">
              ${props.mean_score.toFixed(1)}/100
            </div>
            <div style="text-align: center; color: #7f8c8d; font-size: 12px;">Puntuación Global</div>
          </div>
          <table style="width: 100%; font-size: 13px;">
            <tr><td><strong>Anglo:</strong></td><td style="text-align: right;">${props.anglo_score_pct.toFixed(1)}%</td></tr>
            <tr><td><strong>Drive-through:</strong></td><td style="text-align: right;">${props.drive_score_pct.toFixed(1)}%</td></tr>
            <tr><td><strong>Ocasión:</strong></td><td style="text-align: right;">${props.occasion_score_pct.toFixed(1)}%</td></tr>
            <tr><td><strong>Valor:</strong></td><td style="text-align: right;">${props.value_opportunity_pct.toFixed(1)}%</td></tr>
          </table>
          <hr style="margin: 10px 0;">
          <div style="font-size: 12px; color: #7f8c8d;">
            <strong>Celdas:</strong> ${props.cell_count}<br>
            <strong>Dist. arteriales:</strong> ${props.dist_arterial_m.toFixed(0)}m<br>
            <strong>Competencia (2km):</strong> ${props.competition_2km} (${props.dt_competition_2km} DT)
          </div>
        </div>
      `, {maxWidth: 300});
    }
  }).addTo(layerGroups["Zonas Seleccionadas"]);

  // 2. Candidate cells layer
  L.geoJSON(candidateCells, {
    style: (feature) => ({
      color: '#95a5a6',
      weight: 0.5,
      fillColor: scoreColor(feature.properties.final_score),
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindTooltip(`
        <div style="font-size: 12px;">
          <strong>Score:</strong> ${props.final_score.toFixed(1)}<br>
          <strong>Rank:</strong> No. ${props.rank}
        </div>
      `, {sticky: true});
    }
  }).addTo(layerGroups["Celdas Candidatas"]);

  // 3. Competition layer
  L.geoJSON(competition, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: '#e74c3c',
        color: '#c0392b',
        weight: 1,
        fillOpacity: 0.6
      });
    }
  }).addTo(layerGroups["Competencia"]);

  // 4-9. Other layers (simplified)
  [
    [education, "Educación", '#3498db'],
    [government, "Gobierno", '#9b59b6'],
    [malls, "Centros Comerciales", '#f39c12'],
    [transit, "Transporte Público", '#1abc9c']
  ].forEach(([data, name, color]) => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 4,
        fillColor: color,
        color: color,
        weight: 1,
        fillOpacity: 0.7
      })
    }).addTo(layerGroups[name]);
  });

  // Pricing hex
  L.geoJSON(pricingHex, {
    style: (feature) => ({
      color: '#7f8c8d',
      weight: 1,
      fillColor: priceColor(feature.properties.price_median || 1),
      fillOpacity: 0.5
    })
  }).addTo(layerGroups["Precios (Hex)"]);

  // Value metrics
  L.geoJSON(valueMetrics, {
    pointToLayer: (feature, latlng) => {
      const gap = feature.properties.value_gap_to_market || 0;
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: valueColor(gap),
        color: '#34495e',
        weight: 1,
        fillOpacity: 0.7
      });
    }
  }).addTo(layerGroups["Valor Percibido"]);

  // Initial setup - show default layers
  layerGroups["Zonas Seleccionadas"].addTo(theMap);
  layerGroups["Celdas Candidatas"].addTo(theMap);

  // Update layers based on controls
  Object.keys(layerGroups).forEach(key => {
    const shouldShow = layerControls.includes(key);
    const isShowing = theMap.hasLayer(layerGroups[key]);
    
    if (shouldShow && !isShowing) {
      layerGroups[key].addTo(theMap);
    } else if (!shouldShow && isShowing) {
      theMap.removeLayer(layerGroups[key]);
    }
  });

  // Handle zone zoom
  if (selectedZone === 0) {
    theMap.setView([29.76, -95.36], 10);
  } else {
    const zone = metadata.zones.find(z => z.zone_id === selectedZone);
    if (zone) {
      theMap.setView([zone.centroid[1], zone.centroid[0]], 13);
    }
  }

  // Clean up on invalidation
  invalidation.then(() => theMap.remove());
})();
```

---

## Resumen de Zonas Seleccionadas

```js
(function() {
  const areaNames = {
    1: "Energy Corridor / Memorial",
    2: "Spring Branch / Long Point",
    3: "Pasadena / Clear Lake",
    4: "Westchase / Gessner",
    5: "Humble / IAH Area"
  };

  const scoreColor = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);
  
  const cards = metadata.zones.map(zone => {
    return html`
      <div style="border: 2px solid ${scoreColor(zone.score)}; border-radius: 8px; padding: 20px; margin: 10px 0; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #2c3e50;">Zona ${zone.zone_id}: ${areaNames[zone.zone_id]}</h3>
          <div style="font-size: 32px; font-weight: bold; color: ${scoreColor(zone.score)};">
            ${zone.score.toFixed(1)}
          </div>
        </div>
        <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div>
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 3px;">Población Anglo</div>
            <div style="font-size: 18px; font-weight: bold;">${zone.kpis.anglo_pct.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 3px;">Drive-Through</div>
            <div style="font-size: 18px; font-weight: bold;">${zone.kpis.drive_pct.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 3px;">Ocasión Consumo</div>
            <div style="font-size: 18px; font-weight: bold;">${zone.kpis.occasion_pct.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 3px;">Oportunidad Valor</div>
            <div style="font-size: 18px; font-weight: bold;">${zone.kpis.value_pct.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    `;
  });
  
  display(html`<div>${cards}</div>`);
})();
```

---

## Leyendas

### Escala de Puntuación (Celdas y Zonas)
- 🟢 **90-100**: Excelente
- 🟡 **70-90**: Muy Buena
- 🟠 **50-70**: Buena
- 🔴 **<50**: Limitada

### Capas de Contexto
- 🔴 **Competencia**: Restaurantes existentes
- 🔵 **Educación**: Escuelas y universidades
- 🟣 **Gobierno**: Oficinas gubernamentales
- 🟠 **Centros Comerciales**: Malls y plazas
- 🟢 **Transporte Público**: Estaciones y paradas

---

## Próximos Pasos

1. **Reconocimiento de Campo**: Visitar cada zona
2. **Análisis Inmobiliario**: Identificar locales disponibles
3. **Estudio de Factibilidad**: Proyecciones financieras
4. **Priorización**: Definir orden de apertura

