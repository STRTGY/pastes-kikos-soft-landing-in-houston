import {html} from "npm:htl";

export function ControlPanel({
  priceInput,
  categoryInput,
  mixInput,
  coverageInput,
  priceWeightInput,
  sentimentWeightInput,
  flavourWeightInput,
  flavoursInput,
  weightPrice = 0,
  weightSentiment = 0,
  weightFlavour = 0
}) {
  
  // Calculate total weight for validation
  const totalWeight = weightPrice + weightSentiment + weightFlavour;
  const isValid = totalWeight === 100;

  return html`<div class="card" style="background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%); border: 2px solid #dee2e6; padding: 1.5rem; width: 100%; max-width: 100%; margin: 1.5rem 0;">
    <h3 style="color: #495057; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #dee2e6; display: flex; align-items: center; gap: 0.5rem;">
      <span style="font-size: 1.2em;">⚙️</span> Controles de Análisis
    </h3>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr)); gap: 1.5rem; width: 100%;">
      
      <!-- Left Column: Scenarios and Sources -->
      <div style="background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.25rem; border-radius: 8px;">
        <h4 style="color: #e74c3c; margin: 0 0 1.25rem 0; font-size: 16px; display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #fee2e2;">
          <span>💰</span> Escenarios y Fuentes
        </h4>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${priceInput}
          ${categoryInput}
          ${mixInput}
          ${coverageInput}
        </div>
      </div>

      <!-- Right Column: Component Weights -->
      <div style="background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.25rem; border-radius: 8px;">
        <h4 style="color: #3b82f6; margin: 0 0 1.25rem 0; font-size: 16px; display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #dbeafe;">
          <span>⚖️</span> Pesos de Componentes
        </h4>
        
        <div style="background: ${isValid ? '#f0fdf4' : '#fef3c7'}; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; border-left: 3px solid ${isValid ? '#22c55e' : '#f59e0b'};">
          <small style="color: #64748b; font-weight: 600;">
            Total: ${totalWeight.toFixed(0)}% ${isValid ? '✓' : '⚠️ Debe sumar 100%'}
          </small>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${priceWeightInput}
          ${sentimentWeightInput}
          ${flavourWeightInput}
          
          <div style="margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
            ${flavoursInput}
          </div>
        </div>
      </div>

    </div>

    <div style="margin-top: 1.5rem; background: #dbeafe; padding: 0.75rem; border-radius: 4px; border-left: 3px solid #3b82f6; font-size: 13px;">
      <strong>💡 Tip:</strong> Ajusta los pesos para ver cómo impactan el MarketFit Score. Los cambios se reflejan automáticamente en todos los gráficos.
    </div>
  </div>`;
}

