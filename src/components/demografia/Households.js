import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatDecimal, formatPercentDecimal} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de hogares y estructura familiar
 */
export function Households({data}) {
  const households = data.households;
  
  // Datos para gráfico de tipos de hogar
  const typeData = [
    {type: "Parejas casadas", value: households.types.married_couple},
    {type: "Padres solteros", value: households.types.single_parent},
    {type: "Personas solas", value: households.types.living_alone},
    {type: "Otros no familiares", value: households.types.nonfamily - households.types.living_alone}
  ];
  
  const typeChart = Plot.plot({
    width: 600,
    height: 400,
    marginLeft: 150,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    x: {
      label: "Porcentaje de hogares",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0, 0.5]
    },
    y: {
      label: null
    },
    color: {
      domain: typeData.map(d => d.type),
      range: QUALITATIVE_PALETTE
    },
    marks: [
      Plot.barX(typeData, {
        x: "value",
        y: "type",
        fill: "type",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(typeData, {
        x: "value",
        y: "type",
        text: d => formatPercentDecimal(d.value * 100, 1),
        dx: 40,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Hogares y Estructura Familiar</h3>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      ">
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #1f77b4;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Total de Hogares
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${formatInteger(households.total)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tamaño Promedio
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ff7f0e;">
            ${formatDecimal(households.avg_size, 2)} personas
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Hogares Familiares
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #2ca02c;">
            ${formatPercentDecimal(households.types.family * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Con Hijos Menores
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #d62728;">
            ${formatPercentDecimal(households.with_children * 100, 1)}
          </div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
        <div>
          ${typeChart}
        </div>
        
        <div>
          <h4 style="
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--theme-foreground);
          ">Composición de Hogares</h4>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${typeData.map((d, i) => html`
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                background: var(--theme-background-alt);
                border-radius: 6px;
                border-left: 3px solid ${QUALITATIVE_PALETTE[i]};
              ">
                <span style="font-weight: 500; color: var(--theme-foreground);">
                  ${d.type}
                </span>
                <span style="
                  font-size: 1.1rem;
                  font-weight: 700;
                  color: ${QUALITATIVE_PALETTE[i]};
                ">
                  ${formatPercentDecimal(d.value * 100, 1)}
                </span>
              </div>
            `)}
          </div>
        </div>
      </div>
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Implicaciones para el mercado:</strong> 
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>Tamaño promedio de hogar de ${formatDecimal(households.avg_size, 2)} personas sugiere 
          oportunidades para ofertas familiares y combos.</li>
          <li>${formatPercentDecimal(households.with_children * 100, 0)} de hogares con hijos menores 
          representan un segmento clave para productos orientados a familias.</li>
          <li>${formatPercentDecimal(households.types.living_alone * 100, 0)} de hogares unipersonales 
          indican demanda para porciones individuales y servicios rápidos.</li>
        </ul>
      </div>
    </div>
  `;
}

