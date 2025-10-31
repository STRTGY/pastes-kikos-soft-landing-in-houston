import {html} from "npm:htl";

export function MarketPricePercentilesCard({marketPriceStats}) {
  if (!marketPriceStats) return html``;
  
  return html`<div class="card">
    <h3>Distribución de Precios del Mercado Houston</h3>
    <div class="grid grid-cols-5" style="margin-bottom: 1rem;">
      <div style="text-align: center; padding: 0.5rem; background: var(--theme-background-alt); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--theme-foreground-muted);">P10</div>
        <div style="font-size: 18px; font-weight: 700; color: #22c55e;">$${marketPriceStats.p10.toFixed(2)}</div>
      </div>
      <div style="text-align: center; padding: 0.5rem; background: var(--theme-background-alt); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--theme-foreground-muted);">P25</div>
        <div style="font-size: 18px; font-weight: 700; color: #84cc16;">$${marketPriceStats.p25.toFixed(2)}</div>
      </div>
      <div style="text-align: center; padding: 0.5rem; background: var(--theme-background-alt); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--theme-foreground-muted);">P50 (Mediana)</div>
        <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">$${marketPriceStats.p50.toFixed(2)}</div>
      </div>
      <div style="text-align: center; padding: 0.5rem; background: var(--theme-background-alt); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--theme-foreground-muted);">P75</div>
        <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">$${marketPriceStats.p75.toFixed(2)}</div>
      </div>
      <div style="text-align: center; padding: 0.5rem; background: var(--theme-background-alt); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--theme-foreground-muted);">P90</div>
        <div style="font-size: 18px; font-weight: 700; color: #ef4444;">$${marketPriceStats.p90.toFixed(2)}</div>
      </div>
    </div>
    <div class="note">
      <strong>Interpretación:</strong> P10 = 10% de restaurantes cobran menos | P50 = precio mediano | P90 = solo 10% cobran más.
      Media: $${marketPriceStats.mean.toFixed(2)} | Desv. Est.: $${marketPriceStats.stdev.toFixed(2)} | n = ${marketPriceStats.n} celdas
    </div>
  </div>`;
}

