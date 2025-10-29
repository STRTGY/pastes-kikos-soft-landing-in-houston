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
  
  // Estilo para tabs activos
  const style = html`
    <style>
      .tab-button.active {
        color: var(--theme-foreground) !important;
        border-bottom-color: #1f77b4 !important;
        background: var(--theme-background-alt) !important;
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

