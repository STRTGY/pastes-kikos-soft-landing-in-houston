import * as Plot from "npm:@observablehq/plot";
import {formatCurrency, formatPercentDecimal, formatDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de consumo y gasto del hogar (FAH vs FAFH)
 */
export function ConsumptionSpending({ceData, ersData}) {
  // Preparar datos FAH/FAFH por geografía
  const fafhShareData = [
    {
      year: 2022,
      geography: "Houston MSA",
      fah: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "Houston MSA")?.food_at_home || 5420,
      fafh: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "Houston MSA")?.food_away_from_home || 4710
    },
    {
      year: 2023,
      geography: "Houston MSA",
      fah: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "Houston MSA")?.food_at_home || 5760,
      fafh: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "Houston MSA")?.food_away_from_home || 5060
    },
    {
      year: 2022,
      geography: "South Region",
      fah: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "South Region")?.food_at_home || 5180,
      fafh: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "South Region")?.food_away_from_home || 4160
    },
    {
      year: 2023,
      geography: "South Region",
      fah: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "South Region")?.food_at_home || 5510,
      fafh: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "South Region")?.food_away_from_home || 4470
    },
    {
      year: 2022,
      geography: "United States",
      fah: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "United States")?.food_at_home || 5259,
      fafh: ceData.annual_averages.find(d => d.year === 2022 && d.geography === "United States")?.food_away_from_home || 4084
    },
    {
      year: 2023,
      geography: "United States",
      fah: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "United States")?.food_at_home || 5703,
      fafh: ceData.annual_averages.find(d => d.year === 2023 && d.geography === "United States")?.food_away_from_home || 4282
    }
  ];
  
  // Transformar a formato stacked
  const stackedData = fafhShareData.flatMap(d => [
    {year: d.year, geography: d.geography, category: "Food at Home", value: d.fah, share: d.fah / (d.fah + d.fafh)},
    {year: d.year, geography: d.geography, category: "Food Away from Home", value: d.fafh, share: d.fafh / (d.fah + d.fafh)}
  ]);
  
  const fafhChart = Plot.plot({
    width: 900,
    height: 400,
    marginLeft: 120,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Gasto anual del hogar en alimentos por ubicación geográfica y año, mostrando Food at Home versus Food Away from Home",
    x: {
      label: null
    },
    y: {
      label: "Gasto anual (USD)",
      tickFormat: d => formatCurrency(d, 'USD', 'en-US'),
      grid: true
    },
    color: {
      legend: true,
      domain: ["Food at Home", "Food Away from Home"],
      range: ["#2ca02c", "#ff7f0e"]
    },
    marks: [
      Plot.barY(stackedData, {
        x: d => `${d.geography} ${d.year}`,
        y: "value",
        fill: "category",
        tip: {
          format: {
            x: false,
            y: d => formatCurrency(d, 'USD', 'en-US')
          }
        }
      }),
      Plot.text(stackedData.filter(d => d.category === "Food Away from Home"), {
        x: d => `${d.geography} ${d.year}`,
        y: d => d.value / 2,
        text: d => formatPercentDecimal(d.share * 100, 0),
        fill: "white",
        fontSize: 10,
        fontWeight: "bold"
      })
    ]
  });
  
  // Tendencia histórica FAFH share (ERS)
  const trendData = ersData.annual_series.filter(d => d.year >= 2010);
  
  const trendChart = Plot.plot({
    width: 900,
    height: 300,
    marginLeft: 60,
    marginBottom: 50,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Tendencia histórica del share de Food Away from Home en Estados Unidos desde 2010 hasta 2024, mostrando el impacto de COVID-19 en 2020",
    x: {
      label: "Año",
      tickFormat: d => d.toString(),
      grid: true
    },
    y: {
      label: "Share de Food Away from Home",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0.3, 0.6]
    },
    marks: [
      Plot.line(trendData, {
        x: "year",
        y: "fafh_share",
        stroke: "#ff7f0e",
        strokeWidth: 2.5,
        marker: "dot"
      }),
      Plot.dot(trendData, {
        x: "year",
        y: "fafh_share",
        fill: "#ff7f0e",
        r: 4,
        tip: {
          format: {
            x: d => d.toString(),
            y: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.ruleY([0.5], {
        stroke: "#d62728",
        strokeDasharray: "4,4",
        strokeWidth: 1.5
      }),
      Plot.text([[2020, 0.58]], {
        x: d => d[0],
        y: d => d[1],
        text: ["COVID-19"],
        dy: -8,
        fill: "#d62728",
        fontSize: 9,
        fontWeight: "bold"
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
      ">Consumo y Gasto del Hogar</h3>
      
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
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            FAFH Share — Houston 2023
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #ff7f0e;">
            ${formatPercentDecimal(ceData.food_share_analysis.houston_2023.fafh_share * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            del gasto total en alimentos
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Gasto FAFH Anual (Houston)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #2ca02c;">
            ${formatCurrency(ceData.annual_averages.find(d => d.year === 2023 && d.geography === "Houston MSA")?.food_away_from_home || 5060, 'USD', 'en-US')}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            +${formatPercentDecimal(ceData.year_over_year_growth.houston_fafh * 100, 1)} vs 2022
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #1f77b4;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Gasto Total en Alimentos
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #1f77b4;">
            ${formatCurrency(ceData.annual_averages.find(d => d.year === 2023 && d.geography === "Houston MSA")?.food_total || 10820, 'USD', 'en-US')}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            ${formatPercentDecimal(ceData.food_share_analysis.houston_2023.food_as_pct_total * 100, 1)} del gasto total
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Food At Home vs Food Away From Home — Comparativa Regional (2022-2023)</h4>
      
      ${fafhChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Tendencia Histórica — Share de Food Away from Home (EE.UU.)</h4>
      
      ${trendChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Implicaciones de mercado:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>Houston MSA muestra <strong>${formatPercentDecimal(ceData.food_share_analysis.houston_2023.fafh_share * 100, 1)}</strong> de share FAFH en 2023, <strong>superior</strong> al promedio nacional (${formatPercentDecimal(ceData.food_share_analysis.us_2023.fafh_share * 100, 1)}).</li>
          <li>La comunidad anglosajona de ingresos altos ($100K+) destina <strong>${formatPercentDecimal(ceData.income_tercile_expenditures_us_2023.find(d => d.tercile.includes("High"))?.fafh_share * 100, 1)}</strong> del gasto alimentario a FAFH.</li>
          <li>Crecimiento interanual robusto en FAFH Houston: <strong>+${formatPercentDecimal(ceData.year_over_year_growth.houston_fafh * 100, 1)}</strong>, señalando recuperación post-COVID y preferencia por conveniencia.</li>
          <li>El mercado de foodservice en Houston se beneficia de ingresos medianos más altos, movilidad vehicular elevada y cultura de "eating out".</li>
        </ul>
      </div>
    </div>
  `;
}

