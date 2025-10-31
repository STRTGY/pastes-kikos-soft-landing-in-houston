// Menu KPI Grid component for displaying menu statistics
// Pure presentation component - receives menuKpis data, returns DOM

import {html} from "npm:htl";

export function createMenuKpiGrid(menuKpis) {
  return html`<div class="card" style="margin-top: 3rem;">
  <h2>Precios Extraídos de Menús</h2>
  <p>Análisis detallado de ${menuKpis.totalItems.toLocaleString()} items de menú extraídos de ${menuKpis.restaurants} restaurantes.</p>
  
  <div class="grid grid-cols-4" style="margin-top: 1.5rem;">
    <div class="kpi">
      <div class="kpi-title">Mediana Global</div>
      <div class="kpi-value">$${menuKpis.medianPrice.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Rango Intercuartílico</div>
      <div class="kpi-value">$${menuKpis.p25.toFixed(2)} - $${menuKpis.p75.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Precio Mínimo</div>
      <div class="kpi-value">$${menuKpis.minPrice.toFixed(2)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Precio Máximo</div>
      <div class="kpi-value">$${menuKpis.maxPrice.toFixed(2)}</div>
    </div>
  </div>
</div>`;
}

