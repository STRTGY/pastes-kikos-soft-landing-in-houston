import * as Plot from "npm:@observablehq/plot";
import {formatPercentDecimal, formatDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de movilidad y acceso vehicular
 */
export function VehicleMobility({angloData, ghpData}) {
  const vehicles = angloData.vehicles_available;
  const employment = angloData.employment;
  const commute = angloData.commute_time_anglo_houston;
  
  // Comparación de vehículos disponibles
  const vehData = [
    ...vehicles.houston_anglo.map(d => ({...d, geography: "Houston Anglo"})),
    ...vehicles.houston_total.map(d => ({...d, geography: "Houston Total"})),
    ...vehicles.us_anglo.map(d => ({...d, geography: "US Anglo"}))
  ];
  
  const vehChart = Plot.plot({
    width: 800,
    height: 350,
    marginLeft: 120,
    marginBottom: 60,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Disponibilidad de vehículos por hogar en la comunidad anglosajona de Houston, comparada con el total del MSA y Estados Unidos",
    x: {
      label: "Proporción de hogares",
      tickFormat: d => `${(d * 100).toFixed(0)}%`,
      grid: true
    },
    y: {
      label: null
    },
    color: {
      legend: true,
      domain: ["None", "1 vehicle", "2 vehicles", "3+ vehicles"],
      range: ["#d62728", "#ff7f0e", "#2ca02c", "#1f77b4"]
    },
    facet: {
      data: vehData,
      y: "geography",
      marginLeft: 120
    },
    marks: [
      Plot.barX(vehData, {
        x: "share",
        y: "vehicles",
        fill: "vehicles",
        sort: {y: null},
        tip: {
          format: {
            x: d => formatPercentDecimal(d * 100, 1)
          }
        }
      }),
      Plot.text(vehData, {
        x: "share",
        y: "vehicles",
        text: d => formatPercentDecimal(d.share * 100, 0),
        dx: 25,
        textAnchor: "start",
        fill: "currentColor",
        fontSize: 9
      })
    ]
  });
  
  // Tiempo de commute
  const commuteChart = Plot.plot({
    width: 700,
    height: 300,
    marginLeft: 100,
    marginBottom: 50,
    style: {
      background: "transparent",
      fontSize: "11px"
    },
    ariaLabel: "Distribución de tiempos de viaje al trabajo (commute) en la comunidad anglosajona de Houston",
    x: {
      label: "Proporción",
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
      Plot.barX(commute, {
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
      Plot.text(commute, {
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
  
  // Calcular métricas clave
  const multiVehicleShareAnglo = vehicles.houston_anglo.filter(d => d.vehicles === "2 vehicles" || d.vehicles === "3+ vehicles").reduce((sum, d) => sum + d.share, 0);
  const multiVehicleShareTotal = vehicles.houston_total.filter(d => d.vehicles === "2 vehicles" || d.vehicles === "3+ vehicles").reduce((sum, d) => sum + d.share, 0);
  const longCommuteShare = commute.filter(d => d.range === "45-59 min" || d.range === "60+ min").reduce((sum, d) => sum + d.share, 0);
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Movilidad y Acceso Vehicular</h3>
      
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
            Hogares Anglo con 2+ Vehículos
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #1f77b4;">
            ${formatPercentDecimal(multiVehicleShareAnglo * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatPercentDecimal(multiVehicleShareTotal * 100, 1)} total MSA
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #2ca02c;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Vehículos por Hogar (MSA)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #2ca02c;">
            ${formatDecimal(ghpData.transportation_infrastructure.vehicles_per_household, 2)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            ${formatLargeNumber(ghpData.transportation_infrastructure.registered_vehicles_2024, 2)} registrados
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Tiempo Promedio de Commute (Anglo)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #ff7f0e;">
            ${formatDecimal(employment.mean_commute_minutes, 1)} min
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatDecimal(ghpData.transportation_infrastructure.mean_commute_time_minutes, 1)} min MSA
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 6px;
          padding: 1.25rem;
          border-left: 3px solid #9467bd;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
            Trabajo Remoto (Anglo)
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #9467bd;">
            ${formatPercentDecimal(employment.work_from_home_share * 100, 1)}
          </div>
          <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); margin-top: 0.25rem;">
            vs ${formatPercentDecimal(ghpData.transportation_infrastructure.work_from_home_share * 100, 1)} MSA
          </div>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Disponibilidad de Vehículos por Hogar — Comparativa</h4>
      
      ${vehChart}
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Distribución de Tiempos de Commute — Anglo Houston</h4>
      
      ${commuteChart}
      
      <div style="
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--theme-background-alt);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--theme-foreground-muted);
      ">
        <strong>Implicaciones para ubicación y formato:</strong>
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li>Alta motorización: <strong>${formatPercentDecimal(multiVehicleShareAnglo * 100, 1)}</strong> de hogares anglos tienen 2+ vehículos, favoreciendo formatos con drive-thru y estacionamiento amplio.</li>
          <li>Solo <strong>${formatPercentDecimal(vehicles.houston_anglo.find(d => d.vehicles === "None")?.share * 100 || 2.4, 1)}</strong> sin vehículo — dependencia extrema del automóvil en Houston MSA.</li>
          <li>Tiempo promedio de commute de <strong>${formatDecimal(employment.mean_commute_minutes, 1)} min</strong> crea ventanas de oportunidad para desayuno/almuerzo cerca de corredores laborales y cena cerca de áreas residenciales.</li>
          <li><strong>${formatPercentDecimal(longCommuteShare * 100, 1)}</strong> con commute >45 min priorizan conveniencia (drive-thru, grab-and-go) y ubicaciones en ruta.</li>
          <li>El <strong>${formatPercentDecimal(employment.work_from_home_share * 100, 1)}</strong> de trabajo remoto (superior al promedio MSA) genera demanda en horarios flexibles y zonas residenciales durante el día.</li>
          <li>Localizaciones ideales: proximidad a grandes empleadores, intersecciones de alta capacidad vehicular, suburbios con alta densidad de población anglo (Montgomery, Fort Bend).</li>
        </ul>
      </div>
    </div>
  `;
}

function formatLargeNumber(num, decimals = 0) {
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toString();
}

