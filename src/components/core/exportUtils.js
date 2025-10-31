export function buildExportData({
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
}) {
  return {
    timestamp: new Date().toISOString(),
    parameters: {
      priceScenarios,
      category: selectedCategoryFit,
      weightMenu: weightMenuFit,
      minCoverage,
      weightPrice: normWeightPrice,
      weightSentiment: normWeightSentiment,
      weightFlavour: normWeightFlavour,
      targetFlavours
    },
    scores: {
      marketFit: marketFitScore,
      priceFit: priceFitScore,
      sentimentFit: sentimentFitScore,
      flavourFit: flavourFitScore
    },
    sentiment_shares: {
      positive: ((reviews.sentiment.distribution.very_positive + reviews.sentiment.distribution.positive) / reviews.sentiment.count * 100).toFixed(2),
      neutral: (reviews.sentiment.distribution.neutral / reviews.sentiment.count * 100).toFixed(2),
      negative: ((reviews.sentiment.distribution.very_negative + reviews.sentiment.distribution.negative) / reviews.sentiment.count * 100).toFixed(2)
    },
    top_aspects: reviews.top_aspects.slice(0, 5).map(a => ({
      aspect: a.aspect,
      count: a.count,
      mean_score: a.mean_score
    })),
    metadata: {
      reviewsCount: reviews.metadata.total_reviews,
      priceCount: parseInt(summary.find(d => d.metric === "restaurants_total")?.value || 0),
      menuItemsCount: menuItems.length
    }
  };
}

export function toCSV(exportData, priceScenarios, selectedCategoryFit, weightMenuFit, minCoverage, normWeightPrice, normWeightSentiment, normWeightFlavour, targetFlavours, marketFitScore, priceFitScore, sentimentFitScore, flavourFitScore) {
  return [
    ['Metric', 'Value'],
    ['MarketFit', marketFitScore.toFixed(2)],
    ['PrecioFit', priceFitScore.toFixed(2)],
    ['SentimentFit', sentimentFitScore.toFixed(2)],
    ['FlavourFit', flavourFitScore.toFixed(2)],
    [''],
    ['Sentiment Shares', ''],
    ['Positive %', exportData.sentiment_shares.positive],
    ['Neutral %', exportData.sentiment_shares.neutral],
    ['Negative %', exportData.sentiment_shares.negative],
    [''],
    ['Top Aspects', 'Count', 'Mean Score'],
    ...exportData.top_aspects.map(a => [a.aspect, a.count, a.mean_score.toFixed(2)]),
    [''],
    ['Parameters', ''],
    ['Price Scenarios', priceScenarios ? priceScenarios.join('; ') : 'None'],
    ['Category', selectedCategoryFit],
    ['Weight Menu %', weightMenuFit],
    ['Min Coverage', minCoverage],
    ['Weight Price %', normWeightPrice.toFixed(1)],
    ['Weight Sentiment %', normWeightSentiment.toFixed(1)],
    ['Weight Flavour %', normWeightFlavour.toFixed(1)],
    ['Target Flavours', targetFlavours ? targetFlavours.join('; ') : 'None']
  ].map(row => row.join(',')).join('\n');
}

export function downloadJSON(exportData) {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marketfit_analysis_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marketfit_analysis_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

