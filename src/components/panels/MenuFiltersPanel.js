// Menu filters panel - layout wrapper for menu analysis inputs
// Receives Input view nodes created in the page, returns structured DOM

import {html} from "npm:htl";

export function createMenuFiltersPanel({
  selectedCategoryMenu,
  showOutliers,
  logScale
}) {
  return html`<div class="card" style="margin-top: 2rem;">
  <h3>Distribución Global de Precios</h3>
  <div style="margin-bottom: 1rem;">
    <div class="grid grid-cols-2">
      <div>${selectedCategoryMenu}</div>
      <div>${showOutliers} ${logScale}</div>
    </div>
  </div>
</div>`;
}

