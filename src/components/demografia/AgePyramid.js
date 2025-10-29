import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatPercentDecimal} from "../../lib/formatters.js";
import {DEMOGRAPHICS_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de pirámide de edad con indicadores de grupos etarios
 */
export function AgePyramid({data}) {
  const age = data.age;
  const groups = age.groups;
  
  // Preparar datos para la pirámide (valores negativos para hombres)
  const pyramidData = age.pyramid.flatMap(d => [
    {age: d.age, sex: "Hombres", value: -d.male},
    {age: d.age, sex: "Mujeres", value: d.female}
  ]);
  
  const chart = Plot.plot({
    width: 900,
    height: 500,
    marginLeft: 70,
    marginRight: 70,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Población",
      tickFormat: d => formatInteger(Math.abs(d)),
      grid: true
    },
    y: {
      label: "Grupo de edad",
      domain: age.pyramid.map(d => d.age).reverse()
    },
    color: {
      domain: ["Hombres", "Mujeres"],
      range: [DEMOGRAPHICS_PALETTE.male, DEMOGRAPHICS_PALETTE.female],
      legend: true
    },
    marks: [
      Plot.barX(pyramidData, {
        x: "value",
        y: "age",
        fill: "sex",
        tip: {
          format: {
            x: d => formatInteger(Math.abs(d))
          }
        }
      }),
      Plot.ruleX([0], {stroke: "var(--theme-foreground-muted)", strokeWidth: 1})
    ]
  });
  
  const totalPop = age.pyramid.reduce((sum, d) => sum + d.male + d.female, 0);
  const totalMale = age.pyramid.reduce((sum, d) => sum + d.male, 0);
  const totalFemale = age.pyramid.reduce((sum, d) => sum + d.female, 0);
  const sexRatio = ((totalMale / totalFemale) * 100).toFixed(1);
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Estructura de Edad y Sexo</h3>
      
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
            Edad Mediana
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${age.median.toFixed(1)} años
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid ${DEMOGRAPHICS_PALETTE.male};
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Hombres
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: ${DEMOGRAPHICS_PALETTE.male};">
            ${formatInteger(totalMale)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            ${formatPercentDecimal((totalMale / totalPop) * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid ${DEMOGRAPHICS_PALETTE.female};
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Mujeres
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: ${DEMOGRAPHICS_PALETTE.female};">
            ${formatInteger(totalFemale)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            ${formatPercentDecimal((totalFemale / totalPop) * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Razón de Sexo
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ff7f0e;">
            ${sexRatio}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            hombres por 100 mujeres
          </div>
        </div>
      </div>
      
      ${chart}
      
      <div style="
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      ">
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.5rem;">
            Jóvenes (0-14 años)
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #ff7f0e;">
            ${formatPercentDecimal(groups.youth * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.5rem;">
            Edad laboral (15-64 años)
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #2ca02c;">
            ${formatPercentDecimal(groups.working_age * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.5rem;">
            Adultos mayores (65+ años)
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #9467bd;">
            ${formatPercentDecimal(groups.senior * 100, 1)}
          </div>
        </div>
      </div>
      
      <div style="
        margin-top: 1rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Interpretación:</strong> Houston tiene una población relativamente joven con edad mediana de ${age.median.toFixed(1)} años.
        Casi ${formatPercentDecimal(groups.working_age * 100, 0)} de la población está en edad laboral, lo que indica un mercado
        de consumidores activos y con capacidad adquisitiva.
      </div>
    </div>
  `;
}

