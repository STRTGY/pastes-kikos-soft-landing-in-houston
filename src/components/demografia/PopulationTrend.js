import * as Plot from "npm:@observablehq/plot";
import {formatLargeNumber, formatInteger, formatPercentDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de tendencia de población con datos históricos (1990-2022),
 * proyecciones (2023-2030), comparativas y desglose por condados
 */
export function PopulationTrend({data}) {
  // Validar datos
  if (!data || !data.population) {
    return html`<div style="padding: 2rem; color: red;">Error: Datos de población no disponibles</div>`;
  }
  
  const population = data.population;
  const series = population.series;
  const counties = population.counties;
  
  if (!series || series.length === 0) {
    return html`<div style="padding: 2rem; color: red;">Error: Serie de población vacía</div>`;
  }
  
  // Calcular métricas
  const currentPop = series.find(d => d.year === 2022).houston;
  const pop1990 = series.find(d => d.year === 1990).houston;
  const pop2030 = series.find(d => d.year === 2030).houston;
  const growth30y = ((currentPop - pop1990) / pop1990 * 100).toFixed(1);
  const projectedGrowth = ((pop2030 - currentPop) / currentPop * 100).toFixed(1);
  
  // Función para crear gráfico
  function createChart(showBenchmarks, showProjections) {
    // Filtrar datos según controles
    let filteredSeries = showProjections 
      ? series 
      : series.filter(d => d.type !== "projection");
    
    // Preparar datos para el gráfico
    let chartData;
    
    if (showBenchmarks) {
      // Mostrar índice de crecimiento (base 1990 = 100)
      const base1990 = {
        houston: series.find(d => d.year === 1990).houston,
        tx: series.find(d => d.year === 1990).tx,
        us: series.find(d => d.year === 1990).us
      };
      
      chartData = filteredSeries.flatMap(d => [
        {year: d.year, value: (d.houston / base1990.houston) * 100, region: "Houston MSA", type: d.type},
        {year: d.year, value: (d.tx / base1990.tx) * 100, region: "Texas", type: d.type},
        {year: d.year, value: (d.us / base1990.us) * 100, region: "EE.UU.", type: d.type}
      ]);
    } else {
      chartData = filteredSeries.map(d => ({year: d.year, value: d.houston, region: "Houston MSA", type: d.type}));
    }
    
    return Plot.plot({
      width: 1100,
      height: 450,
      marginLeft: 80,
      marginBottom: 60,
      style: {
        background: "transparent",
        fontSize: "12px"
      },
      x: {
        label: "Año",
        tickFormat: d => d.toString(),
        grid: true,
        domain: [1990, showProjections ? 2030 : 2023]
      },
      y: {
        label: showBenchmarks ? "Índice de Crecimiento (1990 = 100)" : "Población",
        tickFormat: d => showBenchmarks ? d.toFixed(0) : formatLargeNumber(d, 1),
        grid: true
      },
      color: {
        legend: showBenchmarks,
        domain: ["Houston MSA", "Texas", "EE.UU."],
        range: ["#1f77b4", "#ff7f0e", "#2ca02c"]
      },
      marks: [
        // Área de proyecciones
        showProjections ? Plot.ruleX([2023], {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "5,5"
        }) : null,
        
        // Líneas
        Plot.lineY(chartData, {
          x: "year",
          y: "value",
          stroke: "region",
          strokeWidth: d => d.type === "projection" ? 2 : 2.5,
          strokeDasharray: d => d.type === "projection" ? "4,4" : null,
          tip: true
        }),
        
        // Puntos en años censales
        Plot.dot(chartData.filter(d => d.type === "census"), {
          x: "year",
          y: "value",
          fill: "region",
          r: 5,
          stroke: "white",
          strokeWidth: 2
        }),
        
        // Puntos en proyecciones
        showProjections ? Plot.dot(chartData.filter(d => d.type === "projection"), {
          x: "year",
          y: "value",
          fill: "region",
          r: 3,
          opacity: 0.6,
          tip: {
            format: {
              y: d => `${formatInteger(d)} (proyección)`,
              x: d => d.toString()
            }
          }
        }) : null
      ].filter(Boolean)
    });
  }
  
  // Estado inicial
  let showBenchmarks = false;
  let showProjections = true;
  
  // Crear gráfico inicial
  const initialChart = createChart(showBenchmarks, showProjections);
  
  // Crear el contenedor principal
  const container = html`<div style="margin: 2rem 0;">
    <h3 style="
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--theme-foreground);
    ">Evolución Poblacional (1990-2030)</h3>
    
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
        border-left: 3px solid #9467bd;
      ">
        <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
          Población 1990
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #9467bd;">
          ${formatLargeNumber(pop1990, 2)}
        </div>
      </div>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1rem;
        border-left: 3px solid #1f77b4;
      ">
        <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
          Población 2022
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #1f77b4;">
          ${formatLargeNumber(currentPop, 2)}
        </div>
      </div>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1rem;
        border-left: 3px solid #2ca02c;
      ">
        <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
          Proyección 2030
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #2ca02c;">
          ${formatLargeNumber(pop2030, 2)}
        </div>
      </div>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1rem;
        border-left: 3px solid #ff7f0e;
      ">
        <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
          Crecimiento 1990-2022
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #ff7f0e;">
          +${growth30y}%
        </div>
      </div>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1rem;
        border-left: 3px solid #d62728;
      ">
        <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem;">
          Crecimiento Proyectado 2022-2030
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #d62728;">
          +${projectedGrowth}%
        </div>
      </div>
    </div>
    
    <div style="
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      align-items: center;
      padding: 1rem;
      background: var(--theme-background-alt);
      border-radius: 8px;
    ">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" id="show-benchmarks" 
          style="width: 18px; height: 18px; cursor: pointer;">
        <span style="font-size: 0.9rem; font-weight: 500;">Comparar con Texas y EE.UU.</span>
      </label>
      
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" id="show-projections" checked 
          style="width: 18px; height: 18px; cursor: pointer;">
        <span style="font-size: 0.9rem; font-weight: 500;">Mostrar proyecciones 2024-2030</span>
      </label>
    </div>
    
    <div id="benchmark-note" style="
      display: none;
      padding: 0.875rem 1rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
      font-size: 0.85rem;
      color: #1e40af;
      line-height: 1.5;
    ">
      <strong>📊 Modo comparativo:</strong> El gráfico muestra un <strong>índice de crecimiento poblacional</strong> 
      donde 1990 = 100. Esto permite comparar qué tan rápido crece Houston vs Texas y EE.UU. 
      Un valor de 210 en 2030 significa que la población creció 110% desde 1990.
    </div>
    
    <div id="population-chart">${initialChart}</div>
    
    <!-- Sección de condados -->
    <div style="margin-top: 2.5rem;">
      <h4 style="
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Desglose por Condados (2022)</h4>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 0.75rem;
      ">
        ${counties.map((county, i) => html`
          <div style="
            background: var(--theme-background-alt);
            border-radius: 6px;
            padding: 1rem;
            border-left: 3px solid ${["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22"][i]};
            transition: transform 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)';"
             onmouseout="this.style.transform='translateY(0)';">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 0.5rem;
            ">
              <div style="
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--theme-foreground);
              ">
                ${county.name}
              </div>
              <div style="
                font-size: 0.75rem;
                padding: 0.2rem 0.5rem;
                background: ${["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22"][i]}20;
                color: ${["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22"][i]};
                border-radius: 4px;
                font-weight: 600;
              ">
                ${formatPercentDecimal(county.share * 100, 1)}
              </div>
            </div>
            
            <div style="
              font-size: 1.4rem;
              font-weight: 700;
              color: ${["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22"][i]};
              margin-bottom: 0.5rem;
            ">
              ${formatInteger(county.population_2022)}
            </div>
            
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.5rem;
              font-size: 0.75rem;
              color: var(--theme-foreground-muted);
            ">
              <div>
                <div>Edad mediana:</div>
                <div style="font-weight: 600; color: var(--theme-foreground);">${county.median_age.toFixed(1)} años</div>
              </div>
              <div>
                <div>Ingreso mediano:</div>
                <div style="font-weight: 600; color: var(--theme-foreground);">$${(county.median_income / 1000).toFixed(0)}K</div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div>Nacidos en el extranjero:</div>
                <div style="font-weight: 600; color: var(--theme-foreground);">${formatPercentDecimal(county.foreign_born * 100, 1)}</div>
              </div>
            </div>
          </div>
        `)}
      </div>
    </div>
    
    <!-- Notas metodológicas -->
    <div style="
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--theme-background-alt);
      border-radius: 6px;
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--theme-foreground-muted);
    ">
      <strong>Notas metodológicas:</strong>
      <ul style="margin: 0.5rem 0 0 1.5rem;">
        <li><strong>Años censales (1990, 2000, 2010, 2020):</strong> Datos del Censo Decenal (conteo completo).</li>
        <li><strong>Datos históricos (1991-2022):</strong> Estimaciones anuales del Census Bureau basadas en ACS y componentes demográficos.</li>
        <li><strong>Proyecciones (2024-2030):</strong> Modelos basados en tendencias de crecimiento natural y migración neta observada (2015-2022).</li>
        <li><strong>Componentes del crecimiento (promedio anual):</strong> Crecimiento natural: ${formatInteger(population.natural_increase)} personas | 
        Migración neta: ${formatInteger(population.net_migration)} personas (${formatInteger(population.international_migration)} internacional + 
        ${formatInteger(population.domestic_migration)} doméstica).</li>
        <li><strong>Condados:</strong> Houston MSA incluye 9 condados. Harris County representa ${formatPercentDecimal(counties[0].share * 100, 0)} del total.</li>
      </ul>
    </div>
  </div>`;
  
  // Agregar event listeners después de que el contenedor se monte
  requestAnimationFrame(() => {
    const benchmarksCheckbox = container.querySelector("#show-benchmarks");
    const projectionsCheckbox = container.querySelector("#show-projections");
    const chartDiv = container.querySelector("#population-chart");
    const benchmarkNote = container.querySelector("#benchmark-note");
    
    if (benchmarksCheckbox && projectionsCheckbox && chartDiv && benchmarkNote) {
      benchmarksCheckbox.addEventListener("change", (e) => {
        showBenchmarks = e.target.checked;
        const newChart = createChart(showBenchmarks, showProjections);
        chartDiv.innerHTML = "";
        chartDiv.appendChild(newChart);
        // Mostrar/ocultar nota explicativa
        benchmarkNote.style.display = showBenchmarks ? "block" : "none";
      });
      
      projectionsCheckbox.addEventListener("change", (e) => {
        showProjections = e.target.checked;
        const newChart = createChart(showBenchmarks, showProjections);
        chartDiv.innerHTML = "";
        chartDiv.appendChild(newChart);
      });
    }
  });
  
  return container;
}
