import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatPercentDecimal} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de educación y nivel académico
 */
export function Education({data, angloData}) {
  const education = data.education;
  const hasAngloData = angloData && angloData.education_25_plus;
  
  // Datos para gráfico de niveles educativos
  const levelData = [
    {level: "Menos de secundaria", share: education.less_than_hs, order: 1},
    {level: "Secundaria completa", share: education.hs_graduate, order: 2},
    {level: "Algo de universidad", share: education.some_college, order: 3},
    {level: "Grado asociado", share: education.associate, order: 4},
    {level: "Licenciatura", share: education.bachelor, order: 5},
    {level: "Posgrado", share: education.graduate, order: 6}
  ];
  
  const chart = Plot.plot({
    width: 700,
    height: 400,
    marginLeft: 160,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    x: {
      label: "Porcentaje de población (25+ años)",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0, 0.3]
    },
    y: {
      label: null,
      domain: levelData.sort((a, b) => a.order - b.order).map(d => d.level)
    },
    color: {
      type: "ordinal",
      scheme: "greens"
    },
    marks: [
      Plot.barX(levelData, {
        x: "share",
        y: "level",
        fill: "share",
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(levelData, {
        x: "share",
        y: "level",
        text: d => formatPercentDecimal(d.share * 100, 1),
        dx: 35,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  // Calcular totales
  const totalPop25Plus = education.total_25_plus;
  const hsOrHigher = Math.round(totalPop25Plus * education.hs_or_higher);
  const bachelorOrHigher = Math.round(totalPop25Plus * education.bachelor_or_higher);
  
  // Gráfico comparativo Anglo si hay datos
  let angloComparisonChart = null;
  if (hasAngloData) {
    const eduAnglo = angloData.education_25_plus;
    const comparisonData = [
      {geography: "Houston Anglo", bachelor_higher: eduAnglo.houston_anglo.bachelor_or_higher, type: "Bachelor+"},
      {geography: "Houston Total", bachelor_higher: eduAnglo.houston_total.bachelor_or_higher, type: "Bachelor+"},
      {geography: "Texas Anglo", bachelor_higher: eduAnglo.texas_anglo.bachelor_or_higher, type: "Bachelor+"},
      {geography: "US Anglo", bachelor_higher: eduAnglo.us_anglo.bachelor_or_higher, type: "Bachelor+"}
    ];
    
    angloComparisonChart = Plot.plot({
      width: 700,
      height: 300,
      marginLeft: 140,
      style: {
        background: "transparent",
        fontSize: "11px"
      },
      ariaLabel: "Comparativa de nivel educativo superior: comunidad anglosajona de Houston vs promedios regionales y nacionales",
      x: {
        label: "% con Bachelor's o superior",
        tickFormat: d => `${(d * 100).toFixed(0)}%`,
        grid: true,
        domain: [0, 0.5]
      },
      y: {
        label: null,
        domain: comparisonData.map(d => d.geography)
      },
      color: {
        type: "ordinal",
        domain: comparisonData.map(d => d.geography),
        range: ["#1f77b4", "#8c8c8c", "#ff7f0e", "#2ca02c"]
      },
      marks: [
        Plot.barX(comparisonData, {
          y: "geography",
          x: "bachelor_higher",
          fill: "geography",
          tip: {
            format: {
              x: d => formatPercentDecimal(d * 100, 1)
            }
          }
        }),
        Plot.text(comparisonData, {
          y: "geography",
          x: "bachelor_higher",
          text: d => formatPercentDecimal(d.bachelor_higher * 100, 1),
          dx: 35,
          textAnchor: "start",
          fill: "currentColor",
          fontSize: 10
        })
      ]
    });
  }
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Nivel Educativo</h3>
      
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
            Población 25+ años
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${formatInteger(totalPop25Plus)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Secundaria o más
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #2ca02c;">
            ${formatPercentDecimal(education.hs_or_higher * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            ${formatInteger(hsOrHigher)} personas
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Licenciatura o más
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ff7f0e;">
            ${formatPercentDecimal(education.bachelor_or_higher * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            ${formatInteger(bachelorOrHigher)} personas
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Distribución por Nivel Educativo — Houston MSA Total</h4>
      
      ${chart}
      
      ${hasAngloData ? html`
        <h4 style="
          font-size: 1.1rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: var(--theme-foreground);
        ">Educación Superior — Comparativa Anglosajona</h4>
        
        ${angloComparisonChart}
        
        <div style="
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 8px;
          border-left: 4px solid #1f77b4;
        ">
          <div style="font-size: 0.95rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.75rem;">
            📊 Insights Educativos — Comunidad Anglosajona
          </div>
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            font-size: 0.85rem;
            color: #1e40af;
            line-height: 1.6;
          ">
            <div>
              <strong>Houston Anglo:</strong><br>
              <span style="font-size: 1.2rem; font-weight: 700; color: #1f77b4;">
                ${formatPercentDecimal(angloData.education_25_plus.houston_anglo.bachelor_or_higher * 100, 1)}
              </span> con Bachelor+<br>
              <span style="font-size: 0.8rem;">(${formatInteger(angloData.education_25_plus.houston_anglo.total)} personas 25+)</span>
            </div>
            <div>
              <strong>Posgrados:</strong><br>
              <span style="font-size: 1.2rem; font-weight: 700; color: #9467bd;">
                ${formatPercentDecimal(angloData.education_25_plus.houston_anglo.graduate * 100, 1)}
              </span><br>
              <span style="font-size: 0.8rem;">Master's o Doctorado</span>
            </div>
            <div>
              <strong>Ventaja educativa:</strong><br>
              <span style="font-size: 1.2rem; font-weight: 700; color: #2ca02c;">
                +${formatPercentDecimal((angloData.education_25_plus.houston_anglo.bachelor_or_higher - angloData.education_25_plus.houston_total.bachelor_or_higher) * 100, 1)}
              </span><br>
              <span style="font-size: 0.8rem;">vs promedio MSA</span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div style="
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      ">
        <div style="
          padding: 1rem;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        ">
          <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: #0c4a6e;">
            Educación Superior
          </div>
          <div style="font-size: 2rem; font-weight: 700; color: #0369a1; margin-bottom: 0.25rem;">
            ${formatPercentDecimal((education.bachelor + education.graduate) * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: #075985;">
            con licenciatura o posgrado
          </div>
        </div>
        
        <div style="
          padding: 1rem;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        ">
          <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: #14532d;">
            Educación Media
          </div>
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">
            ${formatPercentDecimal((education.hs_graduate + education.some_college + education.associate) * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: #15803d;">
            con secundaria o técnico
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
        <strong>Implicaciones para mercado foodservice:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>Población con alto nivel educativo (${formatPercentDecimal(education.bachelor_or_higher * 100, 0)} 
          con licenciatura+${hasAngloData ? `, y ${formatPercentDecimal(angloData.education_25_plus.houston_anglo.bachelor_or_higher * 100, 0)} en comunidad anglo` : ''}) 
          indica consumidores informados que valoran <strong>calidad, autenticidad e innovación</strong>.</li>
          <li>Base amplia con secundaria completa (${formatPercentDecimal(education.hs_or_higher * 100, 0)}) 
          sugiere mercado diverso con diferentes preferencias de precio-calidad.</li>
          <li>Presencia significativa de profesionales universitarios favorece conceptos innovadores 
          y tendencias gastronómicas contemporáneas.</li>
          ${hasAngloData ? html`
            <li><strong>Segmento anglo altamente educado</strong> (${formatPercentDecimal(angloData.education_25_plus.houston_anglo.bachelor_or_higher * 100, 0)} Bachelor+) 
            es más propenso a experimentar con cocinas internacionales auténticas, como pastes mexicanos.</li>
            <li>Profesionales con posgrado (${formatPercentDecimal(angloData.education_25_plus.houston_anglo.graduate * 100, 0)} 
            en comunidad anglo) tienen mayor poder adquisitivo y menor sensibilidad al precio — ideal para pricing premium moderado ($9-$12 ticket).</li>
          ` : ''}
      </div>
    </div>
  `;
}

