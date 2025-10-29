import * as Plot from "npm:@observablehq/plot";
import {formatLargeNumber, formatPercentDecimal, formatCurrency, formatDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de perfil demográfico de la comunidad anglosajona
 */
export function AngloProfile({angloData}) {
  const pop = angloData.population;
  const income = angloData.income;
  const edu = angloData.education_25_plus;
  
  // Comparación de distribución etaria
  const ageChart = Plot.plot({
    width: 900,
    height: 350,
    marginLeft: 80,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Distribución por edad de la población anglosajona en Houston MSA, Texas y Estados Unidos",
    x: {
      label: "Grupo de edad",
      domain: ["0-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
    },
    y: {
      label: "Proporción de la población",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true
    },
    color: {
      legend: true,
      domain: ["Houston Anglo", "Texas Anglo", "US Anglo"],
      range: ["#1f77b4", "#ff7f0e", "#2ca02c"]
    },
    marks: [
      Plot.barY(angloData.age_distribution_anglo.houston, {
        x: "age_group",
        y: "share",
        fill: () => "Houston Anglo",
        opacity: 0.85,
        tip: {
          format: {
            y: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.line(angloData.age_distribution_anglo.texas, {
        x: "age_group",
        y: "share",
        stroke: () => "Texas Anglo",
        strokeWidth: 2.5,
        marker: "dot"
      }),
      Plot.line(angloData.age_distribution_anglo.us, {
        x: "age_group",
        y: "share",
        stroke: () => "US Anglo",
        strokeWidth: 2.5,
        marker: "dot",
        strokeDasharray: "4,4"
      })
    ]
  });
  
  // Comparación de educación
  const eduData = [
    {geography: "Houston Anglo", bachelor_or_higher: edu.houston_anglo.bachelor_or_higher},
    {geography: "Houston Total", bachelor_or_higher: edu.houston_total.bachelor_or_higher},
    {geography: "Texas Anglo", bachelor_or_higher: edu.texas_anglo.bachelor_or_higher},
    {geography: "US Anglo", bachelor_or_higher: edu.us_anglo.bachelor_or_higher}
  ];
  
  const eduChart = Plot.plot({
    width: 600,
    height: 300,
    marginLeft: 140,
    marginBottom: 40,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Porcentaje de población con Bachelor's degree o superior, comparando comunidad anglosajona de Houston con el total del MSA, Texas y Estados Unidos",
    x: {
      label: "% con Bachelor o superior",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0, 0.5]
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      domain: eduData.map(d => d.geography),
      range: ["#1f77b4", "#8c8c8c", "#ff7f0e", "#2ca02c"]
    },
    marks: [
      Plot.barX(eduData, {
        y: "geography",
        x: "bachelor_or_higher",
        fill: "geography",
        sort: {y: null},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(eduData, {
        y: "geography",
        x: "bachelor_or_higher",
        text: d => formatPercentDecimal(d.bachelor_or_higher * 100, 1),
        dx: 30,
        textAnchor: "start",
        fill: "currentColor",
        fontSize: 10
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
      ">Perfil de la Comunidad Anglosajona</h3>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
            Población Anglosajona (Houston MSA)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #1f77b4;">
            ${formatLargeNumber(pop.houston_msa.anglo_population, 2)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            ${formatPercentDecimal(pop.houston_msa.anglo_share * 100, 1)} del total MSA
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Edad Mediana (Anglo Houston)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #ff7f0e;">
            ${formatDecimal(pop.houston_msa.median_age_anglo, 1)} años
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatDecimal(pop.houston_msa.median_age_total, 1)} total MSA
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Ingreso Mediano del Hogar (Anglo)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #2ca02c;">
            ${formatCurrency(income.houston_anglo.median_household_income, 'USD', 'en-US')}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatCurrency(income.houston_total.median_household_income, 'USD', 'en-US')} total
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #9467bd;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Bachelor o Superior (Anglo)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #9467bd;">
            ${formatPercentDecimal(edu.houston_anglo.bachelor_or_higher * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatPercentDecimal(edu.houston_total.bachelor_or_higher * 100, 1)} total
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Distribución por Edad — Comparativa Regional</h4>
      
      ${ageChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Nivel Educativo — Comparativa</h4>
      
      ${eduChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Insights clave:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>La comunidad anglosajona en Houston MSA representa <strong>${formatPercentDecimal(pop.houston_msa.anglo_share * 100, 1)}</strong> de la población total (${formatLargeNumber(pop.houston_msa.anglo_population, 2)} personas).</li>
          <li>Edad mediana más alta (<strong>${formatDecimal(pop.houston_msa.median_age_anglo, 1)} años</strong>) que el promedio del MSA, indicando una población más madura.</li>
          <li>Ingreso mediano del hogar <strong>${formatPercentDecimal(((income.houston_anglo.median_household_income / income.houston_total.median_household_income) - 1) * 100, 1)} superior</strong> al promedio del MSA.</li>
          <li>Nivel educativo significativamente más alto: <strong>${formatPercentDecimal(edu.houston_anglo.bachelor_or_higher * 100, 1)}</strong> con grado universitario o superior vs ${formatPercentDecimal(edu.houston_total.bachelor_or_higher * 100, 1)} total.</li>
          <li>Mayor poder adquisitivo y propensión al gasto discrecional en alimentos y servicios.</li>
        </ul>
      </div>
    </div>
  `;
}

