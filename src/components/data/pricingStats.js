// Pure utility functions for computing pricing statistics
// No FileAttachment, no reactive state

import * as d3 from "npm:d3";

export function computeCoverageStats(aggregationView, hexEnriched, tractsEnriched) {
  const isH3 = aggregationView === "H3 Hexágonos";
  const features = isH3 ? hexEnriched.features : tractsEnriched.features;

  const withGoogle = features.filter(f => (f.properties.n_google || 0) > 0).length;
  const withMenu = features.filter(f => (f.properties.n_menu || 0) > 0).length;
  const withBoth = features.filter(f => (f.properties.n_google || 0) > 0 && (f.properties.n_menu || 0) > 0).length;

  const totalCells = features.length;
  const pctWithMenu = ((withMenu / totalCells) * 100).toFixed(1);
  const pctWithBoth = ((withBoth / totalCells) * 100).toFixed(1);

  // Average items per cell
  const totalMenuItems = features.reduce((sum, f) => sum + (f.properties.n_menu || 0), 0);
  const avgItemsPerCell = (totalMenuItems / Math.max(withMenu, 1)).toFixed(1);

  return { withGoogle, withMenu, withBoth, totalCells, pctWithMenu, pctWithBoth, avgItemsPerCell };
}

export function buildCategoryDetail(selectedCategory, categorySummary) {
  if (selectedCategory === "overall") return null;
  if (!categorySummary || categorySummary.length === 0) return null;
  return categorySummary.find(d => d?.category === selectedCategory) || null;
}

export function buildPriceDistribution(currentData) {
  const priceDistribution = currentData.features
    .map(f => f.properties?.price_mean_menu)
    .filter(v => v != null && v > 0);

  // Filter outliers using IQR method
  const sorted = priceDistribution.sort((a, b) => a - b);
  const q25 = d3.quantile(sorted, 0.25);
  const q75 = d3.quantile(sorted, 0.75);
  const iqr = q75 - q25;
  const upperBound = q75 + 1.5 * iqr;

  const filteredPrices = priceDistribution.filter(v => v <= upperBound);

  return { priceDistribution, filteredPrices, q25, q75, iqr, upperBound };
}

