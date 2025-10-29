import * as Plot from "npm:@observablehq/plot";
import {formatInteger, formatPercentDecimal, formatDecimal} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de mercado laboral y empleo por sector
 */
export function Labor({data}) {
  const labor = data.labor;
  
  // Gráfico de sectores
  const sectorChart = Plot.plot({
    width: 800,
    height: 450,
    marginLeft: 200,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    x: {
      label: "Porcentaje del empleo total",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true,
      domain: [0, 0.2]
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      scheme: "tableau10"
    },
    marks: [
      Plot.barX(labor.sectors, {
        x: "share",
        y: "sector",
        fill: "sector",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(labor.sectors, {
        x: "share",
        y: "sector",
        text: d => formatPercentDecimal(d.share * 100, 1),
        dx: 30,
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
      ">Mercado Laboral</h3>
      
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
            Fuerza Laboral
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${formatInteger(labor.labor_force)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Empleados
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #2ca02c;">
            ${formatInteger(labor.employed)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tasa de Desempleo
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #d62728;">
            ${formatPercentDecimal(labor.unemployment_rate * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tasa de Participación
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ff7f0e;">
            ${formatPercentDecimal(labor.participation_rate * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #9467bd;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Trabajo Remoto
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #9467bd;">
            ${formatPercentDecimal(labor.work_from_home * 100, 1)}
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #8c564b;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tiempo Promedio de Traslado
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #8c564b;">
            ${formatDecimal(labor.mean_commute_minutes, 1)} min
          </div>
        </div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
      ">
        <div style="
          padding: 1.25rem;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        ">
          <div style="font-size: 0.8rem; font-weight: 600; color: #14532d; margin-bottom: 0.5rem;">
            MERCADO LABORAL SALUDABLE
          </div>
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">
            ${formatPercentDecimal((1 - labor.unemployment_rate) * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: #15803d;">
            Tasa de empleo — Base sólida de consumidores con ingresos
          </div>
        </div>
        
        <div style="
          padding: 1.25rem;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        ">
          <div style="font-size: 0.8rem; font-weight: 600; color: #0c4a6e; margin-bottom: 0.5rem;">
            FUERZA LABORAL ACTIVA
          </div>
          <div style="font-size: 2rem; font-weight: 700; color: #0369a1; margin-bottom: 0.25rem;">
            ${formatPercentDecimal(labor.participation_rate * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: #075985;">
            Tasa de participación — Alta actividad económica
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Empleo por Sector Económico</h4>
      
      ${sectorChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Implicaciones para el mercado de alimentos:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li><strong>Servicios de alojamiento y alimentación (${formatPercentDecimal(labor.sectors.find(s => s.sector.includes('alojamiento'))?.share * 100 || 9.1, 1)}):</strong> 
          Población familiarizada con estándares de servicio y calidad en restaurantes.</li>
          <li><strong>Profesionales y oficinistas (${formatPercentDecimal((labor.sectors[0]?.share || 0.158) * 100, 0)}):</strong> 
          Segmento clave para almuerzos rápidos y comidas de conveniencia cerca de oficinas.</li>
          <li><strong>Tiempo de traslado promedio (${formatDecimal(labor.mean_commute_minutes, 0)} min):</strong> 
          Oportunidad para ubicaciones estratégicas en rutas de tránsito y formatos drive-through.</li>
          <li><strong>Trabajo remoto (${formatPercentDecimal(labor.work_from_home * 100, 1)}):</strong> 
          Segmento en crecimiento que come en barrios residenciales durante horas laborales.</li>
          <li><strong>Salud y educación (${formatPercentDecimal(labor.sectors[1]?.share * 100 || 18.9, 1)}):</strong> 
          Trabajadores con horarios variados, demanda para servicio en diferentes momentos del día.</li>
        </ul>
      </div>
    </div>
  `;
}

