import * as Plot from "npm:@observablehq/plot";
import {formatCurrency, formatPercentDecimal, formatDecimal} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de ingresos y distribución económica
 */
export function Income({data}) {
  const income = data.income;
  
  // Gráfico de distribución por brackets
  const bracketChart = Plot.plot({
    width: 800,
    height: 400,
    marginLeft: 120,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Porcentaje de hogares",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      scheme: "blues"
    },
    marks: [
      Plot.barX(income.brackets, {
        x: "share",
        y: "range",
        fill: "share",
        sort: {y: null},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(income.brackets, {
        x: "share",
        y: "range",
        text: d => formatPercentDecimal(d.share * 100, 1),
        dx: 30,
        textAnchor: "start",
        fill: "currentColor",
        fontSize: 10
      })
    ]
  });
  
  // Gráfico de percentiles
  const percentileChart = Plot.plot({
    width: 800,
    height: 300,
    marginLeft: 80,
    marginBottom: 50,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Percentil",
      tickFormat: d => `P${d}`,
      grid: true
    },
    y: {
      label: "Ingreso anual del hogar (USD)",
      tickFormat: d => formatCurrency(d, 'USD', 'en-US'),
      grid: true
    },
    marks: [
      Plot.line(income.percentiles, {
        x: "p",
        y: "value",
        stroke: "#1f77b4",
        strokeWidth: 2.5,
        curve: "catmull-rom"
      }),
      Plot.dot(income.percentiles, {
        x: "p",
        y: "value",
        fill: "#1f77b4",
        r: 4,
        tip: {
          format: {
            x: d => `Percentil ${d}`,
            y: d => formatCurrency(d, 'USD', 'en-US')
          }
        }
      }),
      Plot.ruleY([income.median_household], {
        stroke: "#d62728",
        strokeWidth: 2,
        strokeDasharray: "5,5"
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
      ">Ingresos y Distribución Económica</h3>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
            Ingreso Mediano del Hogar
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #1f77b4;">
            ${formatCurrency(income.median_household, 'USD', 'en-US')}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Ingreso Mediano Familiar
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #ff7f0e;">
            ${formatCurrency(income.median_family, 'USD', 'en-US')}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Ingreso Per Cápita
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #2ca02c;">
            ${formatCurrency(income.per_capita, 'USD', 'en-US')}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Índice de Gini
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: #d62728;">
            ${formatDecimal(income.gini, 3)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            Desigualdad moderada-alta
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Distribución por Rangos de Ingreso</h4>
      
      ${bracketChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Curva de Percentiles de Ingreso</h4>
      
      ${percentileChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Segmentación del mercado por ingreso:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li><strong>Bajo (< $35K):</strong> ${formatPercentDecimal((income.brackets[0].share + income.brackets[1].share + income.brackets[2].share) * 100, 1)} 
          de los hogares — precio muy sensible, enfoque en valor.</li>
          <li><strong>Medio ($35K-$100K):</strong> ${formatPercentDecimal((income.brackets[3].share + income.brackets[4].share + income.brackets[5].share) * 100, 1)} 
          de los hogares — segmento principal, balance precio-calidad.</li>
          <li><strong>Alto ($100K+):</strong> ${formatPercentDecimal((income.brackets[6].share + income.brackets[7].share + income.brackets[8].share) * 100, 1)} 
          de los hogares — menos sensible al precio, valoran conveniencia y calidad.</li>
        </ul>
      </div>
    </div>
  `;
}

