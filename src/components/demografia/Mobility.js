import * as Plot from "npm:@observablehq/plot";
import {formatPercentDecimal, formatDecimal} from "../../lib/formatters.js";
import {QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de movilidad residencial y migración
 */
export function Mobility({data}) {
  const mobility = data.mobility;
  
  // Datos para gráfico de movilidad
  const mobilityData = [
    {category: "Misma residencia (1 año)", share: mobility.same_house_1yr_ago},
    {category: "Mudanza dentro del condado", share: mobility.moved_within_county},
    {category: "Mudanza desde otro condado (TX)", share: mobility.moved_from_different_county_same_state},
    {category: "Mudanza desde otro estado", share: mobility.moved_from_different_state},
    {category: "Mudanza desde el extranjero", share: mobility.moved_from_abroad}
  ];
  
  const chart = Plot.plot({
    width: 800,
    height: 400,
    marginLeft: 200,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    x: {
      label: "Porcentaje de población",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true
    },
    y: {
      label: null
    },
    color: {
      type: "ordinal",
      scheme: "spectral"
    },
    marks: [
      Plot.barX(mobilityData, {
        x: "share",
        y: "category",
        fill: "category",
        sort: {y: "-x"},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(mobilityData, {
        x: "share",
        y: "category",
        text: d => formatPercentDecimal(d.share * 100, 1),
        dx: 40,
        textAnchor: "start",
        fill: "currentColor"
      })
    ]
  });
  
  // Tasas de migración neta
  const netDomestic = mobility.net_domestic_migration_rate * 100;
  const netInternational = mobility.net_international_migration_rate * 100;
  const netTotal = netDomestic + netInternational;
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Movilidad Residencial y Migración</h3>
      
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
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Población Estable
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #2ca02c;">
            ${formatPercentDecimal(mobility.same_house_1yr_ago * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            misma casa hace 1 año
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Movilidad Total
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ff7f0e;">
            ${formatPercentDecimal((1 - mobility.same_house_1yr_ago) * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            se mudó en el último año
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #1f77b4;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Migración Doméstica Neta
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1f77b4;">
            ${netDomestic >= 0 ? '+' : ''}${formatDecimal(netDomestic, 2)}%
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            tasa anual
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #d62728;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Migración Internacional Neta
          </div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #d62728;">
            ${netInternational >= 0 ? '+' : ''}${formatDecimal(netInternational, 2)}%
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted);">
            tasa anual
          </div>
        </div>
      </div>
      
      <div style="
        padding: 1.25rem;
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        border-radius: 8px;
        border-left: 4px solid #22c55e;
        margin-bottom: 2rem;
      ">
        <div style="font-size: 0.85rem; font-weight: 600; color: #14532d; margin-bottom: 0.5rem;">
          CRECIMIENTO POR MIGRACIÓN
        </div>
        <div style="font-size: 2.5rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">
          ${netTotal >= 0 ? '+' : ''}${formatDecimal(netTotal, 2)}%
        </div>
        <div style="font-size: 0.85rem; color: #15803d; line-height: 1.4;">
          Tasa de migración neta total anual — Houston sigue atrayendo residentes
          tanto de otros estados como del extranjero, impulsando el crecimiento demográfico.
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Patrón de Movilidad Residencial (Último Año)</h4>
      
      ${chart}
      
      <div style="
        margin-top: 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      ">
        <div style="
          padding: 1rem;
          background: var(--theme-background-alt);
          border-radius: 6px;
          border-left: 3px solid #1f77b4;
        ">
          <h5 style="
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--theme-foreground);
          ">Movilidad Local</h5>
          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--theme-foreground-muted);">
            <strong>${formatPercentDecimal(mobility.moved_within_county * 100, 1)}</strong> de la población
            se mudó dentro del mismo condado en el último año, indicando reconfiguración
            interna y oportunidades para captar clientes en nuevas ubicaciones dentro del MSA.
          </div>
        </div>
        
        <div style="
          padding: 1rem;
          background: var(--theme-background-alt);
          border-radius: 6px;
          border-left: 3px solid #d62728;
        ">
          <h5 style="
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--theme-foreground);
          ">Llegadas de Fuera</h5>
          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--theme-foreground-muted);">
            <strong>${formatPercentDecimal((mobility.moved_from_different_county_same_state + mobility.moved_from_different_state + mobility.moved_from_abroad) * 100, 1)}</strong>
            son recién llegados de otros lugares de Texas, otros estados o países,
            trayendo nuevas preferencias culinarias y abiertos a explorar opciones locales.
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
        <strong>Implicaciones estratégicas:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li><strong>Base estable (${formatPercentDecimal(mobility.same_house_1yr_ago * 100, 0)}):</strong> 
          Mayoría de residentes permanecen, favoreciendo inversión en lealtad y presencia local continua.</li>
          <li><strong>Flujo migratorio positivo:</strong> Atracción constante de nuevos residentes 
          (${formatPercentDecimal((mobility.moved_from_abroad + mobility.moved_from_different_state) * 100, 1)} del extranjero/otros estados)
          genera demanda en expansión y oportunidad para introducir marca a nuevos consumidores.</li>
          <li><strong>Migración internacional (${formatPercentDecimal(mobility.moved_from_abroad * 100, 1)}):</strong> 
          Ingreso continuo de población hispana y asiática refuerza la demanda por sabores auténticos y diversos.</li>
          <li><strong>Reubicación interna:</strong> Movilidad dentro del condado sugiere que consumidores 
          pueden cambiar de ubicación pero permanecer en el mercado — importancia de múltiples puntos de venta.</li>
        </ul>
      </div>
    </div>
  `;
}

