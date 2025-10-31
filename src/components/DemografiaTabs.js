import {html} from "npm:htl";
import {KpiHeader} from "./demografia/KpiHeader.js";
import {PopulationTrend} from "./demografia/PopulationTrend.js";
import {CountiesComparison} from "./demografia/CountiesComparison.js";
import {AgePyramid} from "./demografia/AgePyramid.js";
import {Households} from "./demografia/Households.js";
import {Income} from "./demografia/Income.js";
import {Education} from "./demografia/Education.js";
import {DiversityLanguage} from "./demografia/DiversityLanguage.js";
import {Housing} from "./demografia/Housing.js";
import {Labor} from "./demografia/Labor.js";
import {Mobility} from "./demografia/Mobility.js";
import {AngloProfile} from "./demografia/AngloProfile.js";
import {ConsumptionSpending} from "./demografia/ConsumptionSpending.js";
import {FoodInflation} from "./demografia/FoodInflation.js";
import {VehicleMobility} from "./demografia/VehicleMobility.js";
import {MarketImplications} from "./demografia/MarketImplications.js";

/**
 * Componente principal de demografía con navegación por pestañas
 */
export function DemografiaTabs({data, angloData, ceData, ersData, cpiData, ghpData}) {
  const tabs = [
    {id: "implicaciones", label: "Implicaciones", icon: "💡", source: "Análisis integrado"},
    {id: "poblacion", label: "Población", icon: "👥", source: "US Census Bureau ACS"},
    {id: "edad", label: "Edad", icon: "📊", source: "US Census Bureau ACS"},
    {id: "hogares", label: "Hogares", icon: "🏠", source: "US Census Bureau ACS"},
    {id: "ingresos", label: "Ingresos", icon: "💰", source: "US Census Bureau ACS"},
    {id: "educacion", label: "Educación", icon: "🎓", source: "US Census Bureau ACS"},
    {id: "diversidad", label: "Diversidad", icon: "🌎", source: "US Census Bureau ACS"},
    {id: "vivienda", label: "Vivienda", icon: "🏘️", source: "US Census Bureau ACS"},
    {id: "empleo", label: "Empleo", icon: "💼", source: "US Census Bureau ACS / BLS"},
    {id: "movilidad", label: "Movilidad", icon: "🚚", source: "US Census Bureau ACS"},
    {id: "anglo_profile", label: "Perfil Anglo", icon: "👤", source: "US Census Bureau ACS"},
    {id: "consumo", label: "Consumo", icon: "🍽️", source: "BLS CE / USDA ERS"},
    {id: "inflacion", label: "Inflación", icon: "📈", source: "BLS CPI"},
    {id: "vehiculos", label: "Vehículos", icon: "🚗", source: "US Census Bureau ACS / GHP"}
  ];
  
  const container = html`<div id="demografia-container"></div>`;
  
  // Estado inicial
  let currentTab = "implicaciones";
  let showSourcesPanel = false;
  
  function renderContent() {
    const contentDiv = container.querySelector("#demografia-content");
    if (!contentDiv) return;
    
    // Limpiar contenido previo
    contentDiv.innerHTML = "";
    
    // Renderizar componente según tab activo
    let component;
    switch(currentTab) {
      case "poblacion":
        try {
          component = html`
            <div>
              ${PopulationTrend({data})}
              ${CountiesComparison({data})}
            </div>
          `;
        } catch (error) {
          console.error("Error rendering population tab:", error);
          component = html`<div style="padding: 2rem; color: red;">Error al renderizar datos de población: ${error.message}</div>`;
        }
        break;
      case "edad":
        component = AgePyramid({data});
        break;
      case "hogares":
        component = Households({data});
        break;
      case "ingresos":
        component = Income({data});
        break;
      case "educacion":
        component = Education({data, angloData});
        break;
      case "diversidad":
        component = DiversityLanguage({data});
        break;
      case "vivienda":
        component = Housing({data});
        break;
      case "empleo":
        component = Labor({data});
        break;
      case "movilidad":
        component = Mobility({data});
        break;
      case "anglo_profile":
        component = angloData ? AngloProfile({angloData}) : html`<div>Cargando datos...</div>`;
        break;
      case "consumo":
        component = (ceData && ersData) ? ConsumptionSpending({ceData, ersData}) : html`<div>Cargando datos...</div>`;
        break;
      case "inflacion":
        component = cpiData ? FoodInflation({cpiData}) : html`<div>Cargando datos...</div>`;
        break;
      case "vehiculos":
        component = (angloData && ghpData) ? VehicleMobility({angloData, ghpData}) : html`<div>Cargando datos...</div>`;
        break;
      case "implicaciones":
        component = (angloData && ceData && ghpData && cpiData) ? MarketImplications({angloData, ceData, ghpData, cpiData}) : html`<div>Cargando datos...</div>`;
        break;
      default:
        component = html`<div>Contenido no disponible</div>`;
    }
    
    contentDiv.appendChild(component);
  }
  
  function updateTabs() {
    const tabButtons = container.querySelectorAll(".tab-button");
    tabButtons.forEach(btn => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId === currentTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    renderContent();
  }
  
  function toggleSourcesPanel() {
    showSourcesPanel = !showSourcesPanel;
    const panel = container.querySelector("#sources-panel");
    const toggleBtn = container.querySelector("#sources-toggle-btn");
    
    if (panel && toggleBtn) {
      if (showSourcesPanel) {
        panel.style.display = "block";
        toggleBtn.innerHTML = `<span style="margin-right: 0.4rem;">📚</span> Ocultar fuentes`;
      } else {
        panel.style.display = "none";
        toggleBtn.innerHTML = `<span style="margin-right: 0.4rem;">📚</span> Ver fuentes de datos`;
      }
    }
  }
  
  // Construir UI inmediatamente
  container.innerHTML = "";
  
  // Header con KPIs y badge de fuentes verificadas
  const headerSection = html`
    <div>
      ${KpiHeader({data})}
      <div style="
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: -1rem;
        margin-bottom: 1rem;
        gap: 0.5rem;
      ">
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #075985;
        ">
          <span style="font-size: 0.9rem;">✓</span>
          <span>Fuentes Oficiales Verificadas</span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(headerSection);
  
  // Tabs navigation
  const tabsNav = html`
    <div style="
      border-bottom: 2px solid var(--theme-foreground-faintest);
      margin: 2rem 0 1rem 0;
      overflow-x: auto;
      white-space: nowrap;
    ">
      <div style="display: inline-flex; gap: 0.25rem; padding-bottom: 0;">
        ${tabs.map(tab => {
          const button = html`
            <button
              class="tab-button"
              data-tab="${tab.id}"
              title="Fuente: ${tab.source}"
              style="
                background: transparent;
                border: none;
                padding: 0.75rem 1.25rem;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--theme-foreground-muted);
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
                white-space: nowrap;
                position: relative;
              "
              onmouseover="this.style.color = 'var(--theme-foreground)'; this.style.background = 'var(--theme-background-alt)';"
              onmouseout="if(!this.classList.contains('active')) { this.style.color = 'var(--theme-foreground-muted)'; this.style.background = 'transparent'; }"
            >
              <span style="margin-right: 0.4rem;">${tab.icon}</span>
              ${tab.label}
            </button>
          `;
          
          button.addEventListener("click", () => {
            currentTab = tab.id;
            updateTabs();
          });
          
          return button;
        })}
      </div>
    </div>
  `;
  
  container.appendChild(tabsNav);
  
  // Content area
  const contentArea = html`<div id="demografia-content" style="min-height: 400px;"></div>`;
  container.appendChild(contentArea);
  
  // Botón para mostrar/ocultar panel de fuentes
  const sourcesToggleBtn = html`
    <button
      id="sources-toggle-btn"
      style="
        display: block;
        margin: 2rem auto 1rem auto;
        padding: 0.75rem 1.5rem;
        background: var(--theme-background-alt);
        border: 2px solid var(--theme-foreground-faintest);
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--theme-foreground);
        transition: all 0.2s;
      "
      onmouseover="this.style.borderColor = '#0ea5e9'; this.style.background = '#f0f9ff';"
      onmouseout="this.style.borderColor = 'var(--theme-foreground-faintest)'; this.style.background = 'var(--theme-background-alt)';"
    >
      <span style="margin-right: 0.4rem;">📚</span> Ver fuentes de datos
    </button>
  `;
  
  sourcesToggleBtn.addEventListener("click", toggleSourcesPanel);
  container.appendChild(sourcesToggleBtn);
  
  // Panel de fuentes (inicialmente oculto)
  const sourcesPanel = html`
    <div id="sources-panel" style="
      display: none;
      margin: 1.5rem 0 2rem 0;
      padding: 1.5rem;
      background: var(--theme-background-alt);
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      animation: slideDown 0.3s ease-out;
    ">
      <h4 style="
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: var(--theme-foreground);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      ">
        <span style="font-size: 1.3rem;">✓</span>
        Fuentes de Datos Verificadas
      </h4>
      
      <div style="font-size: 0.875rem; line-height: 1.7; color: var(--theme-foreground);">
        <p style="margin: 0 0 1rem 0;">
          Todos los datos presentados en esta sección provienen de <strong>fuentes oficiales del gobierno federal de los Estados Unidos</strong> 
          y organizaciones institucionales reconocidas. Los datos son verificables y cuentan con metodología transparente.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
          <div style="
            background: white;
            padding: 1rem;
            border-radius: 6px;
            border-left: 4px solid #1f77b4;
          ">
            <h5 style="font-weight: 700; margin: 0 0 0.5rem 0; color: #1f77b4;">
              US Census Bureau
            </h5>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">
              <strong>American Community Survey (ACS)</strong><br/>
              2022 5-year estimates (2018-2022)
            </p>
            <p style="margin: 0; font-size: 0.75rem; color: var(--theme-foreground-muted);">
              Tablas: DP05, S1901, S2301, S0101, S0801, B01003, DP02, DP03, S1501, S0601, B16001, S2502, S2503, S0701
            </p>
            <a href="https://data.census.gov/profile?g=310M200US26420" target="_blank" 
               style="font-size: 0.75rem; color: #0ea5e9; text-decoration: none; display: inline-block; margin-top: 0.5rem;">
              → data.census.gov
            </a>
          </div>
          
          <div style="
            background: white;
            padding: 1rem;
            border-radius: 6px;
            border-left: 4px solid #ff7f0e;
          ">
            <h5 style="font-weight: 700; margin: 0 0 0.5rem 0; color: #ff7f0e;">
              Bureau of Labor Statistics
            </h5>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">
              <strong>Consumer Expenditure Survey (CE)</strong><br/>
              2022-2023 annual averages
            </p>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">
              <strong>Consumer Price Index (CPI)</strong><br/>
              2018-2025, base 1982-84 = 100
            </p>
            <a href="https://www.bls.gov/regions/southwest/" target="_blank" 
               style="font-size: 0.75rem; color: #0ea5e9; text-decoration: none; display: inline-block; margin-top: 0.5rem;">
              → bls.gov
            </a>
          </div>
          
          <div style="
            background: white;
            padding: 1rem;
            border-radius: 6px;
            border-left: 4px solid #2ca02c;
          ">
            <h5 style="font-weight: 700; margin: 0 0 0.5rem 0; color: #2ca02c;">
              USDA Economic Research Service
            </h5>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">
              <strong>Food Expenditure Series (FES)</strong><br/>
              Tendencias históricas 1997-2024
            </p>
            <p style="margin: 0; font-size: 0.75rem; color: var(--theme-foreground-muted);">
              Share de gasto FAH vs FAFH por demografía
            </p>
            <a href="https://www.ers.usda.gov/data-products/food-expenditure-series/" target="_blank" 
               style="font-size: 0.75rem; color: #0ea5e9; text-decoration: none; display: inline-block; margin-top: 0.5rem;">
              → ers.usda.gov
            </a>
          </div>
          
          <div style="
            background: white;
            padding: 1rem;
            border-radius: 6px;
            border-left: 4px solid #9467bd;
          ">
            <h5 style="font-weight: 700; margin: 0 0 0.5rem 0; color: #9467bd;">
              Greater Houston Partnership
            </h5>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem;">
              <strong>Houston Facts</strong><br/>
              Contexto económico y demográfico
            </p>
            <p style="margin: 0; font-size: 0.75rem; color: var(--theme-foreground-muted);">
              Organización comercial oficial del MSA
            </p>
            <a href="https://www.houston.org/houston-data" target="_blank" 
               style="font-size: 0.75rem; color: #0ea5e9; text-decoration: none; display: inline-block; margin-top: 0.5rem;">
              → houston.org
            </a>
          </div>
        </div>
        
        <div style="
          margin-top: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 6px;
          border-left: 4px solid #0ea5e9;
        ">
          <p style="margin: 0; font-size: 0.8rem; font-weight: 600; color: #075985;">
            <span style="margin-right: 0.5rem;">ℹ️</span>
            Nota sobre "Perfil Anglo"
          </p>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #0c4a6e;">
            La categoría "Anglo" o "Anglosajón" se refiere al grupo demográfico del Census Bureau clasificado como 
            <strong>"White alone, non-Hispanic"</strong>. Esta es una clasificación estándar de la 
            Office of Management and Budget (OMB) utilizada en todos los datos censales de EE.UU.
          </p>
        </div>
        
        <p style="margin: 1.5rem 0 0 0; font-size: 0.75rem; color: var(--theme-foreground-muted); text-align: center;">
          <strong>Última actualización:</strong> 29 de octubre de 2024
        </p>
      </div>
    </div>
  `;
  
  container.appendChild(sourcesPanel);
  
  // Estilo para tabs activos y animaciones
  const style = html`
    <style>
      .tab-button.active {
        color: var(--theme-foreground) !important;
        border-bottom-color: #1f77b4 !important;
        background: var(--theme-background-alt) !important;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #sources-panel a:hover {
        color: #0284c7 !important;
        text-decoration: underline;
      }
    </style>
  `;
  container.appendChild(style);
  
  // Renderizar contenido inicial usando requestAnimationFrame para asegurar que el DOM esté listo
  requestAnimationFrame(() => {
    updateTabs();
  });
  
  return container;
}

