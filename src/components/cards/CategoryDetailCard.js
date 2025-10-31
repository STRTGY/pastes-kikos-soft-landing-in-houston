// Category detail card - shows summary for selected category
// Pure presentation component - receives category data or null, returns DOM or null

import {html} from "npm:htl";
import {formatCurrency} from "../plots/pricingPlots.js";

export function createCategoryDetailCard(categoryDetailData) {
  if (!categoryDetailData) return null;

  return html`<div class="card" style="margin-top: 2rem;">
    <h3>Resumen de Categoría: ${categoryDetailData.category}</h3>
    <div class="grid grid-cols-3">
      <div class="kpi">
        <div class="kpi-title">Restaurantes</div>
        <div class="kpi-value">${categoryDetailData.count ?? "N/A"}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Precio Promedio</div>
        <div class="kpi-value">${categoryDetailData.price_mean ? formatCurrency(categoryDetailData.price_mean) : "N/A"}</div>
      </div>
      <div class="kpi">
        <div class="kpi-title">Precio Mediana</div>
        <div class="kpi-value">${categoryDetailData.price_median ? formatCurrency(categoryDetailData.price_median) : "N/A"}</div>
      </div>
    </div>
  </div>`;
}

