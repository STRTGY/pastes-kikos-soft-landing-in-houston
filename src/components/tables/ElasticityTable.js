import {html} from "npm:htl";

export function ElasticityTable({elasticityEstimate, marketPriceStats}) {
  if (!elasticityEstimate || elasticityEstimate.length === 0) return html``;
  
  return html`<div class="card">
    <h3>Análisis de Elasticidad Precio-Demanda (Estimado)</h3>
    <p class="note">
      <strong>Modelo simplificado:</strong> Elasticidad asumida de -1.2 (típica para QSR). 
      Precio base: $${marketPriceStats.p50.toFixed(2)} (mediana del mercado). Índice 100 = baseline.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="border-bottom: 2px solid var(--theme-foreground-faintest);">
          <th style="text-align: left; padding: 0.5rem;">Precio</th>
          <th style="text-align: center; padding: 0.5rem;">Δ vs Base</th>
          <th style="text-align: center; padding: 0.5rem;">Índice Demanda</th>
          <th style="text-align: center; padding: 0.5rem;">Índice Revenue</th>
          <th style="text-align: center; padding: 0.5rem;">Óptimo</th>
        </tr>
      </thead>
      <tbody>
        ${elasticityEstimate.map(e => html`<tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
          <td style="padding: 0.5rem; font-weight: 600;">$${e.price.toFixed(2)}</td>
          <td style="text-align: center; padding: 0.5rem; color: ${parseFloat(e.priceDiff) < 0 ? '#22c55e' : '#ef4444'};">
            ${e.priceDiff > 0 ? '+' : ''}${e.priceDiff}%
          </td>
          <td style="text-align: center; padding: 0.5rem;">${e.demandIndex}</td>
          <td style="text-align: center; padding: 0.5rem; font-weight: 600;">${e.revenueIndex}</td>
          <td style="text-align: center; padding: 0.5rem; font-size: 18px;">${e.optimal}</td>
        </tr>`)}
      </tbody>
    </table>
    <p class="note" style="margin-top: 1rem;">
      <strong>Interpretación:</strong> Índice Revenue > 100 sugiere mayor ingreso total. 
      Precios bajos aumentan volumen pero pueden no maximizar revenue. Validar con pruebas de mercado reales.
    </p>
  </div>`;
}

