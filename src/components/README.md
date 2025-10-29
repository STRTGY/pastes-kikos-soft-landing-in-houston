# Componentes

Documentación de los componentes reutilizables del proyecto.

## Estructura de Directorios

```
components/
├── core/           # Componentes base y utilidades
├── maps/           # Componentes de mapas específicos
├── charts/         # Gráficas y visualizaciones
├── dashboards/     # Dashboards completos
└── deprecated/     # Código antiguo para referencia
```

## Core Components

### mapbox-utils.js

Utilidades para inicialización y manejo de mapas Mapbox.

**Exports:**
- `ensureMapboxAccessToken(token)`: Configura el token de acceso
- `createMapboxMap(container, options)`: Crea instancia de mapa
- `waitForContainerSize(container, map, callback)`: Espera tamaño del contenedor
- `mapboxgl`: Exportación directa de la librería

### mapbox-base.js

Componente base para crear mapas interactivos con múltiples capas.

**Export principal:**
```javascript
consumerCentricityMapMapbox(options)
```

**Opciones:**
- `center`: Array [lat, lng] - Centro del mapa
- `zoom`: Number - Nivel de zoom inicial
- `size`: Object {height, width} - Tamaño del contenedor
- `mapboxToken`: String - Token de Mapbox
- `mapboxStyle`: String - URL del estilo de Mapbox
- `choropleths`: Array - Capas de coropletas
- `pointsLayers`: Object - Capas de puntos
- `categoricalPoints`: Object - Puntos categorizados
- `heatmapPoints`: Object - Capa de heatmap
- `layerStyles`: Object - Estilos personalizados
- `alwaysOnTopPoints`: Object - Puntos siempre visibles

**Ejemplo:**
```javascript
import { consumerCentricityMapMapbox } from "./core/mapbox-base.js";

const map = consumerCentricityMapMapbox({
  center: [29.7604, -95.3698],
  zoom: 10,
  choropleths: [
    { data: geoData, name: "Capa", property: "valor" }
  ]
});
```

## Maps Components

### demographics-map.js

Mapa de demografía mostrando población anglosajona.

**Props:**
- `demog`: GeoJSON con datos demográficos
- `center`, `zoom`, `size`, `mapboxToken`, `mapboxStyle`

**Uso:**
```javascript
import demographicsMap from "./maps/demographics-map.js";

const map = await demographicsMap({
  demog: demographicsData,
  size: { height: 720 }
});
```

### restaurants-all-map.js

Mapa de restaurantes con tres vistas:
- Todos los restaurantes
- Por categoría
- Heatmap

**Props:**
- `restaurants`: GeoJSON con restaurantes
- Opciones estándar de mapa

### restaurants-competition-map.js

Mapa de competencia con destaque para Pastes Kikos.

**Props:**
- `competition`: GeoJSON de competidores
- `pastekos`: GeoJSON de ubicaciones Pastes Kikos (opcional)
- Opciones estándar de mapa

### restaurants-drivethru-map.js

Mapa enfocado en restaurantes con drive-thru.

**Props:**
- `restaurants`: GeoJSON con todos los restaurantes
- Filtra automáticamente los que tienen `has_drive_through: true`

### zones-interest-map.js

Mapa de zonas de interés (clusters anglosajones).

**Props:**
- `angloZones`: GeoJSON con polígonos de zonas
- Property: `CLUSTER_SIZE`

### hunger-index-map.js

Mapa interactivo del índice de hambre con control de hora/día.

**Props:**
- `restaurants`: GeoJSON con datos de ocupación por hora
- `cellSizeDegrees`: Tamaño de celda del grid (default: 0.01)
- Opciones estándar de mapa

**Características:**
- Grid hexagonal de ocupación
- Control de slider para hora del día
- Selector de día de la semana
- Paletas de colores personalizables

## Charts Components

### timeline-chart.js

Gráfica de línea de tiempo para datos temporales.

**Props:**
- `data`: Array de objetos con timestamp y valores
- `width`, `height`: Dimensiones
- Configuración de ejes y estilos

### top-categories-bar.js

Gráfica de barras horizontales para categorías principales.

**Props:**
- `data`: Array de categorías y valores
- `topN`: Número de categorías a mostrar
- Configuración de colores y estilos

## Dashboards Components

### industry-evaluation.js

Dashboard completo para evaluación de industria.

**Props:**
- `data`: Object con datos de evaluación
- `center`, `zoom`, `size`
- `mapboxToken`, `mapboxStyle`

**Características:**
- Mapa interactivo
- Gráficas de categorías, precios, horarios
- Filtrado dinámico por zona
- Estadísticas agregadas

## Deprecated Components

Componentes antiguos mantenidos para referencia:

- `consumer_centricity_map.js`: Versión Leaflet del mapa base
- `hunger_index.js`: Versión Leaflet del índice de hambre
- `heat_map.js`, `line_map.js`, `point_map.js`, `polygon_map.js`, `spike_map.js`: Componentes de visualización antiguos

⚠️ **No usar estos componentes en nuevas implementaciones.**

## Convenciones de Código

### Nombres de Archivos

- Usar kebab-case: `component-name.js`
- Sufijos descriptivos: `-map.js`, `-chart.js`, `-dashboard.js`

### Exports

- **Default export** para componentes principales
- **Named exports** para utilidades y helpers

### Imports

```javascript
// Bueno
import componentName from "./component-name.js";
import { helper } from "../lib/helpers.js";

// Evitar
import componentName from "./11_1_component.js"; // números
```

### Documentación

Incluir comentarios JSDoc:

```javascript
/**
 * Descripción del componente
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.center - Centro del mapa [lat, lng]
 * @param {number} options.zoom - Nivel de zoom
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function myComponent(options) {
  // ...
}
```

## Buenas Prácticas

1. **Modularidad**: Componentes pequeños y enfocados
2. **Reutilización**: Usar componentes base (mapbox-base.js)
3. **Configuración**: Usar `config.js` para constantes
4. **Utilidades**: Usar helpers de `lib/` para funciones comunes
5. **Tipos**: Documentar con JSDoc para autocompletado
6. **Errores**: Manejar casos edge con try-catch
7. **Performance**: Lazy loading con dynamic imports

## Añadir Nuevos Componentes

### 1. Crear el archivo

```bash
# Map component
src/components/maps/my-new-map.js

# Chart component
src/components/charts/my-new-chart.js

# Dashboard component
src/components/dashboards/my-new-dashboard.js
```

### 2. Implementar el componente

```javascript
import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { formatInteger } from "../../lib/formatters.js";

/**
 * Descripción del nuevo mapa
 */
export default async function myNewMap(options) {
  // Implementación
  return consumerCentricityMapMapbox({
    // configuración
  });
}
```

### 3. Usar en páginas

```javascript
// En tu archivo .md
import myNewMap from "../../components/maps/my-new-map.js";

const map = await myNewMap({
  // opciones
});
```

## Testing

Para probar componentes:

1. Inicia el servidor de desarrollo: `npm run dev`
2. Crea una página de prueba en `src/pages/`
3. Importa y usa tu componente
4. Verifica en el navegador

## Troubleshooting

### Error: "Module not found"

- Verifica la ruta relativa del import
- Asegúrate de incluir la extensión `.js`

### Error: "mapboxgl is not defined"

- Importa desde `core/mapbox-utils.js`
- Verifica que el token de Mapbox sea válido

### Mapa no se renderiza

- Verifica que el contenedor tenga altura definida
- Usa `size: { height: 720 }` en opciones
- Revisa la consola del navegador para errores

## Recursos

- [Observable Framework Docs](https://observablehq.com/framework/)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Observable Plot](https://observablehq.com/plot/)
- [D3.js](https://d3js.org/)

