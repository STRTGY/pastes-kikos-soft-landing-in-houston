import {html} from "npm:htl";

export function PricePositionTable({pricePositionAnalysis}) {
  if (!pricePositionAnalysis || pricePositionAnalysis.length === 0) return html``;
  
  return html`<div class="card">
    <h3>Posicionamiento de Escenarios vs Mercado</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--theme-foreground-faintest);">
          <th style="text-align: left; padding: 0.5rem;">Precio (2 pzas)</th>
          <th style="text-align: center; padding: 0.5rem;">Percentil</th>
          <th style="text-align: center; padding: 0.5rem;">Más barato que</th>
          <th style="text-align: left; padding: 0.5rem;">Posicionamiento</th>
        </tr>
      </thead>
      <tbody>
        ${pricePositionAnalysis.map(p => html`<tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
          <td style="padding: 0.5rem; font-weight: 600;">$${p.price.toFixed(2)}</td>
          <td style="text-align: center; padding: 0.5rem;">P${(p.percentile * 100).toFixed(0)}</td>
          <td style="text-align: center; padding: 0.5rem;">${p.cheaperThan}%</td>
          <td style="padding: 0.5rem;">
            <span style="background: ${p.color}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 13px; font-weight: 600;">
              ${p.positioning}
            </span>
          </td>
        </tr>`)}
      </tbody>
    </table>
    <p class="note" style="margin-top: 1rem;">
      <strong>Recomendación estratégica:</strong> Precios ultra-competitivos (< P25) capturan market share rápido pero pueden limitar márgenes. 
      Precios competitivos (P25-P75) balancean volumen y margen. Premium (> P75) requiere diferenciación clara.
    </p>
  </div>`;
}

