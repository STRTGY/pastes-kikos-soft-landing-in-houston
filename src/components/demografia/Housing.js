import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatCurrency, formatPercentDecimal} from "../../lib/formatters.js";
import {DEMOGRAPHICS_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de vivienda y tenencia
 */
export function Housing({data}) {
  const housing = data.housing;
  
  // Gráfico de tenencia
  const tenureData = [
    {type: "Propietarios", share: housing.tenure.owner, color: DEMOGRAPHICS_PALETTE.primary},
    {type: "Inquilinos", share: housing.tenure.renter, color: DEMOGRAPHICS_PALETTE.secondary}
  ];
  
  const tenureChart = Plot.plot({
    width: 400,
    height: 300,
    style: {
      background: "transparent",
      fontSize: "13px"
    },
    marks: [
      Plot.cell(tenureData,
        Plot.stackY({
          x: null,
          y: "share",
          fill: "type",
          insetTop: 0.5,
          insetBottom: 0.5
        })
      ),
      Plot.text(tenureData,
        Plot.stackY({
          x: null,
          y: "share",
          text: d => `${d.type}\n${formatPercentDecimal(d.share * 100, 1)}`,
          fill: "white",
          fontSize: 14,
          fontWeight: "bold",
          lineHeight: 1.4
        })
      )
    ],
    color: {
      domain: tenureData.map(d => d.type),
      range: tenureData.map(d => d.color)
    },
    x: {axis: null},
    y: {axis: null}
  });
  
  // Gráfico de carga de costo
  const burdenData = [
    {group: "Propietarios", type: "≥30% ingreso", share: housing.cost_burden.owner_30_plus},
    {group: "Propietarios", type: "<30% ingreso", share: 1 - housing.cost_burden.owner_30_plus},
    {group: "Inquilinos", type: "≥30% ingreso", share: housing.cost_burden.renter_30_plus},
    {group: "Inquilinos", type: "<30% ingreso", share: 1 - housing.cost_burden.renter_30_plus}
  ];
  
  const burdenChart = Plot.plot({
    width: 600,
    height: 300,
    marginLeft: 100,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    x: {
      label: "Porcentaje",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      percent: true
    },
    y: {
      label: null
    },
    color: {
      domain: ["<30% ingreso", "≥30% ingreso"],
      range: ["#10b981", "#ef4444"],
      legend: true
    },
    marks: [
      Plot.barX(burdenData, 
        Plot.stackX({
          x: "share",
          y: "group",
          fill: "type",
          tip: {
            format: {
              x: d => formatPercentDecimal(d * 100, 1)
            }
          }
        })
      ),
      Plot.text(burdenData,
        Plot.stackX({
          x: "share",
          y: "group",
          text: d => d.share > 0.15 ? formatPercentDecimal(d.share * 100, 0) : "",
          fill: "white",
          fontWeight: "bold"
        })
      )
    ]
  });
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Vivienda y Tenencia</h3>
      
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
            Total de Unidades
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${formatInteger(housing.total_units)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tasa de Vacancia
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #2ca02c;">
            ${formatPercentDecimal(housing.vacancy_rate * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Valor Mediano (Propietarios)
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #ff7f0e;">
            ${formatCurrency(housing.median_value_owner, 'USD', 'en-US')}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Renta Mediana (Inquilinos)
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #d62728;">
            ${formatCurrency(housing.median_rent, 'USD', 'en-US')}/mes
          </div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h4 style="
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--theme-foreground);
          ">Tenencia de Vivienda</h4>
          ${tenureChart}
          
          <div style="
            margin-top: 1rem;
            padding: 0.75rem;
            background: var(--theme-background-alt);
            border-radius: 6px;
            font-size: 0.85rem;
            color: var(--theme-foreground-muted);
          ">
            <div style="margin-bottom: 0.5rem;">
              <strong>Propietarios:</strong> ${formatInteger(Math.round(housing.occupied * housing.tenure.owner))} hogares
            </div>
            <div>
              <strong>Inquilinos:</strong> ${formatInteger(Math.round(housing.occupied * housing.tenure.renter))} hogares
            </div>
          </div>
        </div>
        
        <div>
          <h4 style="
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--theme-foreground);
          ">Carga de Costo de Vivienda</h4>
          <div style="
            padding: 1rem;
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-radius: 8px;
            border-left: 4px solid #ef4444;
            margin-bottom: 1rem;
          ">
            <div style="font-size: 0.8rem; font-weight: 600; color: #7f1d1d; margin-bottom: 0.5rem;">
              Cost-burdened (≥30% del ingreso en vivienda)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div>
                <div style="font-size: 0.75rem; color: #991b1b;">Propietarios</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: #dc2626;">
                  ${formatPercentDecimal(housing.cost_burden.owner_30_plus * 100, 1)}
                </div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #991b1b;">Inquilinos</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: #dc2626;">
                  ${formatPercentDecimal(housing.cost_burden.renter_30_plus * 100, 1)}
                </div>
              </div>
            </div>
          </div>
          ${burdenChart}
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
          <li><strong>Propietarios (${formatPercentDecimal(housing.tenure.owner * 100, 0)}):</strong> 
          Mayor estabilidad residencial, más propensos a frecuentar restaurantes locales cercanos a sus hogares.</li>
          <li><strong>Inquilinos (${formatPercentDecimal(housing.tenure.renter * 100, 0)}):</strong> 
          Mayor movilidad, más abiertos a probar nuevas opciones, especialmente cerca de trabajo y zonas comerciales.</li>
          <li><strong>Presión de costo:</strong> Casi la mitad de inquilinos (${formatPercentDecimal(housing.cost_burden.renter_30_plus * 100, 0)}) 
          están cost-burdened, lo que sugiere sensibilidad al precio en este segmento.</li>
          <li><strong>Renta mediana de ${formatCurrency(housing.median_rent, 'USD', 'en-US')}:</strong> 
          Indica capacidad de gasto discrecional moderada para alimentación fuera del hogar.</li>
        </ul>
      </div>
    </div>
  `;
}

