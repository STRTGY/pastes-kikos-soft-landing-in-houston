# Estrategia de Plaza - Page Preview

## 📍 URL
`http://127.0.0.1:3000/pages/industria/plaza`

---

## 🎯 Page Structure Overview

```
┌─────────────────────────────────────────────────────────┐
│ 2.4 ESTRATEGIA DE PLAZA                                 │
│ Análisis de Ubicación Estratégica para Soft Landing     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RESUMEN EJECUTIVO                                       │
├─────────────────────────────────────────────────────────┤
│ Introducción contextual + objetivos                     │
└─────────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────┐
│ 📍 Zonas  │ 🍽️ Rest.  │ 🚗 Drive  │ 🛣️ AADT   │
│ Analizad. │ en Target │ thru %    │ Promedio  │
│   [N]     │   [N]     │  [%]      │  [35K]    │
└───────────┴───────────┴───────────┴───────────┘

┌─────────────────────────────────────────────────────────┐
│ MAPA ESTRATÉGICO INTERACTIVO                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [MULTI-LAYER MAPBOX MAP - 650px height]                │
│                                                          │
│  Layers Available:                                       │
│  ☑ Zonas de Interés (Clusters)                          │
│  ☑ Demografía (% Población Blanca)                      │
│  ☑ Carreteras Principales                               │
│  ☑ Restaurantes (Drive-thru)                            │
│  ☑ Densidad Drive-thru (Heatmap)                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
💡 Tip: Usa controles de capas para activar/desactivar

═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ 1. PLANTA DE PRODUCCIÓN CENTRAL                         │
└─────────────────────────────────────────────────────────┘

Objetivo: Hub de producción con distribución <30 min

┌──────────────┬──────────────┬──────────────┐
│ 🛣️ Accesib.  │ 📈 Escalab.  │ 💰 Costo     │
│              │              │              │
│ • Autopistas │ • Expansión  │ • $6-10/sqft │
│ • <30 min    │ • TX Triangle│ • Incentivos │
│ • 25 mi      │ • 5-10k sqft │ • Zoning     │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────┐
│ SCORING DE ZONAS CANDIDATAS                             │
├─────────────────────────────────────────────────────────┤
│ Zona                    │ Hwy │ Dist│ Supp│ Util│ Cost│ ∑ │
│                         │ 30% │ 25% │ 20% │ 15% │ 10% │   │
├─────────────────────────┼─────┼─────┼─────┼─────┼─────┼───┤
│ 🏆 Northwest Houston    │ 9.0 │ 8.5 │ 8.0 │ 9.0 │ 7.0 │8.35│
│    (Spring Branch)      │ ✅  │ ✅  │ ✅  │ ✅  │ ✅  │🟢 │
├─────────────────────────┼─────┼─────┼─────┼─────┼─────┼───┤
│    East Houston         │ 7.5 │ 6.0 │ 7.0 │ 8.0 │ 9.5 │7.65│
│    (Channelview)        │ ✅  │ 🟡  │ ✅  │ ✅  │ ✅  │🟢 │
├─────────────────────────┼─────┼─────┼─────┼─────┼─────┼───┤
│    Southwest Houston    │ 8.0 │ 7.5 │ 6.5 │ 8.5 │ 8.0 │7.60│
│    (Missouri City)      │ ✅  │ ✅  │ ✅  │ ✅  │ ✅  │🟢 │
└─────────────────────────┴─────┴─────┴─────┴─────┴─────┴───┘
Escala: 🟢 8-10 | 🟡 6-7.9 | 🟠 4-5.9 | 🔴 0-3.9

┌─────────────────────────────────────────────────────────┐
│ 🏆 NORTHWEST HOUSTON — ZONA PRIORITARIA                 │
├─────────────────────────────────────────────────────────┤
│ Ventajas Clave:              │ Consideraciones:         │
│ ✅ Acceso I-10 W y US-290    │ ⚠️ Tráfico horas pico    │
│ ✅ Parques industriales      │ 💡 Lease largo plazo     │
│ ✅ Ruta Austin/San Antonio   │ 💡 Verificar FDA zoning  │
│ ✅ Centralidad metropolitana │                          │
└──────────────────────────────┴──────────────────────────┘

═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ 2. PRIMERA TIENDA (DRIVE-THROUGH)                       │
└─────────────────────────────────────────────────────────┘

Modelo: Drive-Through QSR

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🚗 85%+      │ ⚡ Grab-n-Go │ 🌡️ Clima     │ 💵 Menor     │
│ Desplaz.     │ Cultura      │ Extremo      │ Inversión    │
│ en Auto      │ Consolidada  │ >95°F        │ vs. Local    │
└──────────────┴──────────────┴──────────────┴──────────────┘

Criterios de Selección:
A. Tráfico: AADT >20k, visibilidad, accesibilidad
B. Demografía: ≥40% blanca, $50-100k ingreso
C. Generadores: Oficinas, retail, educación, hospitales
D. Competencia: Evitar saturación, buscar gaps
E. Espacio: 15-25k sqft lote, 1.2-1.8k sqft edificio

┌─────────────────────────────────────────────────────────┐
│ SCORING DE MICROZONAS PRIORITARIAS                      │
├─────────────────────────────────────────────────────────┤
│ Zona             │Trfc│Demo│Gen │Comp│Rent│  ∑  │
│                  │25% │25% │20% │15% │15% │     │
├──────────────────┼────┼────┼────┼────┼────┼─────┤
│🏆 Energy Corridor│ 9.5│ 9.0│ 9.5│ 8.5│ 7.0│ 8.70│
│                  │ ✅ │ ✅ │ ✅ │ ✅ │ ✅ │ 🟢  │
├──────────────────┼────┼────┼────┼────┼────┼─────┤
│  Memorial/Gall.  │ 9.0│ 9.0│ 9.5│ 5.0│ 4.0│ 8.10│
│                  │ ✅ │ ✅ │ ✅ │ 🟡 │ 🟠 │ 🟢  │
├──────────────────┼────┼────┼────┼────┼────┼─────┤
│  The Heights     │ 8.5│ 8.5│ 8.0│ 6.5│ 5.5│ 8.05│
│                  │ ✅ │ ✅ │ ✅ │ ✅ │ 🟡 │ 🟢  │
├──────────────────┼────┼────┼────┼────┼────┼─────┤
│  Sugar Land      │ 8.0│ 8.0│ 7.5│ 8.0│ 7.5│ 7.80│
│                  │ ✅ │ ✅ │ ✅ │ ✅ │ ✅ │ 🟢  │
├──────────────────┼────┼────┼────┼────┼────┼─────┤
│  Clear Lake      │ 7.5│ 7.5│ 8.5│ 7.0│ 8.0│ 7.50│
│                  │ ✅ │ ✅ │ ✅ │ ✅ │ ✅ │ 🟢  │
└──────────────────┴────┴────┴────┴────┴────┴─────┘

┌─────────────────────────────────────────────────────────┐
│ PERFIL DEMOGRÁFICO POR ZONA                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [FACETED BAR CHART - Demographics Comparison]          │
│                                                          │
│  % Población Blanca:                                     │
│  ████████████████ Memorial (65%)                        │
│  ██████████████   Energy Corridor (62%)                 │
│  █████████████    The Heights (58%)                     │
│  ██████████       Clear Lake (52%)                      │
│  ████████         Sugar Land (48%)                      │
│                                                          │
│  Ingreso Medio ($k):                                     │
│  ████████████████ Memorial ($105k)                      │
│  ██████████████   Energy Corridor ($95k)                │
│  █████████████    Sugar Land ($85k)                     │
│  ████████████     The Heights ($78k)                    │
│  ███████████      Clear Lake ($72k)                     │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🏆 ENERGY CORRIDOR — ZONA PRIORITARIA                   │
├─────────────────────────────────────────────────────────┤
│ Por qué Energy Corridor:     │ Alternativas Viables:    │
│ ✅ 100k+ empleados corp.     │ 2. The Heights           │
│ ✅ AADT >50k en I-10         │    • Cultura foodie      │
│ ✅ Ingreso medio $90k+       │    • Tráfico mixto       │
│ ✅ Baja competencia directa  │                          │
│ ✅ 62% población blanca      │ 3. Sugar Land            │
│                              │    • Crecimiento rápido  │
│                              │    • Familias con niños  │
└──────────────────────────────┴──────────────────────────┘

═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ ANÁLISIS DE PREVALENCIA DRIVE-THROUGH                   │
└─────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┐
│  [N] Rest.  │  [N] Con DT │   [%] DT    │
│  Analizados │             │  Prevalencia│
└─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────┐
│ DISTRIBUCIÓN DRIVE-THROUGH POR CENSUS TRACT             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [HISTOGRAM - Drive-through Prevalence Distribution]    │
│                                                          │
│     │ ▇                                                 │
│ 30 ─┤ █                                                 │
│     │ █ ▇                                               │
│ 20 ─┤ █ █ ▇                                             │
│     │ █ █ █ ▇▇                                          │
│ 10 ─┤ █ █ █ ██▇▇▇▇                                      │
│     │ █ █ █ ██████▇▇▇                                   │
│  0 ─┴─┴─┴─┴─┴───────────────────────────────────────── │
│     0%    20%    40%    60%    80%   100%               │
│                  │ Promedio: [X]%                       │
│                                                          │
└─────────────────────────────────────────────────────────┘

Insight: Prevalencia varía por zona (suburbios >40%, urbano <20%)

═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ METODOLOGÍA DE SELECCIÓN FINAL                          │
└─────────────────────────────────────────────────────────┘

┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│      📊       │      │      🚗       │      │      🧪       │
│               │      │               │      │               │
│  1. Desktop   │  →   │  2. Site      │  →   │  3. Pilot     │
│   Analysis    │      │   Visits      │      │   Test        │
│               │      │               │      │               │
│ Top 5-7       │      │ Inspección    │      │ Pop-up        │
│ candidatas    │      │ física 2-3    │      │ 2-4 semanas   │
│               │      │               │      │               │
│ ✅ COMPLETADO │      │📅 SIGUIENTE   │      │⏳ PLANIFICADO │
└───────────────┘      └───────────────┘      └───────────────┘

┌─────────────────────────────────────────────────────────┐
│ PRÓXIMOS PASOS ACCIONABLES                              │
├─────────────────────────────────────────────────────────┤
│ □ Contactar brokers retail/industrial          [Alta]   │
│ □ Solicitar zoning reports                     [Alta]   │
│ □ Negociar LOI con 2-3 propietarios            [Alta]   │
│ □ Coordinar site visit con stakeholders        [Media]  │
│ □ Preparar pro forma financiero                [Media]  │
│ □ Investigar incentivos fiscales               [Media]  │
│ □ Validar permisos FDA y health dept.          [Alta]   │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ RESUMEN EJECUTIVO DE DECISIÓN                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────┬─────────────────────────────┐
│ 🏭 PLANTA DE PRODUCCIÓN     │ 🍽️ PRIMERA TIENDA          │
├─────────────────────────────┼─────────────────────────────┤
│ Recomendación:              │ Recomendación:              │
│ Northwest Houston           │ Energy Corridor             │
│ (Spring Branch / Cypress)   │ (I-10 West)                 │
│                             │                             │
│ Score: 8.35/10              │ Score: 8.70/10              │
│ Inversión: $350-500k        │ Inversión: $250-350k        │
│ Timeline: 3-4 meses         │ Timeline: 4-6 meses         │
└─────────────────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💡 RECOMENDACIONES ESTRATÉGICAS FINALES                 │
├─────────────────────────────────────────────────────────┤
│ 1. Timing: Búsqueda en paralelo (plazos similares)     │
│ 2. Flexibilidad: Mantener 2-3 opciones activas         │
│ 3. Validación: Pop-up temporal antes de lease          │
│ 4. Escalabilidad: Diseñar para 3-5 tiendas desde inicio│
│ 5. Legal: Contratar abogado RE comercial de Texas      │
│ 6. ROI: Target break-even 18-24 meses                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Elements

### Color Coding
- 🟢 **Green**: Winners, recommendations (Energy Corridor, Northwest Houston)
- 🔵 **Blue**: Information, analysis sections
- 🟡 **Yellow**: Warnings, medium scores
- 🟠 **Orange**: Next steps (Site Visits phase)
- 🔴 **Red**: High priority actions
- 🟣 **Purple**: Future planning (Pilot Test)

### Icons Used
- 📍 Geographic location
- 🍽️ Restaurants
- 🚗 Drive-through / vehicles
- 🛣️ Traffic / roads
- 🏆 Winner / top choice
- ✅ Checkmark / positive
- ⚠️ Warning / consideration
- 💡 Insight / tip
- 📊 Analysis / data
- 🧪 Testing / experimentation
- 📅 Scheduled / next step
- ⏳ Planned / future
- 💰 Cost / financial
- 📈 Growth / scalability
- 🌡️ Weather / climate

### Interactive Elements
1. **Map Layer Toggles**: Show/hide different data overlays
2. **Checkboxes**: Track action items
3. **Tooltips**: Hover over map points for details
4. **Responsive Charts**: Resize with window

---

## 📊 Data Visualizations

### 1. Multi-Layer Map
- **Type**: Mapbox GL JS interactive map
- **Height**: 650px
- **Layers**: 5 toggleable layers
- **Interaction**: Pan, zoom, layer toggle, point click

### 2. Scoring Tables
- **Type**: HTML table with color-coded cells
- **Rows**: 3 plant zones, 5 store zones
- **Columns**: 5-6 weighted criteria per table
- **Sorting**: Pre-sorted by total score (descending)

### 3. Demographics Chart
- **Type**: Faceted horizontal bar chart (Plot.js)
- **Metrics**: % white population, median income
- **Zones**: 5 microzones compared
- **Height**: 350px

### 4. Drive-Through Histogram
- **Type**: Binned histogram (Plot.js)
- **Data**: Census tract prevalence rates
- **Bins**: 20 bins across 0-100% range
- **Indicator**: Average line with label

### 5. Workflow Diagram
- **Type**: Custom HTML/CSS
- **Stages**: 3 connected stages
- **Visuals**: Gradient circles, arrows, status badges

---

## 🔢 Key Metrics Displayed

### Market Overview
- Total zones analyzed: [N]
- Restaurants in target area: [N]
- Drive-through prevalence: [%]
- Average traffic (AADT): 35,000

### Plant Location Scores (0-10 scale)
- Northwest Houston: **8.35** 🏆
- East Houston: 7.65
- Southwest Houston: 7.60

### Store Location Scores (0-10 scale)
- Energy Corridor: **8.70** 🏆
- Memorial/Galleria: 8.10
- The Heights: 8.05
- Sugar Land: 7.80
- Clear Lake: 7.50

### Investment Estimates
- Plant: $350k-500k (3-4 months)
- Store: $250k-350k (4-6 months)
- Break-even target: 18-24 months

---

## ✨ User Experience Improvements

### Before
- Linear text document
- Single static recommendation
- No visual comparison tools
- Difficult to evaluate trade-offs

### After
- Non-linear exploration
- Quantitative multi-criteria analysis
- Interactive map and charts
- Clear visual hierarchy of recommendations
- Actionable checklist with priorities
- Executive summary for quick insights

---

**Page Load Time**: 187ms  
**Build Status**: ✅ Success  
**Mobile Friendly**: Responsive design  
**Accessibility**: Semantic HTML, ARIA-compatible  
**Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

