import * as Plot from "npm:@observablehq/plot";
import {formatDecimal, formatPercentDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de inflación y precios de alimentos (CPI)
 */
export function FoodInflation({cpiData}) {
  // Series temporales CPI
  const annualSeries = cpiData.annual_series.filter(d => d.year >= 2018);
  
  // Transformar a formato largo
  const longData = annualSeries.flatMap(d => [
    {year: d.year, geography: "Houston", category: "Total Food", index: d.houston_food_total},
    {year: d.year, geography: "Houston", category: "Food at Home", index: d.houston_fah},
    {year: d.year, geography: "Houston", category: "Food Away from Home", index: d.houston_fafh},
    {year: d.year, geography: "US", category: "Total Food", index: d.us_food_total},
    {year: d.year, geography: "US", category: "Food at Home", index: d.us_fah},
    {year: d.year, geography: "US", category: "Food Away from Home", index: d.us_fafh}
  ]);
  
  const cpiChart = Plot.plot({
    width: 900,
    height: 400,
    marginLeft: 60,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Evolución del Índice de Precios al Consumidor para alimentos en Houston versus Estados Unidos desde 2018 hasta 2025",
    x: {
      label: "Año",
      tickFormat: d => d.toString()
    },
    y: {
      label: "Índice CPI (1982-84 = 100)",
      grid: true
    },
    color: {
      legend: true,
      domain: ["Houston Total Food", "Houston Food at Home", "Houston Food Away from Home", 
               "US Total Food", "US Food at Home", "US Food Away from Home"],
      range: ["#1f77b4", "#2ca02c", "#ff7f0e", "#aec7e8", "#98df8a", "#ffbb78"]
    },
    marks: [
      Plot.line(longData.filter(d => d.geography === "Houston" && d.category === "Total Food"), {
        x: "year",
        y: "index",
        stroke: () => "Houston Total Food",
        strokeWidth: 2.5
      }),
      Plot.line(longData.filter(d => d.geography === "Houston" && d.category === "Food at Home"), {
        x: "year",
        y: "index",
        stroke: () => "Houston Food at Home",
        strokeWidth: 2
      }),
      Plot.line(longData.filter(d => d.geography === "Houston" && d.category === "Food Away from Home"), {
        x: "year",
        y: "index",
        stroke: () => "Houston Food Away from Home",
        strokeWidth: 2
      }),
      Plot.line(longData.filter(d => d.geography === "US" && d.category === "Total Food"), {
        x: "year",
        y: "index",
        stroke: () => "US Total Food",
        strokeWidth: 2,
        strokeDasharray: "4,4"
      }),
      Plot.line(longData.filter(d => d.geography === "US" && d.category === "Food Away from Home"), {
        x: "year",
        y: "index",
        stroke: () => "US Food Away from Home",
        strokeWidth: 1.5,
        strokeDasharray: "4,4"
      }),
      Plot.dot(longData.filter(d => d.geography === "Houston"), {
        x: "year",
        y: "index",
        fill: d => `Houston ${d.category}`,
        r: 3,
        tip: {
          format: {
            x: d => d.toString(),
            y: d => formatDecimal(d, 1)
          }
        }
      })
    ]
  });
  
  // YoY change chart
  const yoyData = cpiData.yoy_percent_change.filter(d => d.year >= 2019);
  const yoyLong = yoyData.flatMap(d => [
    {year: d.year, geography: "Houston", category: "Food at Home", change: d.houston_fah},
    {year: d.year, geography: "Houston", category: "Food Away from Home", change: d.houston_fafh},
    {year: d.year, geography: "US", category: "Food at Home", change: d.us_fah},
    {year: d.year, geography: "US", category: "Food Away from Home", change: d.us_fafh}
  ]);
  
  const yoyChart = Plot.plot({
    width: 900,
    height: 350,
    marginLeft: 120,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Variación porcentual interanual de precios de alimentos en Houston y Estados Unidos, comparando Food at Home con Food Away from Home desde 2019 hasta 2024",
    x: {
      label: null
    },
    y: {
      label: "Variación % interanual",
      tickFormat: d => `${d.toFixed(0)}%`,
      grid: true
    },
    color: {
      legend: true,
      domain: ["Houston Food at Home", "Houston Food Away from Home", "US Food at Home", "US Food Away from Home"],
      range: ["#2ca02c", "#ff7f0e", "#98df8a", "#ffbb78"]
    },
    marks: [
      Plot.barY(yoyLong, Plot.groupX(
        {y: "first"},
        {
          x: d => `${d.geography} ${d.year}`,
          y: "change",
          fill: d => `${d.geography} ${d.category}`,
          tip: {
            format: {
              x: false,
              y: d => `${formatDecimal(d, 1)}%`
            }
          }
        }
      )),
      Plot.ruleY([0], {
        stroke: "#666",
        strokeWidth: 1
      })
    ]
  });
  
  const latest2024 = cpiData.yoy_percent_change.find(d => d.year === 2024);
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Inflación y Precios de Alimentos</h3>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      ">
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #1f77b4;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            CPI Alimentos Total (Houston 2024)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #1f77b4;">
            ${formatDecimal(cpiData.annual_series.find(d => d.year === 2024)?.houston_food_total || 318.2, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            +${formatPercentDecimal(latest2024?.houston_food_total || 3.4, 1)} vs 2023
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Inflación FAH (Houston 2024)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #2ca02c;">
            +${formatPercentDecimal(latest2024?.houston_fah || 2.8, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            moderándose desde 2022
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Inflación FAFH (Houston 2024)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #ff7f0e;">
            +${formatPercentDecimal(latest2024?.houston_fafh || 4.0, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            presión de costos laborales
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Aumento Acumulado 2018-2024
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #d62728;">
            +${formatPercentDecimal(cpiData.cumulative_change_2018_2024.houston_food_total, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            alimentos total Houston
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Evolución del Índice CPI — Houston vs EE.UU. (2018-2025)</h4>
      
      ${cpiChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Variación Interanual — FAH vs FAFH (2019-2024)</h4>
      
      ${yoyChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Implicaciones de pricing:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>Houston ha experimentado <strong>+${formatPercentDecimal(cpiData.cumulative_change_2018_2024.houston_food_total, 1)}</strong> de inflación acumulada en alimentos desde 2018, ligeramente superior al promedio nacional.</li>
          <li>El pico inflacionario de 2022 (<strong>+${formatPercentDecimal(cpiData.yoy_percent_change.find(d => d.year === 2022)?.houston_food_total || 8.7, 1)}</strong>) ha moderado, pero los precios FAFH siguen creciendo más rápido que FAH.</li>
          <li>La inflación en FAFH refleja presiones de costos laborales (salarios mínimos, competencia por talento) y rentas comerciales.</li>
          <li>Los consumidores anglosajones de ingresos altos son menos sensibles a inflación FAFH, pero el segmento medio puede ajustar frecuencia de visitas.</li>
          <li>Estrategia de precios: mantener percepción de valor sin erosionar margen; considerar promociones tácticas en horarios valle.</li>
        </ul>
      </div>
    </div>
  `;
}

