// Product variation bar chart - wrapper around createSortedBarChart for products with price variation
// Pure chart component - receives product variation data and width, returns Plot

import {html} from "npm:htl";
import {createSortedBarChart, formatCurrency} from "../plots/pricingPlots.js";

export function createProductVariationBar({topVariation, width = 640}) {
  // Guard: check if data exists
  if (!topVariation || topVariation.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos de variación de productos disponibles.
    </div>`;
  }

  // Adjust height based on number of products (min 300, max 600)
  const dynamicHeight = Math.min(600, Math.max(300, topVariation.length * 30));

  return createSortedBarChart(topVariation, {
    x: "iqr",
    y: "product_norm",
    width,
    height: dynamicHeight,
    marginLeft: 200,
    xLabel: "IQR (Rango Intercuartílico en USD)",
    fill: "iqr",
    colorScheme: "Oranges",
    sortOrder: "-x",
    xFormat: formatCurrency,
    tip: {
      format: {
        x: formatCurrency
      },
      title: d => `${d.product_norm}\nIQR: ${formatCurrency(d.iqr)}\nMediana: ${formatCurrency(d.median)}\nRestaurantes: ${d.count}`
    }
  });
}

