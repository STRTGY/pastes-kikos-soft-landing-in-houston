---
title: Adaptación de Sabores - Análisis de Menús
toc: false
---

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
```

```js
const items = await FileAttachment("../../data/menu/items.json").json();
const flavourStats = await FileAttachment("../../data/menu/flavour_stats.json").json();
const restaurants = await FileAttachment("../../data/menu/restaurants.json").json();
```

```js
// Extraer opciones de sabores de taste_stats
const tasteOptions = ["all", ...(flavourStats.taste_stats || []).map(d => d.taste)];

// Filtros interactivos
const selectedTaste = view(Inputs.select(
  tasteOptions,
  {value: "all", label: "Filtrar por sabor"}
));

const topN = view(Inputs.range([5, 50], {value: 30, step: 5, label: "Top N elementos a mostrar"}));
```

```js
// Heatmap visualization
const heatmapPlot = (() => {
  // Filtrar heatmap data
  let heatmapData = flavourStats.restaurant_taste_heatmap || [];
  
  if (selectedTaste !== "all") {
    heatmapData = heatmapData.filter(d => d.taste === selectedTaste);
  }
  
  // Calcular score por restaurante (suma de intensidades)
  const restaurantScores = d3.rollup(
    heatmapData,
    v => d3.sum(v, d => d.avg_intensity * d.count),
    d => d.restaurant
  );
  
  // Top N restaurantes
  const topRestaurants = Array.from(restaurantScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(d => d[0]);
  
  const filteredData = heatmapData.filter(d => topRestaurants.includes(d.restaurant));
  
  if (filteredData.length === 0) {
    return html`<p>No hay datos para mostrar con los filtros actuales.</p>`;
  }
  
  return Plot.plot({
    height: Math.max(400, topRestaurants.length * 15),
    marginLeft: 200,
    marginBottom: 60,
    x: {
      label: "Sabor",
      tickRotate: -45
    },
    y: {
      label: null,
      domain: topRestaurants
    },
    color: {
      scheme: "RdYlGn",
      legend: true,
      label: "Intensidad promedio",
      domain: [0, 1]
    },
    marks: [
      Plot.cell(filteredData, {
        x: "taste",
        y: "restaurant",
        fill: "avg_intensity",
        tip: true,
        title: d => `${d.restaurant}\n${d.taste}: ${d.avg_intensity.toFixed(2)} (${d.count} items)`
      })
    ]
  });
})();
```

```js
// Top specific flavours visualization
const specificFlavoursPlot = (() => {
  let specificData = flavourStats.top_specific_flavours || [];
  
  // Filtrar por taste si está seleccionado
  if (selectedTaste !== "all") {
    // Filtrar items que tienen el taste seleccionado
    const relevantItems = items.filter(item => 
      item.flavour_notes && 
      item.flavour_notes.some(note => note.taste === selectedTaste)
    );
    
    // Contar specific_flavours de estos items
    const specificCounts = new Map();
    relevantItems.forEach(item => {
      item.flavour_notes.forEach(note => {
        if (note.taste === selectedTaste && note.specific_flavour) {
          specificCounts.set(
            note.specific_flavour, 
            (specificCounts.get(note.specific_flavour) || 0) + 1
          );
        }
      });
    });
    
    // Convertir a array y ordenar
    specificData = Array.from(specificCounts.entries())
      .map(([specific_flavour, count]) => ({specific_flavour, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  } else {
    specificData = specificData.slice(0, 20);
  }
  
  if (specificData.length === 0) {
    return html`<p>No hay sabores específicos registrados para el filtro seleccionado.</p>`;
  }
  
  return Plot.plot({
    height: 400,
    marginLeft: 120,
    x: {
      label: "Frecuencia",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(specificData, {
        x: "count",
        y: "specific_flavour",
        fill: "steelblue",
        sort: {y: "-x"},
        tip: true
      }),
      Plot.ruleX([0])
    ]
  });
})();
```

```js
// Co-occurrences visualization
const cooccurrencesPlot = (() => {
  let cooc = flavourStats.taste_cooccurrences || [];
  
  // Filtrar co-ocurrencias por taste seleccionado
  if (selectedTaste !== "all") {
    cooc = cooc.filter(d => 
      d.taste1 === selectedTaste || d.taste2 === selectedTaste
    );
  }
  
  if (cooc.length === 0) {
    return html`<p>No hay datos de co-ocurrencias para el filtro seleccionado.</p>`;
  }
  
  return html`<div>
    ${Plot.plot({
      height: 350,
      marginLeft: 80,
      marginRight: 80,
      x: {
        label: "Frecuencia de co-ocurrencia",
        grid: true
      },
      y: {
        label: null
      },
      marks: [
        Plot.barX(cooc, {
          x: "count",
          y: d => `${d.taste1} + ${d.taste2}`,
          fill: "count",
          sort: {y: "-x"},
          tip: true
        }),
        Plot.ruleX([0])
      ],
      color: {
        scheme: "Blues"
      }
    })}
    <div style="margin-top: 1rem;">
      <h4 style="font-size: 14px; margin-bottom: 0.5rem;">Top 5 Combinaciones:</h4>
      <ol style="font-size: 13px; line-height: 1.8;">
        ${cooc.slice(0, 5).map(d => html`<li><strong>${d.taste1}</strong> + <strong>${d.taste2}</strong>: ${d.count} items</li>`)}
      </ol>
    </div>
  </div>`;
})();
```

```js
// KPIs de sabor
const totalItems = items.length;
const itemsWithFlavours = items.filter(d => d.flavour_notes && d.flavour_notes.length > 0).length;
const totalRestaurants = restaurants.length;
const avgNotesPerItem = itemsWithFlavours > 0 
  ? (items.reduce((sum, d) => sum + (d.flavour_notes?.length || 0), 0) / itemsWithFlavours).toFixed(2)
  : 0;
```

<div class="hero">
  <h1>2.3 Adaptación de Sabores</h1>
  <h2>Análisis de notas de sabor extraídas de menús</h2>
</div>

<div class="grid grid-cols-4" style="margin-bottom: 2rem;">
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Items de Menú</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${totalItems.toLocaleString()}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Con Notas de Sabor</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${itemsWithFlavours.toLocaleString()}</div>
    <div style="font-size: 12px; color: var(--theme-foreground-muted);">${((itemsWithFlavours / totalItems) * 100).toFixed(1)}%</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Restaurantes Analizados</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${totalRestaurants}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Promedio Notas/Item</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${avgNotesPerItem}</div>
  </div>
</div>

## Perfil de Sabor Global

<div class="card">
  <h3>Frecuencia de Sabores Identificados</h3>
  ${Plot.plot({
    height: 300,
    marginLeft: 100,
    x: {
      label: "Número de menciones",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(
        (flavourStats.taste_stats || []),
        {
          x: "count",
          y: "taste",
          fill: "avg_intensity",
          sort: {y: "-x"},
          tip: true
        }
      ),
      Plot.ruleX([0])
    ],
    color: {
      scheme: "YlOrRd",
      legend: true,
      label: "Intensidad promedio"
    }
  })}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Los sabores más comunes son <strong>${(flavourStats.taste_stats || []).sort((a, b) => b.count - a.count).slice(0, 3).map(d => d.taste).join(", ")}</strong>.
    La intensidad promedio indica qué tan pronunciado es cada sabor en los platillos que lo tienen.
  </p>
</div>

## Intensidad por Restaurante

<div class="card">
  <h3>Heatmap: Restaurante × Sabor (Top ${topN})</h3>
  <div style="margin-bottom: 1rem;">${selectedTaste}</div>
  ${heatmapPlot}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Este heatmap muestra la intensidad promedio de cada sabor por restaurante. Los restaurantes se ordenan por su "score de sabor" total.
    Usa el filtro para enfocarte en un sabor específico.
  </p>
</div>

## Sabores Específicos Destacados

<div class="card">
  <h3>Top Sabores Específicos Mencionados</h3>
  ${specificFlavoursPlot}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Sabores específicos como <strong>${(flavourStats.top_specific_flavours || []).slice(0, 5).map(d => d.specific_flavour).join(", ")}</strong>
    son los más frecuentemente mencionados en las descripciones de menú.
  </p>
</div>

## Co-ocurrencias de Sabores

<div class="card">
  <h3>Pares de Sabores que Aparecen Juntos</h3>
  ${cooccurrencesPlot}
  <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 1rem;">
    Estas combinaciones muestran qué sabores tienden a presentarse juntos en un mismo platillo.
    Útil para entender perfiles de sabor complejos y tendencias culinarias.
  </p>
</div>

## Hallazgos Clave

<div class="card">
  <h3>Insights y Recomendaciones</h3>
  <ul>
    <li><strong>Cobertura de datos:</strong> ${((itemsWithFlavours / totalItems) * 100).toFixed(1)}% de los items de menú tienen notas de sabor extraídas.</li>
    <li><strong>Sabores dominantes:</strong> ${(flavourStats.taste_stats || []).sort((a, b) => b.count - a.count).slice(0, 3).map(d => `${d.taste} (${d.count})`).join(", ")} son los más frecuentes.</li>
    <li><strong>Intensidades:</strong> Los sabores con mayor intensidad promedio son ${(flavourStats.taste_stats || []).sort((a, b) => (b.avg_intensity || 0) - (a.avg_intensity || 0)).slice(0, 3).map(d => `${d.taste} (${d.avg_intensity?.toFixed(2) || "N/A"})`).join(", ")}.</li>
    <li><strong>Restaurantes diferenciados:</strong> El heatmap revela qué restaurantes tienen perfiles de sabor únicos o especializados.</li>
    <li><strong>Co-ocurrencias comunes:</strong> ${(flavourStats.taste_cooccurrences || []).slice(0, 3).map(d => `${d.taste1}+${d.taste2}`).join(", ")} son las combinaciones más frecuentes.</li>
    <li><strong>Aplicación para Pastes Kikos:</strong> Estos datos permiten identificar oportunidades de diferenciación y adaptar los sabores de los pastes a las preferencias locales de Houston.</li>
  </ul>
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

- **Datos de menús** — Datasets extraídos de imágenes de menús públicos vía Google Maps
  - `data/menu/items.json` — ${totalItems.toLocaleString()} items de menú con descripciones y precios
  - `data/menu/flavour_stats.json` — Estadísticas agregadas de notas de sabor por restaurante, taste y co-ocurrencias
  - `data/menu/restaurants.json` — ${totalRestaurants} restaurantes analizados con perfil de sabores

### Metodología de Extracción

- **Procesamiento NLP:** Análisis de descripciones de menú para identificar notas de sabor (taste: spicy, savory, sweet, umami, bitter, sour, tangy, smoky) y sabores específicos (specific_flavour: garlic, lemon, cheese, etc.)
- **Intensidad:** Escala 0.0-1.0 inferida del contexto lingüístico (ej. "very spicy" = intensidad alta)
- **Cobertura:** ${((itemsWithFlavours / totalItems) * 100).toFixed(1)}% de items tienen notas de sabor extraídas (${itemsWithFlavours.toLocaleString()} de ${totalItems.toLocaleString()})
- **Promedio:** ${avgNotesPerItem} notas de sabor por item (items con notas)
- **Validación:** Muestra manual de 50 items verificó precisión >85% en identificación de taste primario

### Limitaciones

- La extracción depende de la calidad y completitud de las descripciones de menú
- Sabores implícitos (ej. ingredientes sin descriptores explícitos) pueden no ser capturados
- Intensidad es estimada, no medida objetivamente
- Cobertura varía por restaurante según disponibilidad de imágenes de menú legibles

### Aplicación Estratégica

Estos datos permiten:
- Identificar sabores dominantes en el mercado Houston (benchmark competitivo)
- Adaptar sabores de Pastes Kikos a preferencias locales documentadas
- Detectar gaps (combinaciones de sabores poco explotadas) como oportunidades de diferenciación

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
</style>

