// Price distribution histogram - displays filtered prices
// Pure chart component - receives data and width, returns Plot

import * as Plot from "npm:@observablehq/plot";
import {formatCurrency, COLOR_PALETTES} from "../plots/pricingPlots.js";

export function createPriceDistributionHistogram({filteredPrices, width = 640}) {
  return Plot.plot({
    width,
    height: 300,
    marginLeft: 60,
    marginBottom: 60,
    x: {
      label: "Precio promedio por celda (USD)",
      grid: true,
      tickFormat: formatCurrency
    },
    y: {
      label: "Frecuencia",
      grid: true
    },
    marks: [
      Plot.rectY(filteredPrices, Plot.binX({y: "count"}, {
        x: d => d,
        fill: COLOR_PALETTES.primary,
        thresholds: 25,
        tip: true
      })),
      Plot.ruleY([0])
    ]
  });
}

