# Soft Landing de Pastes Kikos en Houston, TX

Proyecto de análisis estratégico y visualización de datos para la expansión de Pastes Kikos en Houston, Texas, desarrollado con [Observable Framework](https://observablehq.com/framework/).

## Descripción del Proyecto

Este proyecto corresponde a la **Propuesta de Expansión de Pastes Kikos en Houston**, desarrollada bajo un enfoque de investigación territorial y análisis estratégico de mercado. Se enmarca en un *soft landing*, es decir, un proceso de entrada gradual y estructurado en un nuevo mercado.

### Objetivos

- Comprender el mercado de Houston desde una perspectiva macro a micro
- Analizar la competencia directa e indirecta
- Evaluar la propuesta de valor de Pastes Kikos
- Definir la estrategia de ubicación para planta central y primera tienda
- Construir herramientas de análisis interactivo con capas geoespaciales

## Estructura del Proyecto

```
hello-framework/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── core/           # Componentes base (mapbox-utils, mapbox-base)
│   │   ├── maps/           # Componentes de mapas específicos
│   │   ├── charts/         # Gráficas y visualizaciones
│   │   ├── dashboards/     # Dashboards completos
│   │   └── deprecated/     # Código antiguo para referencia
│   ├── data/
│   │   ├── gis/            # Archivos GeoJSON
│   │   └── static/         # Datos JSON estáticos
│   ├── lib/                # Utilidades compartidas
│   │   ├── formatters.js   # Funciones de formateo
│   │   ├── geo-utils.js    # Utilidades geoespaciales
│   │   └── colors.js       # Paletas de colores
│   ├── pages/              # Páginas del sitio (Markdown)
│   ├── static/             # Assets estáticos (logos, etc.)
│   ├── config.js           # Configuración centralizada
│   ├── site.css            # Estilos globales
│   └── index.md            # Página principal
├── observablehq.config.js  # Configuración de Observable Framework
├── package.json            # Dependencias del proyecto
└── README.md               # Este archivo
```

## Requisitos Previos

- Node.js >= 18
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
cd hello-framework

# Instalar dependencias
npm install
```

## Uso

### Modo Desarrollo

Inicia el servidor de desarrollo con hot-reload:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construcción para Producción

Genera los archivos estáticos optimizados:

```bash
npm run build
```

Los archivos generados estarán en el directorio `dist/`.

### Despliegue

#### GitHub Pages (Automático)

El proyecto se despliega automáticamente a GitHub Pages cuando se hace push a la rama `main`. El workflow de GitHub Actions:

1. Construye el proyecto con `npm run build`
2. Sube los archivos de `dist/` a GitHub Pages
3. El sitio estará disponible en: `https://strtgy.github.io/pastes-kikos-soft-landing-in-houston/`

**Configuración necesaria en GitHub:**
- Ve a Settings → Pages
- Source: GitHub Actions
- No necesitas configurar branch ni folder

#### Observable Cloud (Manual)

Para desplegar a Observable Cloud:

```bash
npm run deploy
```

### Limpiar Caché

```bash
npm run clean
```

## Componentes Principales

### Mapas

- **demographics-map.js**: Mapa de población anglosajona
- **restaurants-all-map.js**: Todos los restaurantes con vistas múltiples
- **restaurants-competition-map.js**: Restaurantes competidores
- **restaurants-drivethru-map.js**: Restaurantes con drive-thru
- **zones-interest-map.js**: Zonas de interés (clusters anglo)
- **hunger-index-map.js**: Índice de hambre interactivo

### Dashboards

- **industry-evaluation.js**: Dashboard de evaluación de industria

### Charts

- **timeline-chart.js**: Gráfica de línea de tiempo
- **top-categories-bar.js**: Gráfica de barras de categorías

## Configuración

La configuración global se encuentra en `src/config.js`:

- Tokens de Mapbox
- Estilos de mapas
- Coordenadas de Houston
- Esquemas de colores
- Rutas de datos

## Datos

### GeoJSON (`src/data/gis/`)

- `whitePOBvsPOBTOT_houston.geojson`: Datos demográficos
- `restaurantes.geojson`: Restaurantes de Houston
- `restaurantCompetition_whitinWhiteHouston.geojson`: Competencia
- `whiteHouston_zonas_de_interes_polygon.geojson`: Zonas de interés
- Y más...

### JSON Estáticos (`src/data/static/`)

- `habitos.json`: Hábitos de consumo
- `habitos_timeline.json`: Timeline de hábitos
- `industry_evaluation_houston.json`: Evaluación de industria
- `ohq_eda_data.json`: Datos de análisis exploratorio

## Integración con Proyecto Python

Este proyecto Observable Framework consume datos generados por el proyecto Python ubicado en:
```
../../pasteskikos_softlanding_houston/
```

Los datos procesados del proyecto Python se encuentran en:
```
../../pasteskikos_softlanding_houston/data/processed/
```

### Regenerar Datasets de Menús

Los datasets de análisis de menús (`items.json`, `price_stats.json`, `flavour_stats.json`, `restaurants.json`) se generan a partir de las extracciones de menús en `menu_extractions.jsonl`:

```bash
# Desde la carpeta del proyecto Python
cd ../pasteskikos_softlanding_houston

# Ejecutar el script de generación de datasets
python scripts/build_menu_datasets.py \
  --input data/processed/menu_extractions.jsonl \
  --out-dir ../PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework/src/data/menu
```

Este proceso:
- Deduplica items del mismo restaurante encontrados en múltiples fotos
- Normaliza nombres de productos y categorías
- Calcula estadísticas de precios y sabores
- Genera reportes de QA (`qa_report.json` y `menu_sample.json`)
- Crea archivos JSON optimizados para Observable Framework

**Nota**: Ejecuta este comando cada vez que se actualice `menu_extractions.jsonl` con nuevas extracciones de menús.

## Tecnologías Utilizadas

- **Observable Framework**: Framework para análisis de datos y visualización
- **Mapbox GL JS**: Mapas interactivos
- **Observable Plot**: Gráficas estadísticas
- **D3.js**: Manipulación de datos y visualizaciones
- **GeoJSON**: Formato de datos geoespaciales

## Mejores Prácticas Implementadas

✅ Estructura modular de componentes
✅ Configuración centralizada
✅ Utilidades compartidas (formatters, geo-utils, colors)
✅ Nombres descriptivos de archivos
✅ Separación de concerns (core/maps/charts/dashboards)
✅ Documentación JSDoc en componentes
✅ Assets organizados por tipo

## Contribuir

Para contribuir al proyecto:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Ejecuta `npm run build` para verificar
4. Crea un Pull Request

## Licencia

Proyecto propietario de Pastes Kikos.

## Contacto

Para preguntas sobre el proyecto, contacta al equipo de desarrollo.

