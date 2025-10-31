---
title: Propuesta de Valor
theme: [glacier, wide]
sidebar: true
toc: false
keywords: propuesta de valor, Pastes Kikos, diferenciadores, frescura, calidad, price, QSR, comida rápida, autenticidad mexicana
---

<div class="hero">
  <h1 id="2-1-propuesta-de-valor">2.1 Propuesta de Valor</h1>
</div>

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
```

```js
const reviews = await FileAttachment("../../data/static/reviews_summary.json").json();

// Load pricing data
const hexEnriched = await FileAttachment("../../data/static/pricing/hex_r8_overall_enriched.geojson").json();
const summary = await FileAttachment("../../data/static/pricing/summary.csv").csv();
const categorySummary = await FileAttachment("../../data/static/pricing/category_summaries.csv").csv({typed: true});

// Load menu and flavor data
const menuItems = await FileAttachment("../../data/menu/items.json").json();
const priceStats = await FileAttachment("../../data/menu/price_stats.json").json();
const flavourStats = await FileAttachment("../../data/menu/flavour_stats.json").json();
const restaurants = await FileAttachment("../../data/menu/restaurants.json").json();

function kpiCard(title, value, suffix = "", explanation = "") {
  const formatted = typeof value === "number" ? value.toLocaleString("es-MX", {maximumFractionDigits: 2}) : value;
  return html`<div class="card">
    <h2>${title} ${explanation ? html`<span class="tooltip" title="${explanation}">ℹ️</span>` : ""}</h2>
    <span class="big">${formatted}${suffix ? ` ${suffix}` : ""}</span>
  </div>`;
}

function sentimentDistributionChart(data, {width} = {}) {
  const dist = data.sentiment.distribution;
  const chartData = [
    {sentiment: "Muy negativo", count: dist.very_negative, order: 1},
    {sentiment: "Negativo", count: dist.negative, order: 2},
    {sentiment: "Neutral", count: dist.neutral, order: 3},
    {sentiment: "Positivo", count: dist.positive, order: 4},
    {sentiment: "Muy positivo", count: dist.very_positive, order: 5}
  ];
  return Plot.plot({
    width,
    height: 300,
    marginLeft: 110,
    x: {label: "Cantidad de reseñas"},
    y: {label: null, domain: chartData.map(d => d.sentiment)},
    color: {
      domain: ["Muy negativo", "Negativo", "Neutral", "Positivo", "Muy positivo"],
      range: ["#dc2626", "#f97316", "#eab308", "#84cc16", "#22c55e"]
    },
    marks: [
      Plot.barX(chartData, {
        x: "count",
        y: "sentiment",
        fill: "sentiment",
        tip: true
      }),
      Plot.ruleX([0])
    ]
  });
}

function aspectScoresChart(data, {width} = {}) {
  const aspects = data.top_aspects.map(a => ({
    aspect: a.aspect,
    mean_score: a.mean_score || 0,
    count: a.count
  }));
  return Plot.plot({
    width,
    height: 400,
    marginLeft: 110,
    x: {label: "Score medio (0-5)", domain: [0, 5]},
    y: {label: null, domain: aspects.map(d => d.aspect)},
    marks: [
      Plot.barX(aspects, {
        x: "mean_score",
        y: "aspect",
        fill: "steelblue",
        tip: true
      }),
      Plot.ruleX([3], {stroke: "red", strokeDasharray: "4 2"}),
      Plot.text(aspects, {
        x: "mean_score",
        y: "aspect",
        text: d => d.count,
        dx: 15,
        fill: "currentColor",
        fontSize: 10
      })
    ]
  });
}

// Helper functions for pricing analysis
function mixedValue(props, metric, weight) {
  const w = weight / 100;
  const mMenu = props[`${metric}_menu`];
  const mGoogle = props[`${metric}_google`];
  
  if (mMenu == null && mGoogle == null) return null;
  if (mMenu == null) return mGoogle;
  if (mGoogle == null) return mMenu;
  
  return w * mMenu + (1 - w) * mGoogle;
}

function filterData(geojson, category, minN) {
  if (!geojson || !geojson.features) return {type: "FeatureCollection", features: []};
  
  let filtered = geojson.features;
  
  if (category !== "overall") {
    filtered = filtered.filter(f => f.properties.category_main === category);
  }
  
  filtered = filtered.filter(f => {
    const nGoogle = f.properties.n_google || 0;
    const nMenu = f.properties.n_menu || 0;
    return (nGoogle + nMenu) >= minN;
  });
  
  return {type: "FeatureCollection", features: filtered};
}
```

<div class="text">
  <p>La propuesta de valor de Pastes Kikos se construye sobre tres pilares fundamentales que la distinguen en el competitivo mercado de comida rápida de Houston:</p>
  <ul>
    <li><strong>Frescura y calidad</strong>: Producto recién horneado, sin conservadores, elaborado con ingredientes naturales.</li>
    <li><strong>Versatilidad y satisfacción</strong>: Opciones dulces y saladas que constituyen una comida completa con dos piezas.</li>
    <li><strong>Precio competitivo</strong>: Posicionamiento más económico que una pizza, con un ticket promedio accesible para el consumidor diario.</li>
  </ul>
  <p>Este análisis integra percepciones de valor extraídas de <strong>${reviews.metadata.total_reviews.toLocaleString()} reseñas</strong> de restaurantes competidores en Houston, procesadas mediante análisis de sentimientos y aspectos clave valorados por los consumidores.</p>
</div>

---

<div class="hero">
  <h2 id="fit-oferta-valor">2.1.1 Fit de Oferta de Valor (Drive-through)</h2>
  <h3>Evaluación cuantitativa de alineación con el mercado de Houston</h3>
</div>

```js
// Controls for scenario analysis
const priceScenarios = view(Inputs.checkbox(
  [6.5, 7.0, 7.5, 8.0, 8.5],
  {value: [7.0, 7.5], label: "Escenarios de precio (2 piezas)", format: x => `$${x.toFixed(2)}`}
));

const selectedCategoryFit = view(Inputs.select(
  ["overall", ...categorySummary.map(d => d.category)],
  {value: "overall", label: "Categoría de comparación"}
));

const weightMenuFit = view(Inputs.range([0, 100], {
  value: 70,
  step: 1,
  label: "Mezcla de fuentes (% Menú vs Google)"
}));

const weightPrice = view(Inputs.range([0, 100], {
  value: 40,
  step: 5,
  label: "Peso Precio"
}));

const weightSentiment = view(Inputs.range([0, 100], {
  value: 40,
  step: 5,
  label: "Peso Sentimiento"
}));

const weightFlavour = view(Inputs.range([0, 100], {
  value: 20,
  step: 5,
  label: "Peso Sabor"
}));

// Normalize weights to 100%
const totalWeight = weightPrice + weightSentiment + weightFlavour;
const normWeightPrice = (weightPrice / totalWeight) * 100;
const normWeightSentiment = (weightSentiment / totalWeight) * 100;
const normWeightFlavour = (weightFlavour / totalWeight) * 100;

// Target flavors for Kikos (checklist)
const targetFlavours = view(Inputs.checkbox(
  (flavourStats.taste_stats || []).map(d => d.taste),
  {
    value: ["savory", "umami", "sweet", "spicy"],
    label: "Sabores objetivo Pastes Kikos"
  }
));
```

```js
// Compute PrecioFit subindex (0-100)
const priceFitScore = (() => {
  if (priceScenarios.length === 0) return 0;
  
  const minCount = 5;
  const currentData = filterData(hexEnriched, selectedCategoryFit, minCount);
  
  const mixedPrices = currentData.features
    .map(f => mixedValue(f.properties, "price_mean", weightMenuFit))
    .filter(v => v != null)
    .sort((a, b) => a - b);
  
  if (mixedPrices.length === 0) return 0;
  
  const p50 = d3.quantile(mixedPrices, 0.50);
  const p75 = d3.quantile(mixedPrices, 0.75);
  const p90 = d3.quantile(mixedPrices, 0.90);
  
  const scenarioScores = priceScenarios.map(scenario => {
    if (scenario <= p50) return 100;
    if (scenario <= p75) return 75;
    if (scenario <= p90) return 50;
    return 25;
  });
  
  return Math.max(...scenarioScores);
})();

// Compute SentimentFit subindex (0-100)
const sentimentFitScore = (() => {
  const dist = reviews.sentiment.distribution;
  const total = reviews.sentiment.count;
  const positiveShare = ((dist.positive + dist.very_positive) / total) * 100;
  
  const foodAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "food");
  const serviceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "service");
  const priceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "price");
  
  const foodScore = foodAspect ? (foodAspect.mean_score / 5) * 100 : 0;
  const serviceScore = serviceAspect ? (serviceAspect.mean_score / 5) * 100 : 0;
  const priceScore = priceAspect ? (priceAspect.mean_score / 5) * 100 : 0;
  
  const aspectsAvg = (foodScore + serviceScore + priceScore) / 3;
  
  return 0.6 * positiveShare + 0.4 * aspectsAvg;
})();

// Compute FlavourFit subindex (0-100) - Jaccard weighted by frequency
const flavourFitScore = (() => {
  if (targetFlavours.length === 0) return 0;
  
  const marketTastes = flavourStats.taste_stats || [];
  const totalMarketCount = d3.sum(marketTastes, d => d.count);
  
  const marketSet = new Set(marketTastes.map(d => d.taste));
  const targetSet = new Set(targetFlavours);
  
  const intersection = [...targetSet].filter(t => marketSet.has(t));
  const union = new Set([...marketSet, ...targetSet]);
  
  const intersectionWeight = d3.sum(
    intersection.map(t => {
      const item = marketTastes.find(d => d.taste === t);
      return item ? item.count : 0;
    })
  );
  
  const jaccard = intersectionWeight / totalMarketCount;
  
  return jaccard * 100;
})();

// Compute composite MarketFit index
const marketFitScore = (
  (normWeightPrice / 100) * priceFitScore +
  (normWeightSentiment / 100) * sentimentFitScore +
  (normWeightFlavour / 100) * flavourFitScore
);
```

<div class="card" style="margin-bottom: 2rem; padding: 1.5rem;">
  <h3 style="margin-top: 0;">Controles de Análisis</h3>
  <div class="grid grid-cols-2" style="gap: 1.5rem;">
    <div>
      <h4 style="font-size: 14px; margin: 0 0 0.5rem 0;">Escenarios y Fuentes</h4>
      ${priceScenarios}
      ${selectedCategoryFit}
      ${weightMenuFit}
    </div>
    <div>
      <h4 style="font-size: 14px; margin: 0 0 0.5rem 0;">Pesos de Componentes (Total: 100%)</h4>
      ${weightPrice}
      ${weightSentiment}
      ${weightFlavour}
      <div style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 0.5rem;">
        Normalizados: ${normWeightPrice.toFixed(0)}% / ${normWeightSentiment.toFixed(0)}% / ${normWeightFlavour.toFixed(0)}%
      </div>
    </div>
  </div>
  <div style="margin-top: 1rem;">
    ${targetFlavours}
  </div>
</div>

<div class="grid grid-cols-4" style="margin-bottom: 2rem;">
  ${kpiCard("MarketFit", marketFitScore, "", "Índice compuesto que combina precio, sentimiento y sabor según los pesos especificados")}
  ${kpiCard("PrecioFit", priceFitScore, "", `Mejor escenario: $${priceScenarios && priceScenarios.length > 0 ? Math.min(...priceScenarios).toFixed(2) : "N/A"} - Percentil vs mercado (100=mejor)`)}
  ${kpiCard("SentimentFit", sentimentFitScore, "", "60% share positivo + 40% promedio aspectos food/service/price")}
  ${kpiCard("FlavourFit", flavourFitScore, "", "Similitud Jaccard ponderada entre sabores objetivo y frecuencia de mercado")}
</div>

```js
import {ValorFitAnalysis} from "../../components/ValorFitAnalysis.js";
```

${ValorFitAnalysis({
  reviews,
  hexEnriched,
  summary,
  categorySummary,
  menuItems,
  flavourStats,
  restaurants,
  priceScenarios,
  selectedCategoryFit,
  weightMenuFit,
  weightPrice,
  weightSentiment,
  weightFlavour,
  targetFlavours,
  priceFitScore,
  sentimentFitScore,
  flavourFitScore,
  marketFitScore,
  normWeightPrice,
  normWeightSentiment,
  normWeightFlavour
})}

<div class="card" style="margin-bottom: 2rem; background: var(--theme-background-alt);">
  <h3>Exportar Análisis</h3>
    ${(() => {
      const minCount = 5;
      const currentData = filterData(hexEnriched, selectedCategoryFit, minCount);
      
      const mixedPrices = currentData.features
        .map(f => mixedValue(f.properties, "price_mean", weightMenuFit))
        .filter(v => v != null);
      
      if (mixedPrices.length === 0) {
        return html`<p>No hay datos suficientes para mostrar la distribución de precios.</p>`;
      }
      
      const cityMean = parseFloat(summary.find(d => d.metric === "price_mean_city")?.value || 0);
      
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
        marks: [
          Plot.rectY(mixedPrices, Plot.binX({y: "count"}, {
            x: d => d,
            fill: "#3498db",
            thresholds: 30,
            opacity: 0.6
          })),
          ...(priceScenarios && priceScenarios.length > 0 ? priceScenarios.map(scenario => Plot.ruleX([scenario], {
            stroke: "#e74c3c",
            strokeWidth: 2,
            strokeDasharray: "4 2"
          })) : []),
          Plot.ruleX([cityMean], {
            stroke: "#2ecc71",
            strokeWidth: 2
          }),
          Plot.ruleY([0])
        ]
      });
    })()}
    <div style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 1rem;">
      <span style="color: #e74c3c;">━━</span> Escenarios Pastes Kikos: ${priceScenarios.map(s => `$${s.toFixed(2)}`).join(", ")} |
      <span style="color: #2ecc71;">━━</span> Media ciudad: ${parseFloat(summary.find(d => d.metric === "price_mean_city")?.value || 0).toFixed(2)}
    </div>
  </div>
</div>

<div class="grid grid-cols-2" style="margin-bottom: 2rem; gap: 1.5rem;">
  <div class="card">
    <h3>Distribución de Sentimientos</h3>
    ${resize((width) => sentimentDistributionChart(reviews, {width}))}
  </div>
  
  <div class="card">
    <h3>Scores de Aspectos Clave (0-5)</h3>
    ${(() => {
      const topAspects = reviews.top_aspects.slice(0, 10);
      return Plot.plot({
        height: 300,
        marginLeft: 100,
        x: {
          label: "Score medio",
          domain: [0, 5],
          grid: true
        },
        y: {
          label: null
        },
        marks: [
          Plot.barX(topAspects, {
            x: "mean_score",
            y: "aspect",
            fill: "steelblue",
            sort: {y: "-x"},
            tip: true
          }),
          Plot.ruleX([3], {
            stroke: "red",
            strokeDasharray: "4 2"
          })
        ]
      });
    })()}
  </div>
</div>

<div class="grid grid-cols-1" style="margin-bottom: 2rem;">
  <div class="card">
    <h3>Matriz Valor-Precio 2×2</h3>
    ${(() => {
      const cityMean = parseFloat(summary.find(d => d.metric === "price_mean_city")?.value || 0);
      const bestScenario = priceScenarios.length > 0 ? Math.min(...priceScenarios) : 7.0;
      
      const foodAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "food");
      const serviceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "service");
      
      const foodScore = foodAspect ? foodAspect.mean_score : 3.5;
      const serviceScore = serviceAspect ? serviceAspect.mean_score : 3.5;
      const satisfactionScore = (0.6 * foodScore + 0.4 * serviceScore);
      
      const priceDeviation = ((bestScenario - cityMean) / cityMean) * 100;
      
      // Determine quadrant
      let quadrant = "";
      let quadrantColor = "";
      let recommendation = "";
      
      if (priceDeviation <= 0 && satisfactionScore >= 4.0) {
        quadrant = "Alto Valor (Precio bajo + Calidad alta)";
        quadrantColor = "#10b981";
        recommendation = "Posición óptima: precio competitivo con alta satisfacción esperada. Enfatizar valor en marketing.";
      } else if (priceDeviation > 0 && satisfactionScore >= 4.0) {
        quadrant = "Premium (Precio alto + Calidad alta)";
        quadrantColor = "#3b82f6";
        recommendation = "Justificar precio premium con diferenciación clara: frescura, autenticidad, experiencia superior.";
      } else if (priceDeviation <= 0 && satisfactionScore < 4.0) {
        quadrant = "Economía (Precio bajo + Calidad estándar)";
        quadrantColor = "#f59e0b";
        recommendation = "Riesgo de percepción de baja calidad. Mejorar experiencia de producto y servicio antes del lanzamiento.";
      } else {
        quadrant = "Desalineado (Precio alto + Calidad estándar)";
        quadrantColor = "#ef4444";
        recommendation = "Posición vulnerable: reducir precio o mejorar significativamente calidad/servicio para competir.";
      }
      
      return html`<div>
        <div style="position: relative; width: 100%; height: 400px; background: #f3f4f6; border-radius: 8px; overflow: hidden;">
          <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #9ca3af;"></div>
          <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #9ca3af;"></div>
          
          <div style="position: absolute; top: 10px; left: 10px; font-size: 11px; color: #6b7280; font-weight: 600;">
            Alta Satisfacción (>4.0)
          </div>
          <div style="position: absolute; bottom: 10px; left: 10px; font-size: 11px; color: #6b7280; font-weight: 600;">
            Baja Satisfacción (<4.0)
          </div>
          <div style="position: absolute; top: 10px; left: 10px; font-size: 11px; color: #6b7280; font-weight: 600;">
            Precio bajo
          </div>
          <div style="position: absolute; top: 10px; right: 10px; font-size: 11px; color: #6b7280; font-weight: 600;">
            Precio alto
          </div>
          
          ${(() => {
            const xPos = 50 + (priceDeviation * 0.5);
            const yPos = 50 - ((satisfactionScore - 3.5) * 20);
            
            return html`<div style="
              position: absolute;
              left: ${Math.max(5, Math.min(95, xPos))}%;
              top: ${Math.max(5, Math.min(95, yPos))}%;
              transform: translate(-50%, -50%);
              background: ${quadrantColor};
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 700;
              font-size: 14px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.2);
              z-index: 10;
            ">
              Pastes Kikos
            </div>`;
          })()}
        </div>
        
        <div style="margin-top: 1rem; padding: 1rem; background: ${quadrantColor}22; border-left: 4px solid ${quadrantColor}; border-radius: 4px;">
          <div style="font-weight: 700; color: ${quadrantColor}; margin-bottom: 0.5rem;">
            Cuadrante: ${quadrant}
          </div>
          <div style="font-size: 13px; color: var(--theme-foreground);">
            <strong>Posición actual:</strong> Precio ${priceDeviation > 0 ? '+' : ''}${priceDeviation.toFixed(1)}% vs media ciudad ($${bestScenario.toFixed(2)} vs $${cityMean.toFixed(2)}), 
            Satisfacción esperada: ${satisfactionScore.toFixed(2)}/5.0
          </div>
          <div style="font-size: 13px; color: var(--theme-foreground); margin-top: 0.5rem;">
            <strong>Recomendación:</strong> ${recommendation}
          </div>
        </div>
      </div>`;
    })()}
  </div>
</div>

<div class="grid grid-cols-1" style="margin-bottom: 2rem;">
  <div class="card">
    <h3>Pilares de Valor: Alineación con Datos de Mercado</h3>
    ${(() => {
      const foodAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "food");
      const serviceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "service");
      
      const frescuraScore = foodAspect ? (foodAspect.mean_score / 5) * 100 : 0;
      const servicioScore = serviceAspect ? (serviceAspect.mean_score / 5) * 100 : 0;
      const precioScore = priceFitScore;
      
      const pillars = [
        {
          name: "Frescura y Calidad",
          score: frescuraScore,
          explanation: `Proxy: Score de 'food' en reseñas (${foodAspect?.mean_score.toFixed(2)}/5). Expectativa alta del mercado.`,
          color: "#22c55e"
        },
        {
          name: "Servicio Drive-Through",
          score: servicioScore,
          explanation: `Proxy: Score de 'service' en reseñas (${serviceAspect?.mean_score.toFixed(2)}/5). Crítico para QSR.`,
          color: "#3b82f6"
        },
        {
          name: "Precio Competitivo",
          score: precioScore,
          explanation: `PrecioFit calculado: escenarios vs distribución de mercado (percentil).`,
          color: "#f59e0b"
        }
      ];
      
      return html`<div>
        ${pillars.map(p => html`<div style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="font-size: 15px;">${p.name}</strong>
            <span style="font-size: 18px; font-weight: 700; color: ${p.color};">${p.score.toFixed(0)}/100</span>
          </div>
          <div style="width: 100%; height: 24px; background: #e5e7eb; border-radius: 12px; overflow: hidden; position: relative;">
            <div style="
              width: ${p.score}%;
              height: 100%;
              background: linear-gradient(90deg, ${p.color} 0%, ${p.color}dd 100%);
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            ${p.explanation}
          </div>
        </div>`)}
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--theme-background-alt); border-radius: 6px;">
          <strong style="font-size: 14px;">Interpretación:</strong>
          <p style="font-size: 13px; margin: 0.5rem 0 0 0; line-height: 1.6;">
            Los tres pilares de la propuesta de valor de Pastes Kikos se mapean a expectativas del mercado. 
            <strong>Frescura/Calidad</strong> se refleja en el aspecto 'food' (expectativa: ${frescuraScore.toFixed(0)}/100), 
            <strong>Servicio</strong> en 'service' (${servicioScore.toFixed(0)}/100), y 
            <strong>Precio</strong> en el posicionamiento competitivo (${precioScore.toFixed(0)}/100).
            Scores bajos indican áreas de riesgo que requieren atención antes del lanzamiento.
          </p>
        </div>
      </div>`;
    })()}
  </div>
</div>

<div class="grid grid-cols-1" style="margin-bottom: 2rem;">
  <div class="card">
    <h3>Comparación de Sabores: Mercado vs Objetivo Kikos</h3>
    ${(() => {
      const marketTastes = flavourStats.taste_stats || [];
      const targetSet = new Set(targetFlavours);
      
      const comparisonData = marketTastes.map(d => ({
        taste: d.taste,
        market_count: d.count,
        is_target: targetSet.has(d.taste) ? "Sí" : "No"
      }));
      
      return Plot.plot({
        height: 300,
        marginLeft: 100,
        x: {
          label: "Frecuencia en mercado",
          grid: true
        },
        y: {
          label: null
        },
        color: {
          domain: ["Sí", "No"],
          range: ["#22c55e", "#94a3b8"],
          legend: true,
          label: "Sabor objetivo Kikos"
        },
        marks: [
          Plot.barX(comparisonData, {
            x: "market_count",
            y: "taste",
            fill: "is_target",
            sort: {y: "-x"},
            tip: true
          }),
          Plot.ruleX([0])
        ]
      });
    })()}
    <p style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 1rem;">
      Los sabores marcados en verde son los seleccionados como objetivo para Pastes Kikos. 
      La altura de la barra indica su frecuencia en el mercado actual de Houston.
    </p>
  </div>
</div>

<div class="grid grid-cols-2" style="margin-bottom: 2rem; gap: 1.5rem;">
  <div class="card">
    <h3>Análisis de Sensibilidad: MarketFit</h3>
    ${(() => {
      const scenarios = [
        {label: "Actual", price: normWeightPrice, sentiment: normWeightSentiment, flavour: normWeightFlavour},
        {label: "Precio +10pp", price: Math.min(100, normWeightPrice + 10), sentiment: normWeightSentiment - 5, flavour: normWeightFlavour - 5},
        {label: "Sentimiento +10pp", price: normWeightPrice - 5, sentiment: Math.min(100, normWeightSentiment + 10), flavour: normWeightFlavour - 5},
        {label: "Sabor +10pp", price: normWeightPrice - 5, sentiment: normWeightSentiment - 5, flavour: Math.min(100, normWeightFlavour + 10)}
      ];
      
      const sensitivityData = scenarios.map(s => {
        const total = s.price + s.sentiment + s.flavour;
        const normPrice = (s.price / total) * 100;
        const normSentiment = (s.sentiment / total) * 100;
        const normFlavour = (s.flavour / total) * 100;
        
        const fit = (normPrice / 100) * priceFitScore + (normSentiment / 100) * sentimentFitScore + (normFlavour / 100) * flavourFitScore;
        
        return {
          scenario: s.label,
          marketFit: fit,
          delta: fit - marketFitScore
        };
      });
      
      return Plot.plot({
        height: 250,
        marginLeft: 120,
        x: {
          label: "MarketFit Score",
          grid: true
        },
        y: {
          label: null
        },
        marks: [
          Plot.barX(sensitivityData, {
            x: "marketFit",
            y: "scenario",
            fill: d => d.delta >= 0 ? "#22c55e" : "#ef4444",
            tip: true,
            title: d => `${d.scenario}: ${d.marketFit.toFixed(1)} (Δ${d.delta > 0 ? '+' : ''}${d.delta.toFixed(1)})`
          }),
          Plot.ruleX([marketFitScore], {
            stroke: "#3b82f6",
            strokeWidth: 2,
            strokeDasharray: "4 2"
          })
        ]
      });
    })()}
    <p style="font-size: 12px; color: var(--theme-foreground-muted); margin-top: 1rem;">
      Variación del MarketFit al ajustar pesos ±10 p.p. Útil para identificar qué componente tiene mayor impacto.
    </p>
  </div>
  
  <div class="card">
    <h3>Mix Dulce/Salado Recomendado</h3>
    ${(() => {
      const marketTastes = flavourStats.taste_stats || [];
      const sweetItem = marketTastes.find(d => d.taste === "sweet");
      const savoryItem = marketTastes.find(d => d.taste === "savory");
      const umamiItem = marketTastes.find(d => d.taste === "umami");
      
      const sweetCount = sweetItem ? sweetItem.count : 0;
      const savoryCount = (savoryItem ? savoryItem.count : 0) + (umamiItem ? umamiItem.count : 0);
      const total = sweetCount + savoryCount;
      
      const sweetShare = total > 0 ? (sweetCount / total) * 100 : 0;
      const savoryShare = 100 - sweetShare;
      
      return html`<div>
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 14px; margin-bottom: 0.75rem;">
            <strong>Mercado Houston:</strong>
          </div>
          <div style="display: flex; height: 40px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="
              width: ${savoryShare}%;
              background: linear-gradient(90deg, #3b82f6, #2563eb);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 13px;
            ">
              Salado ${savoryShare.toFixed(0)}%
            </div>
            <div style="
              width: ${sweetShare}%;
              background: linear-gradient(90deg, #f59e0b, #d97706);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 13px;
            ">
              Dulce ${sweetShare.toFixed(0)}%
            </div>
          </div>
        </div>
        
        <div style="padding: 1rem; background: var(--theme-background-alt); border-radius: 6px;">
          <strong style="font-size: 13px;">Recomendación para Combos 1+1:</strong>
          <ul style="font-size: 12px; margin: 0.5rem 0 0 1rem; padding: 0; line-height: 1.8;">
            <li>Priorizar <strong>salado</strong> como opción principal (${savoryShare.toFixed(0)}% de preferencia)</li>
            <li>Incluir <strong>dulce</strong> como complemento opcional para maximizar ticket</li>
            <li>Configuración sugerida: <strong>70% salado + 30% dulce</strong> en inventario inicial</li>
            <li>Monitorear preferencias post-lanzamiento para ajustar mix dinámicamente</li>
          </ul>
        </div>
      </div>`;
    })()}
  </div>
</div>

<div class="card" style="margin-bottom: 2rem;">
  <h3>Recomendaciones Estratégicas Basadas en Análisis</h3>
  ${(() => {
    const recommendations = [];
    
    // MarketFit overall
    if (marketFitScore >= 75) {
      recommendations.push({
        level: "success",
        title: "Alineación Global Excelente",
        text: `MarketFit de ${marketFitScore.toFixed(0)} indica fuerte alineación con el mercado de Houston. Proceder con confianza al lanzamiento.`
      });
    } else if (marketFitScore >= 60) {
      recommendations.push({
        level: "warning",
        title: "Alineación Global Moderada",
        text: `MarketFit de ${marketFitScore.toFixed(0)} sugiere ajustes estratégicos en componentes con scores bajos antes del lanzamiento.`
      });
    } else {
      recommendations.push({
        level: "danger",
        title: "Alineación Global Débil",
        text: `MarketFit de ${marketFitScore.toFixed(0)} indica necesidad de replantear elementos clave de la propuesta de valor.`
      });
    }
    
    // Price recommendations
    if (priceFitScore < 60) {
      const bestScenario = Math.min(...priceScenarios);
      recommendations.push({
        level: "warning",
        title: "Revisar Estrategia de Precio",
        text: `PrecioFit de ${priceFitScore.toFixed(0)} indica que los escenarios actuales (mejor: $${bestScenario.toFixed(2)}) están por encima de la media de mercado. Considerar escenarios más competitivos o enfatizar diferenciación de valor.`
      });
    } else if (priceFitScore >= 80) {
      recommendations.push({
        level: "success",
        title: "Precio Competitivo Óptimo",
        text: `PrecioFit de ${priceFitScore.toFixed(0)} confirma que los escenarios están bien posicionados. Mantener rangos actuales y considerar pruebas de elasticidad precio-demanda.`
      });
    }
    
    // Sentiment recommendations
    const foodAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "food");
    const serviceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "service");
    
    if (sentimentFitScore < 70) {
      recommendations.push({
        level: "warning",
        title: "Fortalecer Experiencia del Cliente",
        text: `SentimentFit de ${sentimentFitScore.toFixed(0)} sugiere que el mercado es exigente. Priorizar calidad (food score: ${foodAspect?.mean_score.toFixed(2)}/5) y servicio drive-through (service score: ${serviceAspect?.mean_score.toFixed(2)}/5).`
      });
    }
    
    if (serviceAspect && serviceAspect.mean_score < 4.0) {
      recommendations.push({
        level: "warning",
        title: "Optimizar Operaciones Drive-Through",
        text: `Score de service (${serviceAspect.mean_score.toFixed(2)}/5) indica que la velocidad y amabilidad son puntos críticos. Invertir en capacitación y procesos eficientes.`
      });
    }
    
    // Flavor recommendations
    if (flavourFitScore < 50) {
      recommendations.push({
        level: "warning",
        title: "Ampliar Perfil de Sabores",
        text: `FlavourFit de ${flavourFitScore.toFixed(0)} sugiere baja similitud con preferencias de mercado. Considerar incorporar sabores más frecuentes en Houston o educar al consumidor sobre la propuesta única de Pastes Kikos.`
      });
    }
    
    const marketTastes = flavourStats.taste_stats || [];
    const sweetItem = marketTastes.find(d => d.taste === "sweet");
    const savoryItem = marketTastes.find(d => d.taste === "savory");
    
    if (sweetItem && savoryItem) {
      const sweetShare = (sweetItem.count / (sweetItem.count + savoryItem.count)) * 100;
      recommendations.push({
        level: "info",
        title: "Estrategia de Mix Dulce/Salado",
        text: `Mercado muestra ${sweetShare.toFixed(0)}% sweet vs ${(100-sweetShare).toFixed(0)}% savory. Configurar combos 1+1 priorizando salado con opción dulce para maximizar satisfacción y ticket promedio.`
      });
    }
    
    return html`<ul style="list-style: none; padding: 0; margin: 0;">
      ${recommendations.map(rec => {
        const colors = {
          success: {bg: "#d1fae5", border: "#10b981", text: "#065f46"},
          warning: {bg: "#fef3c7", border: "#f59e0b", text: "#92400e"},
          danger: {bg: "#fee2e2", border: "#ef4444", text: "#991b1b"},
          info: {bg: "#dbeafe", border: "#3b82f6", text: "#1e40af"}
        };
        const color = colors[rec.level];
        return html`<li style="
          padding: 1rem;
          margin-bottom: 0.75rem;
          border-left: 4px solid ${color.border};
          background: ${color.bg};
          border-radius: 4px;
        ">
          <strong style="color: ${color.text}; display: block; margin-bottom: 0.25rem;">${rec.title}</strong>
          <span style="color: ${color.text}; font-size: 14px;">${rec.text}</span>
        </li>`;
      })}
    </ul>`;
  })()}
</div>

<div class="card" style="margin-bottom: 2rem; background: var(--theme-background-alt);">
  <h3>Exportar Análisis</h3>
  ${(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      parameters: {
        priceScenarios: priceScenarios,
        category: selectedCategoryFit,
        weightMenu: weightMenuFit,
        weightPrice: normWeightPrice,
        weightSentiment: normWeightSentiment,
        weightFlavour: normWeightFlavour,
        targetFlavours: targetFlavours
      },
      scores: {
        marketFit: marketFitScore,
        priceFit: priceFitScore,
        sentimentFit: sentimentFitScore,
        flavourFit: flavourFitScore
      },
      metadata: {
        reviewsCount: reviews.metadata.total_reviews,
        priceCount: parseInt(summary.find(d => d.metric === "restaurants_total")?.value || 0),
        menuItemsCount: menuItems.length
      }
    };
    
    const downloadJSON = () => {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketfit_analysis_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    const downloadCSV = () => {
      const csv = [
        ['Metric', 'Value'],
        ['MarketFit', marketFitScore.toFixed(2)],
        ['PrecioFit', priceFitScore.toFixed(2)],
        ['SentimentFit', sentimentFitScore.toFixed(2)],
        ['FlavourFit', flavourFitScore.toFixed(2)],
        [''],
        ['Parameters', ''],
        ['Price Scenarios', priceScenarios.join('; ')],
        ['Category', selectedCategoryFit],
        ['Weight Menu %', weightMenuFit],
        ['Weight Price %', normWeightPrice.toFixed(1)],
        ['Weight Sentiment %', normWeightSentiment.toFixed(1)],
        ['Weight Flavour %', normWeightFlavour.toFixed(1)],
        ['Target Flavours', targetFlavours.join('; ')]
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketfit_analysis_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    return html`<div style="display: flex; gap: 1rem; align-items: center;">
      <button onclick=${downloadJSON} style="
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        📥 Exportar JSON
      </button>
      <button onclick=${downloadCSV} style="
        padding: 0.5rem 1rem;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        📊 Exportar CSV
      </button>
      <span style="font-size: 13px; color: var(--theme-foreground-muted);">
        Descarga el snapshot actual de parámetros y KPIs para referencia externa
      </span>
    </div>`;
  })()}
</div>

<div class="card" style="margin-bottom: 2rem;">
  <h3>Enlaces de Profundización</h3>
  <div style="font-size: 14px; line-height: 2;">
    <p style="margin-bottom: 0.5rem;">Para explorar en detalle los datos subyacentes a este análisis:</p>
    <ul style="margin: 0; padding-left: 1.5rem;">
      <li><a href="./precios" style="color: #3b82f6; font-weight: 600;">📍 Análisis de Precios</a> - Distribución espacial, cobertura de datos de menú y Google, agregaciones H3/Census</li>
      <li><a href="./sabores" style="color: #3b82f6; font-weight: 600;">🌶️ Adaptación de Sabores</a> - Notas de sabor, co-ocurrencias, perfiles por restaurante</li>
      <li><a href="#percepcion-general-del-mercado" style="color: #3b82f6; font-weight: 600;">📊 Percepción de Reseñas</a> - Distribución de sentimientos y aspectos detallados (más abajo en esta página)</li>
    </ul>
  </div>
</div>

---

<div class="hero">
  <h3 id="percepcion-general-del-mercado">Percepción general del mercado</h3>
</div>

<div class="grid grid-cols-3">
  ${kpiCard("Sentiment promedio", reviews.sentiment.mean, "")}
  ${kpiCard("Reseñas analizadas", reviews.metadata.total_reviews)}
  ${kpiCard("Aspectos identificados", reviews.metadata.unique_aspects_mentioned)}
</div>

<div class="hero">
  <h2 id="analisis-de-sentimientos">Distribución de sentimientos en reseñas</h2>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => sentimentDistributionChart(reviews, {width}))}
  </div>
</div>

<div class="text">
  <p>La distribución de sentimientos en las reseñas de competidores revela que <strong>${((reviews.sentiment.distribution.positive + reviews.sentiment.distribution.very_positive) / reviews.sentiment.count * 100).toFixed(1)}%</strong> de las experiencias son positivas o muy positivas, lo que indica un mercado exigente pero receptivo a propuestas de calidad.</p>
</div>

<div class="hero">
  <h2 id="aspectos-valorados">Aspectos más valorados por consumidores</h2>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => aspectScoresChart(reviews, {width}))}
  </div>
</div>

<div class="text">
  <p class="lead"><strong>Hallazgos clave del análisis de aspectos:</strong></p>
  <ul>
    <li><strong>Food (comida)</strong>: El aspecto más mencionado con ${reviews.top_aspects[0].count} menciones. Score promedio: ${reviews.top_aspects[0].mean_score.toFixed(2)}/5.0. La calidad y frescura del producto es el diferenciador primario.</li>
    <li><strong>Service (servicio)</strong>: Crucial para la experiencia del cliente, especialmente en formatos de comida rápida donde la eficiencia es clave.</li>
    <li><strong>Price (precio)</strong>: La relación calidad-precio es fundamental para la decisión de compra repetida.</li>
    <li><strong>Staff (personal)</strong>: La amabilidad y eficiencia del equipo impacta directamente la percepción de valor.</li>
  </ul>
</div>

<div class="hero">
  <h2 id="diferenciadores-de-kikos">Diferenciadores de Pastes Kikos</h2>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>🔥 Frescura Garantizada</h2>
    <p>Producto horneado al momento, sin conservadores ni aditivos artificiales. Contrasta con opciones pre-cocinadas o fritas de la competencia.</p>
  </div>
  <div class="card">
    <h2>🌮 Autenticidad Mexicana</h2>
    <p>Herencia gastronómica de Pachuca, Hidalgo. Posicionamiento como alternativa auténtica a opciones Tex-Mex genéricas.</p>
  </div>
  <div class="card">
    <h2>💰 Valor Excepcional</h2>
    <p>Dos piezas = comida completa. Precio más accesible que pizza o burrito, con mayor satisfacción por porción.</p>
  </div>
</div>

<div class="text">
  <p class="lead"><strong>Posicionamiento en el mercado de Houston:</strong></p>
  <ol>
    <li><strong>Segmento objetivo primario</strong>: Trabajadores urbanos, estudiantes y familias que buscan comida rápida de calidad con autenticidad cultural.</li>
    <li><strong>Ventaja competitiva</strong>: Único concepto de pastes horneados al estilo minero con calidad premium en el segmento QSR.</li>
    <li><strong>Barreras de entrada</strong>: Producción centralizada con distribución eficiente; receta protegida; know-how operativo probado en México.</li>
    <li><strong>Escalabilidad</strong>: Modelo replicable via drive-through, food trucks y eventualmente food halls para máxima exposición.</li>
  </ol>
</div>

<div class="hero">
  <h3 id="comparativa-competitiva">Comparativa competitiva simplificada</h3>
</div>

<div class="text">
  <table>
    <thead>
      <tr>
        <th>Atributo</th>
        <th>Pastes Kikos</th>
        <th>Pizza (Domino's, etc.)</th>
        <th>Empanadas (competidores)</th>
        <th>Burritos/Tacos (Chipotle, etc.)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frescura</strong></td>
        <td>⭐⭐⭐⭐⭐ (horneado al momento)</td>
        <td>⭐⭐⭐ (delivery demorado)</td>
        <td>⭐⭐⭐ (variable)</td>
        <td>⭐⭐⭐⭐ (armado al momento)</td>
      </tr>
      <tr>
        <td><strong>Autenticidad</strong></td>
        <td>⭐⭐⭐⭐⭐ (tradición minera)</td>
        <td>⭐⭐ (americanizado)</td>
        <td>⭐⭐⭐ (genérico)</td>
        <td>⭐⭐⭐ (Tex-Mex)</td>
      </tr>
      <tr>
        <td><strong>Precio/comida</strong></td>
        <td>⭐⭐⭐⭐⭐ ($6-8 / 2 pzas)</td>
        <td>⭐⭐⭐ ($10-15)</td>
        <td>⭐⭐⭐⭐ ($5-10)</td>
        <td>⭐⭐⭐ ($9-12)</td>
      </tr>
      <tr>
        <td><strong>Versatilidad</strong></td>
        <td>⭐⭐⭐⭐⭐ (dulce/salado)</td>
        <td>⭐⭐ (sólo salado)</td>
        <td>⭐⭐⭐ (limitado)</td>
        <td>⭐⭐⭐ (personalizable)</td>
      </tr>
      <tr>
        <td><strong>Drive-through</strong></td>
        <td>⭐⭐⭐⭐⭐ (modelo core)</td>
        <td>⭐⭐⭐⭐ (mayoría)</td>
        <td>⭐⭐ (raro)</td>
        <td>⭐⭐⭐⭐ (mayoría)</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="hero">
  <h3 id="recomendaciones-estrategicas">Recomendaciones estratégicas</h3>
</div>

<div class="text">
  <ul>
    <li><strong>Comunicación de valor</strong>: Enfatizar frescura, autenticidad y herencia cultural en todos los puntos de contacto (signage, empaque, redes sociales).</li>
    <li><strong>Muestras gratuitas</strong>: Programa de degustación en eventos clave (festivales, rodeos, ferias) para generar prueba inicial.</li>
    <li><strong>Combos estratégicos</strong>: Configuraciones 1+1 dulce/salado para maximizar ticket y satisfacción.</li>
    <li><strong>Alianzas locales</strong>: Co-branding con proveedores texanos de ingredientes premium (quesos, carnes) para reforzar narrativa de calidad.</li>
    <li><strong>Programa de lealtad</strong>: Recompensas por compras repetidas, integrado con app/QR para captura de datos del cliente.</li>
  </ul>
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

.text table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.text table th,
.text table td {
  padding: 0.75em;
  text-align: left;
  border-bottom: 1px solid var(--theme-foreground-faintest);
}

.text table th {
  font-weight: 600;
  background: var(--theme-background-alt);
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

.tooltip {
  cursor: help;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tooltip:hover {
  opacity: 1;
}

</style>


