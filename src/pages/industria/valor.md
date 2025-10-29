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
const reviews = await FileAttachment("../../data/static/reviews_summary.json").json();

function kpiCard(title, value, suffix = "") {
  const formatted = typeof value === "number" ? value.toLocaleString("es-MX", {maximumFractionDigits: 2}) : value;
  return html`<div class="card"><h2>${title}</h2><span class="big">${formatted}${suffix ? ` ${suffix}` : ""}</span></div>`;
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

</style>


