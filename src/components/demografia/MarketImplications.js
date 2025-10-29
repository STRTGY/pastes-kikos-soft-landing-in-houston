import {formatPercentDecimal, formatCurrency, formatLargeNumber, formatDecimal} from "../../lib/formatters.js";
import {html} from "npm:htl";

/**
 * Componente de implicaciones de mercado para foodservice
 */
export function MarketImplications({angloData, ceData, ghpData, cpiData}) {
  const pop = angloData.population.houston_msa;
  const income = angloData.income.houston_anglo;
  const vehicles = angloData.vehicles_available.houston_anglo;
  const multiVeh = vehicles.filter(d => d.vehicles === "2 vehicles" || d.vehicles === "3+ vehicles").reduce((s, d) => s + d.share, 0);
  
  // Estimar TAM (Total Addressable Market)
  const angloHouseholds = Math.round(pop.anglo_population / 2.74); // avg household size
  const fafhSpendPerHh = ceData.annual_averages.find(d => d.year === 2023 && d.geography === "Houston MSA")?.food_away_from_home || 5060;
  const totalAngloFafhMarket = angloHouseholds * fafhSpendPerHh;
  
  // Segmentación por ingreso (usando shares nacionales como proxy)
  const highIncomeShare = income.share_100k_plus;
  const highIncomeHh = Math.round(angloHouseholds * highIncomeShare);
  const highIncomeFafhSpend = ceData.income_tercile_expenditures_us_2023.find(d => d.tercile.includes("High"))?.food_away_from_home || 7140;
  const highIncomeMarket = highIncomeHh * highIncomeFafhSpend;
  
  // Quick-service vs full-service split (nacional)
  const qsrShare = ceData.food_categories_detail.food_away_from_home_2023_us.find(d => d.category === "Limited-service meals")?.share || 0.524;
  const fsrShare = ceData.food_categories_detail.food_away_from_home_2023_us.find(d => d.category === "Full-service meals")?.share || 0.428;
  
  const angloQsrMarket = totalAngloFafhMarket * qsrShare;
  const angloFsrMarket = totalAngloFafhMarket * fsrShare;
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--theme-foreground);
      ">Implicaciones de Mercado — Foodservice Houston</h3>
      
      <div style="
        background: linear-gradient(135deg, #1f77b4 0%, #2ca02c 100%);
        color: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        <h4 style="font-size: 1.2rem; font-weight: 700; margin: 0 0 1rem 0;">
          Tamaño del Mercado Anglosajón — Houston MSA
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 0.25rem;">Hogares Anglo</div>
            <div style="font-size: 1.5rem; font-weight: 700;">${formatLargeNumber(angloHouseholds, 1)}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 0.25rem;">Mercado FAFH Total</div>
            <div style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(totalAngloFafhMarket / 1e9, 'USD', 'en-US')}B</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 0.25rem;">Segmento Alto Ingreso</div>
            <div style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(highIncomeMarket / 1e9, 'USD', 'en-US')}B</div>
          </div>
        </div>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      ">
        <div style="
          background: var(--theme-background-alt);
          border-radius: 8px;
          padding: 1.5rem;
          border-top: 4px solid #1f77b4;
        ">
          <h5 style="
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            color: #1f77b4;
          ">🎯 Segmento Objetivo Principal</h5>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; line-height: 1.7;">
            <li><strong>Hogares anglos con ingresos $75K-$150K+</strong></li>
            <li>Edad 35-64 años (pico de ingresos y gasto)</li>
            <li>Altamente educados (${formatPercentDecimal(angloData.education_25_plus.houston_anglo.bachelor_or_higher * 100, 0)} con bachelor+)</li>
            <li>Multi-vehículo (${formatPercentDecimal(multiVeh * 100, 0)} con 2+ autos)</li>
            <li>Suburban: Fort Bend, Montgomery, Katy</li>
          </ul>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 8px;
          padding: 1.5rem;
          border-top: 4px solid #2ca02c;
        ">
          <h5 style="
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            color: #2ca02c;
          ">💡 Propuesta de Valor Diferenciada</h5>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; line-height: 1.7;">
            <li><strong>Autenticidad cultural</strong> (comida mexicana artesanal, no Tex-Mex genérico)</li>
            <li><strong>Calidad superior</strong> a precio accesible ($8-$12 ticket promedio)</li>
            <li><strong>Conveniencia</strong>: drive-thru, mobile order, horarios extendidos</li>
            <li><strong>Salud percibida</strong>: ingredientes frescos, opciones balance calórico</li>
            <li>Experiencia familiar y casual</li>
          </ul>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 8px;
          padding: 1.5rem;
          border-top: 4px solid #ff7f0e;
        ">
          <h5 style="
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            color: #ff7f0e;
          ">🚗 Formato y Ubicación Óptimos</h5>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; line-height: 1.7;">
            <li><strong>Drive-thru obligatorio</strong> (alta motorización, cultura vehicular)</li>
            <li>Estacionamiento amplio (2.2 veh/hogar promedio)</li>
            <li>Corredores de alto tráfico: I-10, US-290, Grand Pkwy</li>
            <li>Proximidad a empleadores de oficina (almuerzo) y zonas residenciales (cena)</li>
            <li>Locales 1,500-2,000 sq ft con patio opcional</li>
          </ul>
        </div>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">📊 Análisis Competitivo y Posicionamiento</h4>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
      ">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--theme-foreground-faint);">
              <th style="text-align: left; padding: 0.5rem; font-weight: 700;">Competidor</th>
              <th style="text-align: left; padding: 0.5rem; font-weight: 700;">Posicionamiento</th>
              <th style="text-align: left; padding: 0.5rem; font-weight: 700;">Ventaja Pastes Kikos</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
              <td style="padding: 0.75rem;"><strong>Chipotle</strong></td>
              <td style="padding: 0.75rem;">Fast-casual, customizable, health-focused</td>
              <td style="padding: 0.75rem;">Autenticidad cultural superior, precio más accesible</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
              <td style="padding: 0.75rem;"><strong>Taco Bell</strong></td>
              <td style="padding: 0.75rem;">QSR value, late-night, Tex-Mex americanizado</td>
              <td style="padding: 0.75rem;">Calidad percibida, ingredientes frescos, diferenciación de producto</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--theme-foreground-faintest);">
              <td style="padding: 0.75rem;"><strong>Torchy's Tacos</strong></td>
              <td style="padding: 0.75rem;">Premium tacos, experiencia casual, local favorito</td>
              <td style="padding: 0.75rem;">Producto único (pastes), conveniencia drive-thru, ticket más bajo</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem;"><strong>Taquerías locales</strong></td>
              <td style="padding: 0.75rem;">Auténticas, enfoque hispano, precio bajo</td>
              <td style="padding: 0.75rem;">Ambiente más acogedor para anglos, consistencia, branding profesional</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h4 style="
        font-size: 1.1rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        color: var(--theme-foreground);
      ">⚠️ Riesgos y Consideraciones</h4>
      
      <div style="
        background: var(--theme-background-alt);
        border-radius: 6px;
        padding: 1.25rem;
        font-size: 0.875rem;
        line-height: 1.6;
      ">
        <ul style="margin: 0.5rem 0 0 1.5rem;">
          <li><strong>Inflación FAFH persistente</strong> (+${formatPercentDecimal(cpiData.yoy_percent_change.find(d => d.year === 2024)?.houston_fafh || 4.0, 1)} en 2024) — presión en costos y pricing power.</li>
          <li><strong>Competencia intensa</strong> en mercado QSR/fast-casual de Houston — necesidad de diferenciación clara.</li>
          <li><strong>Educación del consumidor anglo</strong> sobre "pastes" (producto poco conocido) — inversión en marketing y sampling.</li>
          <li><strong>Dependencia de movilidad vehicular</strong> — vulnerabilidad a shocks de gasolina; requiere localizaciones estratégicas accesibles.</li>
          <li><strong>Cambio demográfico</strong> — share anglosajona disminuyendo (${formatPercentDecimal(pop.anglo_share * 100, 1)} actual); considerar adaptación a otros segmentos a largo plazo.</li>
        </ul>
      </div>
      
      <div style="
        background: linear-gradient(135deg, #2ca02c 0%, #1f77b4 100%);
        color: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 2rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        <h4 style="font-size: 1.2rem; font-weight: 700; margin: 0 0 1rem 0;">
          ✅ Recomendaciones Estratégicas
        </h4>
        <ol style="margin: 0; padding-left: 1.5rem; font-size: 0.9rem; line-height: 1.8;">
          <li><strong>Fase 1:</strong> Pilot en Fort Bend o Montgomery (alta concentración anglo, ingresos elevados, suburbios en crecimiento).</li>
          <li><strong>Pricing:</strong> Ticket promedio $9-$11 para competir con Chipotle/Torchy's manteniendo percepción premium sobre Taco Bell.</li>
          <li><strong>Marketing:</strong> Enfoque en "authentic Mexican comfort food" con storytelling cultural; sampling en eventos locales y corporativos.</li>
          <li><strong>Producto:</strong> Menú core simple (4-6 variedades pastes) + bebidas mexicanas (aguas frescas, horchata) para diferenciación.</li>
          <li><strong>Operaciones:</strong> Drive-thru como canal primario (60-70% ventas proyectadas); mobile ordering integrado desde día 1.</li>
          <li><strong>Expansión:</strong> Red de 3-5 locales en 18-24 meses si pilot exitoso, aprovechando economías de escala en supply chain.</li>
        </ol>
      </div>
    </div>
  `;
}

