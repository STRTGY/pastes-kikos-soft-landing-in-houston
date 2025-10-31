import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {html} from "npm:htl";
import {mixedValue, filterData} from "./core/marketFitUtils.js";

export function ValorFitAnalysis({
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
  minCoverage = 5,
  priceFitScore,
  sentimentFitScore,
  flavourFitScore,
  marketFitScore,
  normWeightPrice,
  normWeightSentiment,
  normWeightFlavour,
  targetFlavours,
  width = 640
}) {
  

  // Coverage metrics
  const reviewsCount = reviews.metadata.total_reviews;
  const priceCount = parseInt(summary.find(d => d.metric === "restaurants_total")?.value || 0);
  const menuItemsCount = menuItems.length;
  const restaurantsWithMenu = restaurants.length;
  
  const foodAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "food");
  const serviceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "service");
  const priceAspect = reviews.top_aspects.find(a => a.aspect.toLowerCase() === "price");
  const aspectMentions = foodAspect ? foodAspect.count : 0;
  
  const getConfidenceBadge = (count, thresholdHigh, thresholdMedium) => {
    if (count >= thresholdHigh) return {label: "Alta", color: "#10b981"};
    if (count >= thresholdMedium) return {label: "Media", color: "#f59e0b"};
    return {label: "Baja", color: "#ef4444"};
  };
  
  const reviewsConfidence = getConfidenceBadge(reviewsCount, 100000, 50000);
  const priceConfidence = getConfidenceBadge(priceCount, 1000, 500);
  const menuConfidence = getConfidenceBadge(menuItemsCount, 500, 200);

  // Price comparison data (memoized by category, weightMenuFit, minCoverage)
  const currentData = filterData(hexEnriched, selectedCategoryFit, minCoverage);
  
  const mixedPrices = currentData.features
    .map(f => mixedValue(f.properties, "price_mean", weightMenuFit))
    .filter(v => v != null)
    .sort((a, b) => a - b);
  
  const cityMean = parseFloat(summary.find(d => d.metric === "price_mean_city")?.value || 0);
  
  // Price chart (responsive with width)
  const priceChart = mixedPrices.length > 0 && priceScenarios && priceScenarios.length > 0 ? Plot.plot({
    width,
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
      ...priceScenarios.map(scenario => Plot.ruleX([scenario], {
        stroke: "#e74c3c",
        strokeWidth: 2,
        strokeDasharray: "4 2"
      })),
      Plot.ruleX([cityMean], {
        stroke: "#2ecc71",
        strokeWidth: 2
      }),
      Plot.ruleY([0])
    ]
  }) : null;

  // Sentiment distribution chart (responsive)
  const dist = reviews.sentiment.distribution;
  const sentimentData = [
    {sentiment: "Muy positivo", count: dist.very_positive, order: 5},
    {sentiment: "Positivo", count: dist.positive, order: 4},
    {sentiment: "Neutral", count: dist.neutral, order: 3},
    {sentiment: "Negativo", count: dist.negative, order: 2},
    {sentiment: "Muy negativo", count: dist.very_negative, order: 1}
  ];
  
  const sentimentChart = Plot.plot({
    width,
    height: 280,
    marginLeft: 110,
    x: {label: "Cantidad de reseñas", grid: true},
    y: {label: null, domain: sentimentData.map(d => d.sentiment)},
    color: {
      domain: ["Muy negativo", "Negativo", "Neutral", "Positivo", "Muy positivo"],
      range: ["#dc2626", "#f97316", "#eab308", "#84cc16", "#22c55e"]
    },
    marks: [
      Plot.barX(sentimentData, {
        x: "count",
        y: "sentiment",
        fill: "sentiment",
        tip: true
      }),
      Plot.ruleX([0])
    ]
  });

  // Aspects chart (responsive)
  const topAspects = reviews.top_aspects.slice(0, 10);
  const aspectsChart = Plot.plot({
    width,
    height: 300,
    marginLeft: 100,
    x: {
      label: "Score medio (0-5)",
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
      Plot.ruleX([3.5], {
        stroke: "red",
        strokeDasharray: "4 2"
      }),
      Plot.text(topAspects, {
        x: "mean_score",
        y: "aspect",
        text: d => d.count.toLocaleString(),
        dx: 15,
        fill: "currentColor",
        fontSize: 10
      })
    ]
  });

  // Value-Price Matrix calculations
  const bestScenario = priceScenarios && priceScenarios.length > 0 ? Math.min(...priceScenarios) : 7.0;
  const foodScore = foodAspect ? foodAspect.mean_score : 3.5;
  const serviceScore = serviceAspect ? serviceAspect.mean_score : 3.5;
  const satisfactionScore = (0.6 * foodScore + 0.4 * serviceScore);
  const priceDeviation = cityMean > 0 ? ((bestScenario - cityMean) / cityMean) * 100 : 0;
  
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

  const xPos = 50 + (priceDeviation * 0.5);
  const yPos = 50 - ((satisfactionScore - 3.5) * 20);

  // Pillars calculations
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

  // Flavor comparison chart (responsive)
  const marketTastes = flavourStats.taste_stats || [];
  const targetSet = new Set(targetFlavours || []);
  
  const comparisonData = marketTastes.map(d => ({
    taste: d.taste,
    market_count: d.count,
    is_target: targetSet.has(d.taste) ? "Sí" : "No"
  }));
  
  const flavourChart = Plot.plot({
    width,
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

  // Sensitivity analysis (responsive)
  const scenarios = [
    {label: "Actual", price: normWeightPrice, sentiment: normWeightSentiment, flavour: normWeightFlavour},
    {label: "Precio +10pp", price: Math.min(100, normWeightPrice + 10), sentiment: Math.max(0, normWeightSentiment - 5), flavour: Math.max(0, normWeightFlavour - 5)},
    {label: "Sentimiento +10pp", price: Math.max(0, normWeightPrice - 5), sentiment: Math.min(100, normWeightSentiment + 10), flavour: Math.max(0, normWeightFlavour - 5)},
    {label: "Sabor +10pp", price: Math.max(0, normWeightPrice - 5), sentiment: Math.max(0, normWeightSentiment - 5), flavour: Math.min(100, normWeightFlavour + 10)}
  ];
  
  const sensitivityData = scenarios.map(s => {
    const total = s.price + s.sentiment + s.flavour;
    const normPrice = total > 0 ? (s.price / total) * 100 : 0;
    const normSentiment = total > 0 ? (s.sentiment / total) * 100 : 0;
    const normFlavour = total > 0 ? (s.flavour / total) * 100 : 0;
    
    const fit = (normPrice / 100) * priceFitScore + (normSentiment / 100) * sentimentFitScore + (normFlavour / 100) * flavourFitScore;
    
    return {
      scenario: s.label,
      marketFit: fit,
      delta: fit - marketFitScore
    };
  });
  
  const sensitivityChart = Plot.plot({
    width,
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

  // Sweet/Savory mix
  const sweetItem = marketTastes.find(d => d.taste === "sweet");
  const savoryItem = marketTastes.find(d => d.taste === "savory");
  const umamiItem = marketTastes.find(d => d.taste === "umami");
  
  const sweetCount = sweetItem ? sweetItem.count : 0;
  const savoryCount = (savoryItem ? savoryItem.count : 0) + (umamiItem ? umamiItem.count : 0);
  const total = sweetCount + savoryCount;
  
  const sweetShare = total > 0 ? (sweetCount / total) * 100 : 0;
  const savoryShare = 100 - sweetShare;

  // Recommendations
  const recommendations = [];
  
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
  
  if (priceFitScore < 60 && priceScenarios && priceScenarios.length > 0) {
    const bestScen = Math.min(...priceScenarios);
    recommendations.push({
      level: "warning",
      title: "Revisar Estrategia de Precio",
      text: `PrecioFit de ${priceFitScore.toFixed(0)} indica que los escenarios actuales (mejor: $${bestScen.toFixed(2)}) están por encima de la media de mercado. Considerar escenarios más competitivos o enfatizar diferenciación de valor.`
    });
  } else if (priceFitScore >= 80) {
    recommendations.push({
      level: "success",
      title: "Precio Competitivo Óptimo",
      text: `PrecioFit de ${priceFitScore.toFixed(0)} confirma que los escenarios están bien posicionados. Mantener rangos actuales y considerar pruebas de elasticidad precio-demanda.`
    });
  }
  
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
  
  if (flavourFitScore < 50) {
    recommendations.push({
      level: "warning",
      title: "Ampliar Perfil de Sabores",
      text: `FlavourFit de ${flavourFitScore.toFixed(0)} sugiere baja similitud con preferencias de mercado. Considerar incorporar sabores más frecuentes en Houston o educar al consumidor sobre la propuesta única de Pastes Kikos.`
    });
  }
  
  if (sweetItem && savoryItem) {
    const sweetShareCalc = (sweetItem.count / (sweetItem.count + savoryItem.count)) * 100;
    recommendations.push({
      level: "info",
      title: "Estrategia de Mix Dulce/Salado",
      text: `Mercado muestra ${sweetShareCalc.toFixed(0)}% sweet vs ${(100-sweetShareCalc).toFixed(0)}% savory. Configurar combos 1+1 priorizando salado con opción dulce para maximizar satisfacción y ticket promedio.`
    });
  }

  const positiveShare = ((dist.very_positive + dist.positive) / reviews.sentiment.count * 100).toFixed(1);
  const neutralShare = (dist.neutral / reviews.sentiment.count * 100).toFixed(1);
  const negativeShare = ((dist.very_negative + dist.negative) / reviews.sentiment.count * 100).toFixed(1);

  return html`<div>
    <!-- Coverage Panel -->
    <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h3 style="color: white;">Cobertura y Confianza de Datos</h3>
      <div class="grid grid-cols-3">
        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 6px;">
          <div style="font-size: 11px; opacity: 0.9;">Reseñas Analizadas</div>
          <div style="font-size: 24px; font-weight: 700;">${reviewsCount.toLocaleString()}</div>
          <span style="background: ${reviewsConfidence.color}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
            ${reviewsConfidence.label}
          </span>
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 6px;">
          <div style="font-size: 11px; opacity: 0.9;">Restaurantes con Precios</div>
          <div style="font-size: 24px; font-weight: 700;">${priceCount.toLocaleString()}</div>
          <span style="background: ${priceConfidence.color}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
            ${priceConfidence.label}
          </span>
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 6px;">
          <div style="font-size: 11px; opacity: 0.9;">Items de Menú</div>
          <div style="font-size: 24px; font-weight: 700;">${menuItemsCount.toLocaleString()}</div>
          <span style="background: ${menuConfidence.color}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
            ${menuConfidence.label}
          </span>
        </div>
      </div>
    </div>

    <!-- Price Chart -->
    ${priceChart ? html`<div class="card">
      <h3>Comparativa de Precios vs Escenarios</h3>
      ${priceChart}
      <div class="note">
        <span style="color: #e74c3c;">━━</span> Escenarios: ${priceScenarios.map(s => `$${s.toFixed(2)}`).join(", ")} | 
        <span style="color: #2ecc71;">━━</span> Media: $${cityMean.toFixed(2)}
      </div>
    </div>` : html`<div class="note" style="background: #fef3c7; border-left: 3px solid #f59e0b;">
      <strong>⚠️ Sin datos de precio</strong>: Selecciona al menos un escenario.
    </div>`}

    <!-- Sentiment Distribution & Aspects -->
    <div class="grid grid-cols-2">
      <div class="card">
        <h3>Distribución de Sentimientos</h3>
        <p class="note">Análisis de ${reviews.metadata.reviews_with_sentiment.toLocaleString()} reseñas</p>
        ${sentimentChart}
        <div class="note">
          ${positiveShare}% positivo | ${neutralShare}% neutral | ${negativeShare}% negativo
        </div>
      </div>

      <div class="card">
        <h3>Scores de Aspectos Clave (0-5)</h3>
        <p class="note">Top aspectos por frecuencia de mención</p>
        ${aspectsChart}
        <div class="note">
          <strong>Críticos (< 3.5):</strong> ${topAspects.filter(a => a.mean_score < 3.5).map(a => a.aspect).join(", ") || "Ninguno"}
        </div>
      </div>
    </div>

    <!-- Value-Price Matrix -->
    <div class="card">
      <h3>Posición Valor-Precio</h3>
      <div style="padding: 1rem; background: ${quadrantColor}22; border-left: 4px solid ${quadrantColor}; border-radius: 6px;">
        <div style="font-weight: 700; color: ${quadrantColor}; margin-bottom: 0.5rem;">
          ${quadrant}
        </div>
        <p style="margin: 0.5rem 0;">
          Precio ${priceDeviation > 0 ? '+' : ''}${priceDeviation.toFixed(1)}% vs media ($${bestScenario.toFixed(2)} vs $${cityMean.toFixed(2)})
        </p>
        <p style="margin: 0.5rem 0;">
          Satisfacción esperada: ${satisfactionScore.toFixed(2)}/5.0
        </p>
        <p class="note" style="margin-top: 0.5rem;">
          ${recommendation}
        </p>
      </div>
    </div>

    <!-- Pillars -->
    <div class="card">
      <h3>Pilares de Valor</h3>
      ${pillars.map(p => html`<div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong>${p.name}</strong>
          <span style="font-weight: 700; color: ${p.color};">${p.score.toFixed(0)}/100</span>
        </div>
        <div style="width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden;">
          <div style="width: ${p.score}%; height: 100%; background: ${p.color};"></div>
        </div>
        <p class="note">${p.explanation}</p>
      </div>`)}
    </div>

    <!-- Flavor Chart -->
    <div class="card">
      <h3>Comparación de Sabores</h3>
      ${flavourChart}
      <p class="note">
        Sabores en verde: objetivo Kikos. Altura: frecuencia en mercado Houston.
      </p>
    </div>

    <!-- Sensitivity & Mix -->
    <div class="grid grid-cols-2">
      <div class="card">
        <h3>Análisis de Sensibilidad</h3>
        ${sensitivityChart}
        <p class="note">Variación del MarketFit ajustando pesos ±10 p.p.</p>
      </div>
      
      <div class="card">
        <h3>Mix Dulce/Salado</h3>
        <div style="display: flex; height: 40px; border-radius: 8px; overflow: hidden; margin-bottom: 1rem;">
          <div style="width: ${savoryShare}%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
            Salado ${savoryShare.toFixed(0)}%
          </div>
          <div style="width: ${sweetShare}%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
            Dulce ${sweetShare.toFixed(0)}%
          </div>
        </div>
        <div class="note">
          <strong>Recomendación:</strong> Configuración inicial 70% salado + 30% dulce
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="card">
      <h3>Recomendaciones Estratégicas</h3>
      ${recommendations.map(rec => {
        const colors = {
          success: {bg: "#d1fae5", border: "#10b981"},
          warning: {bg: "#fef3c7", border: "#f59e0b"},
          danger: {bg: "#fee2e2", border: "#ef4444"},
          info: {bg: "#dbeafe", border: "#3b82f6"}
        };
        const color = colors[rec.level];
        return html`<div style="padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid ${color.border}; background: ${color.bg}; border-radius: 4px;">
          <strong>${rec.title}</strong>
          <p style="margin: 0.25rem 0 0 0;">${rec.text}</p>
        </div>`;
      })}
    </div>
  </div>`;
}
