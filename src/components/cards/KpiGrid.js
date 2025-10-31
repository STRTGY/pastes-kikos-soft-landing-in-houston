// KPI Grid component for displaying 4 key metrics
// Pure presentation component - receives data, returns DOM

import {html} from "npm:htl";

export function createKpiGrid(kpis) {
  return html`<div class="grid grid-cols-4" style="margin-bottom: 2rem;">
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Total Restaurantes</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.total}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Precio Promedio Ciudad</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.cityMean}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Cobertura Price Level</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.priceLevelCov}</div>
  </div>
  <div class="card">
    <h3 style="font-size: 14px; color: var(--theme-foreground-muted); margin: 0 0 8px 0;">Cobertura Menú</h3>
    <div style="font-size: 32px; font-weight: 700; color: var(--theme-foreground-focus);">${kpis.menuCov}</div>
  </div>
</div>`;
}

