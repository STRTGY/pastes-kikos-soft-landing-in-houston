import * as Plot from "npm:@observablehq/plot";
import {formatLargeNumber, formatAge, formatCurrency, formatPercentDecimal, formatChange} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de encabezado con KPIs principales de demografía
 */
export function KpiHeader({data}) {
  const kpis = data.kpis;
  
  // Calcular crecimiento desde 1990
  const pop1990 = data.population.series.find(d => d.year === 1990)?.houston || 3731000;
  const pop2030 = data.population.series.find(d => d.year === 2030)?.houston || 7826000;
  const growth1990 = ((kpis.population - pop1990) / pop1990);
  const growthTo2030 = ((pop2030 - kpis.population) / kpis.population);
  
  const cards = [
    {
      title: "Población Total (2022)",
      value: formatLargeNumber(kpis.population, 2),
      subtitle: `${formatChange(growth1990)} desde 1990 | ${formatChange(growthTo2030)} proyectado a 2030`,
      color: "#1f77b4"
    },
    {
      title: "Edad Mediana",
      value: formatAge(kpis.median_age),
      subtitle: "Población joven y dinámica",
      color: "#ff7f0e"
    },
    {
      title: "Ingreso Mediano",
      value: formatCurrency(kpis.median_hh_income, 'USD', 'en-US'),
      subtitle: "Por hogar anual",
      color: "#2ca02c"
    },
    {
      title: "Nacidos en el Extranjero",
      value: formatPercentDecimal(kpis.foreign_born_share * 100, 1),
      subtitle: "Diversidad cultural alta",
      color: "#d62728"
    },
    {
      title: "Tasa de Desempleo",
      value: formatPercentDecimal(kpis.unemployment_rate * 100, 1),
      subtitle: "Mercado laboral activo",
      color: "#9467bd"
    }
  ];
  
  return html`
    <div style="margin: 2rem 0;">
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      ">
        ${cards.map(card => html`
          <div style="
            background: var(--theme-background-alt);
            border: 1px solid var(--theme-foreground-faintest);
            border-radius: 8px;
            padding: 1.25rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)';">
            <div style="
              font-size: 0.8rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--theme-foreground-muted);
              margin-bottom: 0.5rem;
            ">${card.title}</div>
            <div style="
              font-size: 1.75rem;
              font-weight: 700;
              color: ${card.color};
              margin-bottom: 0.25rem;
              line-height: 1.2;
            ">${card.value}</div>
            <div style="
              font-size: 0.75rem;
              color: var(--theme-foreground-muted);
              font-style: italic;
            ">${card.subtitle}</div>
          </div>
        `)}
      </div>
      
      <div style="
        background: var(--theme-background-alt);
        border-left: 4px solid #1f77b4;
        padding: 1rem 1.25rem;
        margin-top: 1.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        color: var(--theme-foreground-muted);
      ">
        <strong>Área Metropolitana:</strong> ${data.meta.name} (MSA ${data.meta.msa})<br>
        <strong>Última actualización:</strong> ${data.meta.updated}<br>
        <strong>Fuentes:</strong> ${data.meta.sources.join('; ')}
      </div>
    </div>
  `;
}

