---
title: Propuesta de Valor
theme: [glacier, wide]
sidebar: true
toc: false
keywords: propuesta de valor, Pastes Kikos, diferenciadores, frescura, calidad, price, QSR, comida rápida, autenticidad mexicana
---

<link rel="stylesheet" href="../../styles/valor.css">

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
```

```js
import {ValorFitAnalysis} from "../../components/ValorFitAnalysis.js";
import {ControlPanel} from "../../components/ControlPanel.js";
import {KpiCard} from "../../components/common/KpiCard.js";
import {Alert} from "../../components/common/Alert.js";
import {MarketPricePercentilesCard} from "../../components/charts/MarketPricePercentilesCard.js";
import {PricePositionTable} from "../../components/tables/PricePositionTable.js";
import {PsychologicalPricingTable} from "../../components/tables/PsychologicalPricingTable.js";
import {ElasticityTable} from "../../components/tables/ElasticityTable.js";
import {ExportPanel} from "../../components/panels/ExportPanel.js";
import {
  normalizeWeights,
  computeMarketPriceStats,
  scorePriceFit,
  scoreSentimentFit,
  scoreFlavourFit,
  computeMarketFit,
  computePricePositioning,
  computePsychologicalPricing,
  computeElasticityEstimate
} from "../../components/core/marketFitUtils.js";
import {buildExportData, toCSV} from "../../components/core/exportUtils.js";
```

```js
// Load data
const reviews = await FileAttachment("../../data/static/reviews_summary.json").json();

const hexEnriched = await FileAttachment("../../data/static/pricing/hex_r8_overall_enriched.geojson").json();
const summary = await FileAttachment("../../data/static/pricing/summary.csv").csv();
const categorySummary = await FileAttachment("../../data/static/pricing/category_summaries.csv").csv({typed: true});

const menuItems = await FileAttachment("../../data/menu/items.json").json();
const priceStats = await FileAttachment("../../data/menu/price_stats.json").json();
const flavourStats = await FileAttachment("../../data/menu/flavour_stats.json").json();
const restaurants = await FileAttachment("../../data/menu/restaurants.json").json();
```

<div class="hero">
  <h1 id="2-1-propuesta-de-valor">2.1 Propuesta de Valor</h1>
</div>

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
// Create input controls (not yet bound to view)
const priceInput = Inputs.checkbox(
  [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 11.0, 12.0],
  {
    value: [7.0, 7.5, 8.0], 
    label: "Escenarios de precio (2 piezas)", 
    format: x => `$${x.toFixed(2)}`
  }
);

const categoryInput = Inputs.select(
  ["overall", ...categorySummary.map(d => d.category)],
  {value: "overall", label: "Categoría de comparación"}
);

const mixInput = Inputs.range([0, 100], {
  value: 70,
  step: 1,
  label: "Mezcla de fuentes (% Menú vs Google)"
});

const coverageInput = Inputs.range([1, 20], {
  value: 5,
  step: 1,
  label: "Cobertura mínima (muestras por celda)"
});

const priceWeightInput = Inputs.range([0, 100], {
  value: 40,
  step: 5,
  label: "Peso Precio"
});

const sentimentWeightInput = Inputs.range([0, 100], {
  value: 40,
  step: 5,
  label: "Peso Sentimiento"
});

const flavourWeightInput = Inputs.range([0, 100], {
  value: 20,
  step: 5,
  label: "Peso Sabor"
});

const flavoursInput = Inputs.checkbox(
  (flavourStats.taste_stats || []).map(d => d.taste),
  {
    value: ["savory", "umami", "sweet", "spicy"],
    label: "Sabores objetivo Pastes Kikos"
  }
);
```

```js
// Bind input controls to reactive variables with view()
const priceScenarios = view(priceInput);
const selectedCategoryFit = view(categoryInput);
const weightMenuFit = view(mixInput);
const minCoverage = view(coverageInput);
const weightPrice = view(priceWeightInput);
const weightSentiment = view(sentimentWeightInput);
const weightFlavour = view(flavourWeightInput);
const targetFlavours = view(flavoursInput);
```

```js
// Render control panel with input elements and current values
display(ControlPanel({
  priceInput,
  categoryInput,
  mixInput,
  coverageInput,
  priceWeightInput,
  sentimentWeightInput,
  flavourWeightInput,
  flavoursInput,
  weightPrice,
  weightSentiment,
  weightFlavour
}));
```


```js
// Normalize weights using utility function
const {normWeightPrice, normWeightSentiment, normWeightFlavour, hasZeroWeights} = 
  normalizeWeights(weightPrice, weightSentiment, weightFlavour);
```

```js
// Compute market price statistics and scores using utility functions
const marketPriceStats = computeMarketPriceStats(hexEnriched, selectedCategoryFit, minCoverage, weightMenuFit);
const priceFitScore = scorePriceFit(priceScenarios, marketPriceStats);
const sentimentFitScore = scoreSentimentFit(reviews);
const flavourFitScore = scoreFlavourFit(targetFlavours, flavourStats);
const marketFitScore = computeMarketFit(priceFitScore, sentimentFitScore, flavourFitScore, normWeightPrice, normWeightSentiment, normWeightFlavour);
```


```js
// Información de pesos normalizados
html`<div class="note" style="width: 100%; max-width: 100%;">
  <strong>Pesos normalizados:</strong> Precio: ${normWeightPrice.toFixed(0)}% | Sentimiento: ${normWeightSentiment.toFixed(0)}% | Sabor: ${normWeightFlavour.toFixed(0)}%
  ${hasZeroWeights ? html`<div style="margin-top: 0.5rem; padding: 0.5rem; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
    ⚠️ Todos los pesos están en 0. Usando valores por defecto: 40% Precio, 40% Sentimiento, 20% Sabor.
  </div>` : ""}
</div>`
```

```js
// Alerta de escenarios vacíos
if (!priceScenarios || priceScenarios.length === 0) {
  display(Alert({
    type: "warning",
    title: "⚠️ Sin escenarios de precio seleccionados.",
    message: "Selecciona al menos un escenario para ver la comparativa de precios y calcular PrecioFit. El índice MarketFit se calculará con PrecioFit = 0.",
    fullWidth: true
  }));
}
```

```js
// Market Price Percentiles Visualization
MarketPricePercentilesCard({marketPriceStats})
```

```js
// Price Positioning Analysis by Scenario
const pricePositionAnalysis = computePricePositioning(priceScenarios, marketPriceStats);
```

```js
// Display price positioning table
PricePositionTable({pricePositionAnalysis})
```

```js
// Psychological Pricing Analysis
const psychologicalPricingAnalysis = computePsychologicalPricing(priceScenarios);
```

```js
// Display psychological pricing table
PsychologicalPricingTable({psychologicalPricingAnalysis})
```

```js
// Estimated Price Elasticity (simplified model)
const elasticityEstimate = computeElasticityEstimate(priceScenarios, marketPriceStats);
```

```js
// Display elasticity analysis
ElasticityTable({elasticityEstimate, marketPriceStats})
```

<div class="grid grid-cols-4" style="margin: 2rem 0; gap: 1.5rem;">
  ${KpiCard({title: "MarketFit", value: marketFitScore, suffix: "", explanation: "Índice compuesto"})}
  ${KpiCard({title: "PrecioFit", value: priceFitScore, suffix: "", explanation: "Percentil vs mercado"})}
  ${KpiCard({title: "SentimentFit", value: sentimentFitScore, suffix: "", explanation: "Share positivo + aspectos"})}
  ${KpiCard({title: "FlavourFit", value: flavourFitScore, suffix: "", explanation: "Similitud Jaccard"})}
</div>

<div style="width: 100%; max-width: 100%;">
  ${resize((width) => ValorFitAnalysis({
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
    minCoverage,
    priceFitScore,
    sentimentFitScore,
    flavourFitScore,
    marketFitScore,
    normWeightPrice,
    normWeightSentiment,
    normWeightFlavour,
    targetFlavours,
    width
  }))}
</div>

```js
// Build export data and CSV
const exportData = buildExportData({
  priceScenarios,
  selectedCategoryFit,
  weightMenuFit,
  minCoverage,
  normWeightPrice,
  normWeightSentiment,
  normWeightFlavour,
  targetFlavours,
  marketFitScore,
  priceFitScore,
  sentimentFitScore,
  flavourFitScore,
  reviews,
  summary,
  menuItems
});

const csvContent = toCSV(
  exportData,
  priceScenarios,
  selectedCategoryFit,
  weightMenuFit,
  minCoverage,
  normWeightPrice,
  normWeightSentiment,
  normWeightFlavour,
  targetFlavours,
  marketFitScore,
  priceFitScore,
  sentimentFitScore,
  flavourFitScore
);
```

```js
// Export panel
ExportPanel({exportData, csvContent})
```

<div class="card">
  <h3>Enlaces de Profundización</h3>
  <p>Para explorar en detalle los datos subyacentes a este análisis:</p>
  <ul>
    <li><a href="./precios">📍 Análisis de Precios</a> - Distribución espacial y agregaciones</li>
    <li><a href="./sabores">🌶️ Adaptación de Sabores</a> - Notas de sabor y perfiles</li>
    <li><a href="#percepcion-general-del-mercado">📊 Percepción de Reseñas</a> - Distribución de sentimientos</li>
  </ul>
</div>

---

<div class="hero">
  <h3 id="percepcion-general-del-mercado">Percepción general del mercado</h3>
</div>

<div class="grid grid-cols-3" style="margin: 2rem 0; gap: 1.5rem;">
  ${KpiCard({title: "Sentiment promedio", value: reviews.sentiment.mean, suffix: ""})}
  ${KpiCard({title: "Reseñas analizadas", value: reviews.metadata.total_reviews})}
  ${KpiCard({title: "Aspectos identificados", value: reviews.metadata.unique_aspects_mentioned})}
</div>

<div class="hero">
  <h2 id="diferenciadores-de-kikos">Diferenciadores de Pastes Kikos</h2>
</div>

<div class="grid grid-cols-3" style="margin: 2rem 0; gap: 1.5rem;">
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
