// Category IQR chart - wrapper around createIQRChart for category price comparison
// Pure chart component - receives category price data and width, returns Plot

import {html} from "npm:htl";
import {createIQRChart, formatCurrency} from "../plots/pricingPlots.js";

export function createCategoryIQRChart({categoryPriceData, width = 640}) {
  // Guard: check if data exists and has items
  if (!categoryPriceData || categoryPriceData.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos de categorías disponibles.
    </div>`;
  }

  // Adjust height based on number of categories (min 300, max 600)
  const dynamicHeight = Math.min(600, Math.max(300, categoryPriceData.length * 35));

  // createIQRChart signature: createIQRChart(data, options)
  return createIQRChart(categoryPriceData, {
    y: "category",
    x1: "min",
    x2: "max",
    median: "median",
    width,
    height: dynamicHeight,
    marginLeft: 150,
    xLabel: "Precio (USD)",
    xFormat: formatCurrency,
    sortBy: "median",
    reverse: true,
    barColor: "#fed7aa",
    medianColor: "darkorange",
    tip: {
      format: {
        x: formatCurrency
      },
      title: d => `${d.category}\nMediana: ${formatCurrency(d.median)}\nRango: ${formatCurrency(d.min)} - ${formatCurrency(d.max)}\nItems: ${d.count}`
    }
  });
}

