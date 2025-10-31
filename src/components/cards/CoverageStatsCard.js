// Coverage statistics card with gradient background
// Pure presentation component - receives computed stats, returns DOM

import {html} from "npm:htl";

export function createCoverageStatsCard(coverageStats) {
  return html`<div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h3 style="margin-top: 0; color: white; font-size: 18px;">📊 Estadísticas de Cobertura de Datos</h3>
  <div class="grid grid-cols-3" style="gap: 1rem;">
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Celdas con datos de menú</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.pctWithMenu}%</div>
      <div style="font-size: 11px; opacity: 0.8;">${coverageStats.withMenu} de ${coverageStats.totalCells}</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Celdas con ambas fuentes</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.pctWithBoth}%</div>
      <div style="font-size: 11px; opacity: 0.8;">${coverageStats.withBoth} celdas</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; backdrop-filter: blur(10px);">
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Items promedio/celda</div>
      <div style="font-size: 28px; font-weight: 700;">${coverageStats.avgItemsPerCell}</div>
      <div style="font-size: 11px; opacity: 0.8;">items de menú</div>
    </div>
  </div>
</div>`;
}

