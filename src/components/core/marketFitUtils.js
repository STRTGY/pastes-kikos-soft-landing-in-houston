import * as d3 from "npm:d3";

export function mixedValue(props, metric, weight) {
  const w = weight / 100;
  const mMenu = props[`${metric}_menu`];
  const mGoogle = props[`${metric}_google`];
  
  if (mMenu == null && mGoogle == null) return null;
  if (mMenu == null) return mGoogle;
  if (mGoogle == null) return mMenu;
  
  return w * mMenu + (1 - w) * mGoogle;
}

export function filterData(geojson, category, minN) {
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

export function normalizeWeights(weightPrice, weightSentiment, weightFlavour) {
  const totalWeight = weightPrice + weightSentiment + weightFlavour;
  const hasZeroWeights = totalWeight === 0;
  
  const effectiveWeightPrice = hasZeroWeights ? 40 : weightPrice;
  const effectiveWeightSentiment = hasZeroWeights ? 40 : weightSentiment;
  const effectiveWeightFlavour = hasZeroWeights ? 20 : weightFlavour;
  
  const effectiveTotalWeight = effectiveWeightPrice + effectiveWeightSentiment + effectiveWeightFlavour;
  
  const normWeightPrice = effectiveTotalWeight > 0 ? (effectiveWeightPrice / effectiveTotalWeight) * 100 : 0;
  const normWeightSentiment = effectiveTotalWeight > 0 ? (effectiveWeightSentiment / effectiveTotalWeight) * 100 : 0;
  const normWeightFlavour = effectiveTotalWeight > 0 ? (effectiveWeightFlavour / effectiveTotalWeight) * 100 : 0;
  
  return {
    normWeightPrice,
    normWeightSentiment,
    normWeightFlavour,
    hasZeroWeights
  };
}

export function computeMarketPriceStats(hexEnriched, selectedCategory, minCoverage, weightMenuFit) {
  const currentData = filterData(hexEnriched, selectedCategory, minCoverage);
  
  const mixedPrices = currentData.features
    .map(f => mixedValue(f.properties, "price_mean", weightMenuFit))
    .filter(v => v != null)
    .sort((a, b) => a - b);
  
  if (mixedPrices.length === 0) return null;
  
  return {
    n: mixedPrices.length,
    min: d3.min(mixedPrices),
    p10: d3.quantile(mixedPrices, 0.10),
    p25: d3.quantile(mixedPrices, 0.25),
    p50: d3.quantile(mixedPrices, 0.50),
    p75: d3.quantile(mixedPrices, 0.75),
    p90: d3.quantile(mixedPrices, 0.90),
    p95: d3.quantile(mixedPrices, 0.95),
    max: d3.max(mixedPrices),
    mean: d3.mean(mixedPrices),
    median: d3.median(mixedPrices),
    stdev: d3.deviation(mixedPrices),
    prices: mixedPrices
  };
}

export function scorePriceFit(priceScenarios, marketPriceStats) {
  if (!priceScenarios || priceScenarios.length === 0) return 0;
  if (!marketPriceStats) return 0;
  
  const scenarioScores = priceScenarios.map(scenario => {
    if (scenario <= marketPriceStats.p25) return 100;
    if (scenario <= marketPriceStats.p50) return 85;
    if (scenario <= marketPriceStats.p75) return 70;
    if (scenario <= marketPriceStats.p90) return 50;
    if (scenario <= marketPriceStats.p95) return 30;
    return 15;
  });
  
  return Math.max(...scenarioScores);
}

export function scoreSentimentFit(reviews) {
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
}

export function scoreFlavourFit(targetFlavours, flavourStats) {
  if (!targetFlavours || targetFlavours.length === 0) return 0;
  
  const marketTastes = flavourStats.taste_stats || [];
  const totalMarketCount = d3.sum(marketTastes, d => d.count);
  
  if (totalMarketCount === 0) return 0;
  
  const marketSet = new Set(marketTastes.map(d => d.taste));
  const targetSet = new Set(targetFlavours);
  
  const intersection = [...targetSet].filter(t => marketSet.has(t));
  
  const intersectionWeight = d3.sum(
    intersection.map(t => {
      const item = marketTastes.find(d => d.taste === t);
      return item ? item.count : 0;
    })
  );
  
  const jaccard = intersectionWeight / totalMarketCount;
  
  return jaccard * 100;
}

export function computeMarketFit(priceFitScore, sentimentFitScore, flavourFitScore, normWeightPrice, normWeightSentiment, normWeightFlavour) {
  return (
    (normWeightPrice / 100) * priceFitScore +
    (normWeightSentiment / 100) * sentimentFitScore +
    (normWeightFlavour / 100) * flavourFitScore
  );
}

export function computePricePositioning(priceScenarios, marketPriceStats) {
  if (!priceScenarios || priceScenarios.length === 0 || !marketPriceStats) return [];
  
  return priceScenarios.map(price => {
    const percentile = d3.bisect(marketPriceStats.prices, price) / marketPriceStats.prices.length;
    const cheaperThan = (percentile * 100).toFixed(1);
    
    let positioning = "";
    let color = "";
    if (percentile <= 0.25) { 
      positioning = "Ultra-competitivo"; 
      color = "#22c55e"; 
    } else if (percentile <= 0.50) { 
      positioning = "Muy competitivo"; 
      color = "#84cc16"; 
    } else if (percentile <= 0.75) { 
      positioning = "Competitivo"; 
      color = "#3b82f6"; 
    } else if (percentile <= 0.90) { 
      positioning = "Premium moderado"; 
      color = "#f59e0b"; 
    } else { 
      positioning = "Premium alto"; 
      color = "#ef4444"; 
    }
    
    return {price, percentile, cheaperThan, positioning, color};
  });
}

export function computePsychologicalPricing(priceScenarios) {
  if (!priceScenarios || priceScenarios.length === 0) return [];
  
  return priceScenarios.map(price => {
    const isCharmPrice = (price % 1 === 0.99) || (price % 1 === 0.95) || (price % 1 === 0.49);
    const isRoundPrice = (price % 1 === 0);
    const perPiecePrice = price / 2;
    
    const priceCategory = 
      price < 6 ? "Valor extremo" :
      price < 7 ? "Valor alto" :
      price < 8 ? "Balanceado" :
      price < 9 ? "Moderado" :
      "Premium";
    
    return {
      price,
      isCharmPrice,
      isRoundPrice,
      perPiecePrice,
      priceCategory,
      psychNote: isCharmPrice ? "Precio charm (percepción menor)" : 
                 isRoundPrice ? "Precio redondo (simplicidad)" : 
                 "Precio neutral"
    };
  });
}

export function computeElasticityEstimate(priceScenarios, marketPriceStats) {
  if (!marketPriceStats || !priceScenarios || priceScenarios.length === 0) return [];
  
  const basePrice = marketPriceStats.p50;
  
  return priceScenarios.map(price => {
    const priceDiff = ((price - basePrice) / basePrice) * 100;
    const demandChangePercent = -1.2 * priceDiff;
    const demandIndex = 100 + demandChangePercent;
    const revenueIndex = (price / basePrice) * (demandIndex / 100) * 100;
    
    return {
      price,
      priceDiff: priceDiff.toFixed(1),
      demandIndex: demandIndex.toFixed(0),
      revenueIndex: revenueIndex.toFixed(0),
      optimal: Math.abs(revenueIndex - 100) < 5 ? "✓" : ""
    };
  });
}

