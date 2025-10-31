// Menu prices histogram - displays menu item prices with log/linear scale
// Pure chart component - receives filtered data and options, returns Plot or message

import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {formatCurrency, COLOR_PALETTES, PLOT_DEFAULTS} from "../plots/pricingPlots.js";

export function createMenuPricesHistogram({
  filteredMenuData,
  logScale = false,
  width = 640
}) {
  if (!filteredMenuData || filteredMenuData.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos para los filtros actuales. Intenta ajustar la categoría o incluir outliers.
    </div>`;
  }

  return Plot.plot({
    ...PLOT_DEFAULTS,
    width,
    height: 350,
    x: {
      label: "Precio (USD)",
      type: logScale ? "log" : "linear",
      grid: true,
      tickFormat: formatCurrency
    },
    y: {
      label: "Frecuencia",
      grid: true
    },
    marks: [
      Plot.rectY(filteredMenuData, Plot.binX({y: "count"}, {
        x: "price_amount",
        fill: COLOR_PALETTES.primary,
        thresholds: logScale ? 40 : Math.min(50, Math.max(20, Math.floor(Math.sqrt(filteredMenuData.length)))),
        tip: true
      })),
      Plot.ruleY([0])
    ]
  });
}

