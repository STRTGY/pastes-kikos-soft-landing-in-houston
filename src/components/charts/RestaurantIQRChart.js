// Restaurant IQR chart - wrapper around createIQRChart for restaurant comparison
// Pure chart component - receives restaurant data and width, returns Plot

import {html} from "npm:htl";
import {createIQRChart, formatCurrency} from "../plots/pricingPlots.js";

export function createRestaurantIQRChart({restaurantData, width = 640}) {
  // Guard: check if data exists and has items
  if (!restaurantData || restaurantData.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos de restaurantes disponibles.
    </div>`;
  }

  // Adjust height based on number of items (min 400, max 800)
  const dynamicHeight = Math.min(800, Math.max(400, restaurantData.length * 25));

  // createIQRChart signature: createIQRChart(data, options)
  return createIQRChart(restaurantData, {
    y: "restaurant",
    x1: "p25",
    x2: "p75",
    median: "median",
    width,
    height: dynamicHeight,
    marginLeft: 200,
    xLabel: "Precio (USD)",
    xFormat: formatCurrency,
    sortBy: "median",
    reverse: true,
    barColor: "#bfdbfe",
    medianColor: "steelblue",
    tip: {
      format: {
        x: formatCurrency
      },
      title: d => `${d.restaurant}\nMediana: ${formatCurrency(d.median)}\nIQR: ${formatCurrency(d.p25)} - ${formatCurrency(d.p75)}\nItems: ${d.count}`
    }
  });
}

