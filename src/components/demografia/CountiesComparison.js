import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatPercentDecimal, formatCurrency} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de comparación detallada entre condados
 */
export function CountiesComparison({data}) {
  if (!data || !data.population || !data.population.counties) {
    return html`<div style="padding: 2rem; color: red;">Error: Datos de condados no disponibles</div>`;
  }
  
  const counties = data.population.counties;
  
  // Gráfico de población por condado
  const popChart = Plot.plot({
    width: 900,
    height: 400,
    marginLeft: 150,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Población (2022)",
      tickFormat: d => formatInteger(d),
      grid: true
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      range: QUALITATIVE_PALETTE
    },
    marks: [
      Plot.barX(counties, {
        x: "population_2022",
        y: "name",
        fill: "name",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatInteger(d),
            y: true
          }
        }
      }),
      Plot.text(counties, {
        x: "population_2022",
        y: "name",
        text: d => formatInteger(d.population_2022),
        dx: 60,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  // Gráfico de ingreso mediano por condado
  const incomeChart = Plot.plot({
    width: 900,
    height: 400,
    marginLeft: 150,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Ingreso mediano del hogar (USD)",
      tickFormat: d => `$${(d / 1000).toFixed(0)}K`,
      grid: true
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      scheme: "greens"
    },
    marks: [
      Plot.barX(counties, {
        x: "median_income",
        y: "name",
        fill: "median_income",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatCurrency(d, 'USD', 'en-US'),
            y: true
          }
        }
      }),
      Plot.text(counties, {
        x: "median_income",
        y: "name",
        text: d => `$${(d.median_income / 1000).toFixed(0)}K`,
        dx: 45,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  // Gráfico de población nacida en el extranjero
  const foreignChart = Plot.plot({
    width: 900,
    height: 400,
    marginLeft: 150,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Porcentaje nacido en el extranjero",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0, 0.4]
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      scheme: "oranges"
    },
    marks: [
      Plot.barX(counties, {
        x: "foreign_born",
        y: "name",
        fill: "foreign_born",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1),
            y: true
          }
        }
      }),
      Plot.text(counties, {
        x: "foreign_born",
        y: "name",
        text: d => formatPercentDecimal(d.foreign_born * 100, 1),
        dx: 35,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  // Tabla comparativa
  const maxPop = Math.max(...counties.map(c => c.population_2022));
  const maxIncome = Math.max(...counties.map(c => c.median_income));
  const maxForeign = Math.max(...counties.map(c => c.foreign_born));
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Comparación Detallada por Condados</h3>
      
      <div style="
        margin-bottom: 2rem;
        padding: 1rem;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      ">
        <div style="font-size: 0.9rem; font-weight: 600; color: #1e3a8a; margin-bottom: 0.5rem;">
          Heterogeneidad del MSA
        </div>
        <div style="font-size: 0.85rem; color: #1e40af; line-height: 1.5;">
          El MSA de Houston muestra gran diversidad entre sus condados. Fort Bend tiene el ingreso más alto 
          (${formatCurrency(maxIncome, 'USD', 'en-US')}) y mayor proporción de extranjeros (${formatPercentDecimal(maxForeign * 100, 1)}), 
          mientras Harris concentra ${formatPercentDecimal(counties[0].share * 100, 0)} de la población total.
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Población por Condado</h4>
      
      ${popChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Ingreso Mediano del Hogar</h4>
      
      ${incomeChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Población Nacida en el Extranjero</h4>
      
      ${foreignChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Tabla Comparativa</h4>
      
      <div style="
        overflow-x: auto; 
        margin: 1rem 0;
        background: var(--theme-background-alt);
        border-radius: 8px;
      ">
        <div style="min-width: 800px; font-size: 0.85rem;">
          <!-- Header Row -->
          <div style="
            display: grid;
            grid-template-columns: 200px 120px 100px 110px 150px 120px;
            background: var(--theme-foreground-faintest);
            border-bottom: 2px solid var(--theme-foreground-faint);
            font-weight: 700;
          ">
            <div style="padding: 0.75rem; text-align: left;">Condado</div>
            <div style="padding: 0.75rem; text-align: right;">Población</div>
            <div style="padding: 0.75rem; text-align: right;">% del MSA</div>
            <div style="padding: 0.75rem; text-align: right;">Ed. Mediana</div>
            <div style="padding: 0.75rem; text-align: right;">Ingreso Mediano</div>
            <div style="padding: 0.75rem; text-align: right;">% Extranjero</div>
          </div>
          
          <!-- Data Rows -->
          ${counties.map((county, i) => html`
            <div style="
              display: grid;
              grid-template-columns: 200px 120px 100px 110px 150px 120px;
              border-bottom: 1px solid var(--theme-foreground-faintest);
            ">
              <div style="
                padding: 0.75rem;
                font-weight: 500;
                display: flex;
                align-items: center;
              ">
                <span style="
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 2px;
                  background: ${QUALITATIVE_PALETTE[i]};
                  margin-right: 0.5rem;
                  flex-shrink: 0;
                "></span>
                <span>${county.name}</span>
              </div>
              <div style="
                padding: 0.75rem;
                text-align: right;
                font-variant-numeric: tabular-nums;
              ">${formatInteger(county.population_2022)}</div>
              <div style="
                padding: 0.75rem;
                text-align: right;
                font-variant-numeric: tabular-nums;
              ">${formatPercentDecimal(county.share * 100, 1)}</div>
              <div style="
                padding: 0.75rem;
                text-align: right;
                font-variant-numeric: tabular-nums;
              ">${county.median_age.toFixed(1)} años</div>
              <div style="
                padding: 0.75rem;
                text-align: right;
                font-variant-numeric: tabular-nums;
              ">${formatCurrency(county.median_income, 'USD', 'en-US')}</div>
              <div style="
                padding: 0.75rem;
                text-align: right;
                font-variant-numeric: tabular-nums;
              ">${formatPercentDecimal(county.foreign_born * 100, 1)}</div>
            </div>
          `)}
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
        <strong>Implicaciones estratégicas por condado:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li><strong>Harris County:</strong> El núcleo urbano con mayor diversidad y población. 
          Ideal para conceptos accesibles y ubicaciones de alto tráfico.</li>
          <li><strong>Fort Bend County:</strong> El condado más próspero con alto poder adquisitivo. 
          Oportunidad para conceptos premium y familias de clase media-alta.</li>
          <li><strong>Montgomery County:</strong> Crecimiento suburbano con ingresos elevados. 
          Potencial para ubicaciones en zonas residenciales en expansión.</li>
          <li><strong>Brazoria y Galveston:</strong> Balance entre población y poder adquisitivo. 
          Mercados secundarios con menor competencia.</li>
        </ul>
      </div>
    </div>
  `;
}

