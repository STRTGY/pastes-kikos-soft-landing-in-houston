// Pricing filters panel - layout wrapper for reactive inputs
// Receives Input view nodes created in the page, returns structured DOM

import {html} from "npm:htl";

export function createPricingFiltersPanel({
  aggregationView,
  selectedMetric,
  selectedCategory,
  minCount,
  weightMenu,
  colorScale,
  showLayer
}) {
  const weightMenuValue = typeof weightMenu === 'number' ? weightMenu : 70;

  return html`<div class="card" style="margin-bottom: 2rem;">
  <h3 style="margin-top: 0;">Filtros y Controles</h3>
  <div class="grid grid-cols-2" style="gap: 1.5rem;">
    <div>${aggregationView}</div>
    <div>${selectedMetric}</div>
    <div>${selectedCategory}</div>
    <div>${minCount}</div>
  </div>
  <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--theme-foreground-faint);">
    <h4 style="margin: 0 0 1rem 0; font-size: 15px; font-weight: 600;">Mezcla de Fuentes de Datos</h4>
    <div style="margin-bottom: 1rem;">
      ${weightMenu}
      <div style="margin-top: 0.5rem; font-size: 14px; text-align: center;">
        <span style="color: #e67e22; font-weight: 600;">Menú ${weightMenuValue}%</span> / <span style="color: #3498db; font-weight: 600;">Google ${100 - weightMenuValue}%</span>
      </div>
    </div>
    <div class="grid grid-cols-2" style="gap: 1.5rem;">
      <div>${colorScale}</div>
      <div>${showLayer}</div>
    </div>
  </div>
</div>`;
}

