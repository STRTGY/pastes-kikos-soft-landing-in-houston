// Pure utility to select the correct aggregation dataset based on filters
// No FileAttachment - receives all datasets as params

import { filterGeojsonByCategoryAndMinCount } from "./pricingFilters.js";

export function selectCurrentAggregation({
  aggregationView,
  selectedCategory,
  minCount,
  hexEnriched,
  tractsEnriched,
  hexByCategory,
  tractsByCategory
}) {
  const isH3 = aggregationView === "H3 Hexágonos";
  const isOverall = selectedCategory === "overall";

  let rawData;
  if (isH3 && isOverall) rawData = hexEnriched;
  else if (isH3 && !isOverall) rawData = hexByCategory;
  else if (!isH3 && isOverall) rawData = tractsEnriched;
  else rawData = tractsByCategory;

  const filtered = filterGeojsonByCategoryAndMinCount(rawData, selectedCategory, minCount);

  // Guard against empty data
  if (!filtered.features || filtered.features.length === 0) {
    return {
      type: "FeatureCollection",
      features: [],
      isEmpty: true
    };
  }

  return {
    ...filtered,
    isEmpty: false
  };
}

