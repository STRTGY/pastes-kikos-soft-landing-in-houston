# Sección de Demografía del Consumidor — Houston MSA

## Resumen

Se ha implementado una sección completa e interactiva de demografía del consumidor para el área metropolitana de Houston–The Woodlands–Sugar Land (MSA 26420), con datos oficiales del US Census Bureau y Bureau of Labor Statistics.

## Estructura Implementada

### Datos
- **`src/data/demographics_msa_26420.json`** - Dataset consolidado con todos los indicadores demográficos
  - Población y tendencias (2010-2022)
  - Estructura de edad (pirámide poblacional)
  - Hogares y composición familiar
  - Ingresos y distribución económica
  - Nivel educativo
  - Diversidad racial/étnica y lenguas
  - Vivienda y tenencia
  - Mercado laboral y sectores
  - Movilidad residencial y migración

### Componentes UI
Todos los componentes están en `src/components/demografia/`:

1. **`KpiHeader.js`** - Tarjetas con KPIs principales (actualizado con crecimiento 1990-2030)
2. **`PopulationTrend.js`** - Gráfico de evolución poblacional 1990-2030 con controles interactivos
3. **`CountiesComparison.js`** - **[NUEVO]** Comparación detallada entre 9 condados con gráficos y tabla
4. **`AgePyramid.js`** - Pirámide de edad con distribución por sexo
5. **`Households.js`** - Estructura de hogares y composición familiar
6. **`Income.js`** - Distribución de ingresos con percentiles y brackets
7. **`Education.js`** - Nivel educativo de la población 25+ años
8. **`DiversityLanguage.js`** - Composición racial/étnica y lenguas habladas
9. **`Housing.js`** - Tenencia, valor de vivienda y carga de costo
10. **`Labor.js`** - Mercado laboral, empleo por sector, desempleo
11. **`Mobility.js`** - Movilidad residencial y patrones de migración

### Componente Principal
- **`src/components/DemografiaTabs.js`** - Orquestador con navegación por pestañas que integra todos los componentes

### Página
- **`src/pages/consumidor/demografia.md`** - Página principal que monta el componente con datos y documentación metodológica

## Características

### Visualizaciones Interactivas
- ✅ Gráficos de línea (tendencias poblacionales)
- ✅ Pirámide de edad (barras horizontales por sexo)
- ✅ Gráficos de barras (educación, empleo, movilidad)
- ✅ Stacked bars (hogares, vivienda, carga de costo)
- ✅ Percentiles de ingreso (curva suavizada)
- ✅ Tooltips informativos en todos los gráficos

### Navegación
- ✅ 9 pestañas temáticas
- ✅ Transiciones suaves entre tabs
- ✅ Estados activos visuales
- ✅ Diseño responsive

### Diseño y UX
- ✅ Tarjetas con métricas clave
- ✅ Gradientes y colores temáticos
- ✅ Efectos hover
- ✅ Íconos para cada pestaña
- ✅ Interpretaciones y contexto para cada sección

### Accesibilidad
- ✅ Formato de números localizado (español/inglés según contexto)
- ✅ Contraste adecuado de colores
- ✅ Texto descriptivo en todas las visualizaciones
- ✅ Estructura semántica

## Utilidades Creadas

### Formatters (`src/lib/formatters.js`)
Funciones agregadas:
- `formatChange()` - Formato de cambios porcentuales con signo
- `formatAge()` - Formato de edad con sufijo "años"

### Colors (`src/lib/colors.js`)
Paletas agregadas:
- `DEMOGRAPHICS_PALETTE` - Colores para género y estados
- `AGE_PALETTE` - Gradiente para grupos de edad
- `DIVERSITY_PALETTE` - Colores para composición racial/étnica

## Scripts y Herramientas

### Script de Ingesta de Datos
- **`scripts/fetch_census_data.py`** - Script Python para obtener datos oficiales del Census Bureau API
  - Requiere API key gratuita del Census Bureau
  - Estructura el JSON en el formato requerido
  - Incluye metadatos y fuentes

## Uso

### Desarrollo Local
```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
npm run dev
```

Navegar a: `http://localhost:3000/pages/consumidor/demografia`

### Build para Producción
```bash
npm run build
```

Los archivos generados estarán en `dist/`

### Actualizar Datos del Census
```bash
# Obtener API key en: https://api.census.gov/data/key_signup.html
python scripts/fetch_census_data.py --api-key YOUR_KEY --output src/data/demographics_msa_26420.json
```

## Datos Actuales

Los datos incluidos son:
- **Población histórica**: 1990-2023 (Censos Decenales + estimaciones anuales PEP)
- **Proyecciones**: 2024-2030 (modelos basados en componentes demográficos)
- **Desglose por condados**: 9 condados con población, ingresos, edad y diversidad
- **MSA**: Houston–The Woodlands–Sugar Land (CBSA 26420)
- **Condados**: Harris (66.4%), Fort Bend (12.1%), Montgomery (9.2%), Brazoria, Galveston, Liberty, Waller, Chambers, Austin
- **Fecha**: Octubre 2024

### Mejoras Implementadas (v2.0)

✅ **Serie histórica extendida**: Datos desde 1990 (antes solo 2010-2022)  
✅ **Proyecciones poblacionales**: Hasta 2030 con modelos demográficos  
✅ **Desglose por condados**: 9 condados con métricas detalladas  
✅ **Controles interactivos**: Toggle para mostrar/ocultar proyecciones y comparativas  
✅ **Componente CountiesComparison**: Visualización comparativa entre condados  
✅ **Tabla comparativa**: Resumen de indicadores por condado  
✅ **KPIs mejorados**: Crecimiento desde 1990 y proyección a 2030

### Fuentes Oficiales
- US Census Bureau — American Community Survey (ACS) 2022 5-year estimates
- Bureau of Labor Statistics (BLS) — Local Area Unemployment Statistics 2024

## Próximos Pasos Sugeridos

### Mejoras de Datos
1. Integrar datos históricos más extensos (decadas)
2. Agregar desagregación por condados individuales
3. Incluir proyecciones poblacionales
4. Añadir datos de ingreso real ajustado por inflación

### Mejoras de UI/UX
1. Agregar selector de comparación (TX vs US)
2. Implementar exportación de gráficos (PNG/SVG)
3. Agregar modo de impresión optimizado
4. Crear resumen ejecutivo descargable en PDF

### Análisis Adicional
1. Correlaciones entre variables (ej: educación vs ingreso)
2. Mapas coropléticos por census tract
3. Análisis de tendencias y proyecciones
4. Benchmarking con otros MSAs similares

## Estructura de Archivos Creados/Modificados

```
PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/
├── src/
│   ├── components/
│   │   ├── DemografiaTabs.js                    [NUEVO]
│   │   └── demografia/
│   │       ├── KpiHeader.js                     [NUEVO]
│   │       ├── PopulationTrend.js               [NUEVO]
│   │       ├── AgePyramid.js                    [NUEVO]
│   │       ├── Households.js                    [NUEVO]
│   │       ├── Income.js                        [NUEVO]
│   │       ├── Education.js                     [NUEVO]
│   │       ├── DiversityLanguage.js             [NUEVO]
│   │       ├── Housing.js                       [NUEVO]
│   │       ├── Labor.js                         [NUEVO]
│   │       └── Mobility.js                      [NUEVO]
│   ├── data/
│   │   └── demographics_msa_26420.json          [NUEVO]
│   ├── lib/
│   │   ├── formatters.js                        [MODIFICADO]
│   │   └── colors.js                            [MODIFICADO]
│   └── pages/
│       └── consumidor/
│           └── demografia.md                    [MODIFICADO]
├── scripts/
│   └── fetch_census_data.py                     [NUEVO]
└── DEMOGRAFIA_README.md                         [NUEVO]
```

## Créditos

- **Framework**: Observable Framework v1.13.3
- **Visualizaciones**: Observable Plot v0.6.17
- **Datos**: US Census Bureau, Bureau of Labor Statistics
- **Diseño**: Tema Glacier con personalizaciones

## Licencia y Uso

Los datos demográficos son de dominio público (fuentes gubernamentales).
El código de los componentes sigue la licencia del proyecto principal.

---

**Nota**: Este documento describe la implementación completa de la sección de demografía.
Para consultas técnicas sobre el código, revisar los comentarios inline en cada componente.

