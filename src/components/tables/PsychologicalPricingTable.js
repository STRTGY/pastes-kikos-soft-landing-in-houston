import {html} from "npm:htl";

export function PsychologicalPricingTable({psychologicalPricingAnalysis}) {
  if (!psychologicalPricingAnalysis || psychologicalPricingAnalysis.length === 0) return html``;
  
  return html`<div class="card">
    <h3>Análisis de Pricing Psicológico</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--theme-foreground-faintest);">
          <th style="text-align: left; padding: 0.5rem;">Precio</th>
          <th style="text-align: center; padding: 0.5rem;">Por Pieza</th>
          <th style="text-align: center; padding: 0.5rem;">Categoría</th>
          <th style="text-align: left; padding: 0.5rem;">Percepción</th>
        </tr>
      </thead>
      <tbody>
        ${psychologicalPricingAnalysis.map(p => html`<tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
          <td style="padding: 0.5rem; font-weight: 600;">$${p.price.toFixed(2)}</td>
          <td style="text-align: center; padding: 0.5rem;">$${p.perPiecePrice.toFixed(2)}</td>
          <td style="text-align: center; padding: 0.5rem;">
            <span style="background: var(--theme-background-alt); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 13px;">
              ${p.priceCategory}
            </span>
          </td>
          <td style="padding: 0.5rem; font-size: 13px; color: var(--theme-foreground-muted);">
            ${p.psychNote}
          </td>
        </tr>`)}
      </tbody>
    </table>
    <p class="note" style="margin-top: 1rem;">
      <strong>Pricing psicológico:</strong> Precios "charm" (terminados en .99/.95) generan percepción de menor costo. 
      Precios redondos comunican simplicidad y confianza. Considerar categoría de valor percibido al seleccionar escenario final.
    </p>
  </div>`;
}

