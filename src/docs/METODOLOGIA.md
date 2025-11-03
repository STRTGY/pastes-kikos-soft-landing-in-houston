# Metodología - Análisis Pastes Kikos Soft Landing Houston

## Resumen Ejecutivo

Este documento describe la metodología empleada para desarrollar la propuesta de expansión de Pastes Kikos en Houston, TX. El análisis combina técnicas de geointeligencia, procesamiento de lenguaje natural (NLP), análisis de sentimientos y modelado estadístico para generar insights accionables sobre el mercado objetivo.

## 1. Recolección de Datos

### 1.1 Datos Geoespaciales

**Herramientas**: Google Maps API, Apify web scrapers, QGIS

**Proceso**:
1. Definición de área de estudio (Houston Metropolitan + White Houston target zones)
2. Extracción de POIs via Google Maps Places API
   - Restaurantes competidores (keywords: "restaurant", "fast food", "empanadas", "pizza")
   - Servicios complementarios (gasolineras, centros comerciales, oficinas)
3. Enriquecimiento con atributos:
   - Ratings, número de reseñas
   - Horarios de apertura
   - Presencia de drive-through
   - Fotos de menús (cuando disponibles)

**Scripts clave**:
- `geosmart_foodservice/gmaps_geo/geo.py` - Extracción y limpieza geodata
- `notebooks/data_exploration.ipynb` - EDA inicial

### 1.2 Reseñas de Clientes

**Fuente**: Google Maps Reviews (via Apify crawler)

**Pipeline**:
1. **Crawler**: Apify Google Maps Scraper
   - Input: Lista de place_ids de restaurantes
   - Output: JSON con metadata + reseñas (texto, rating, fecha)
   
2. **Preparación de lotes**:
   - Script: `strtgy_value_curve/batch_file_creation_reviews.py`
   - Formato: JSONL compatible con OpenAI Batch API
   - Chunks: 50,000 requests por archivo

3. **Procesamiento NLP**:
   - Modelo: `gpt-4o-mini` (OpenAI)
   - Prompt: `strtgy_value_curve/restaurant_prompt.py`
   - Schema: `ReviewAnalysis` (Pydantic)
   - Extracción de:
     - Sentiment score (-1.0 a 1.0)
     - Aspects mencionados (food, service, price, ambience, etc.)
     - Scores por aspecto (0-5)
     - Descripciones cualitativas

4. **Agregación**:
   - Script: `scripts/aggregate_review_batch_output.py`
   - Output: `reviews_summary.json`

### 1.3 Análisis de Menús (Vision + LangGraph)

**Pipeline Multi-Agente**:

1. **Ingest Node**: Descarga imágenes desde URLs de Google Maps
2. **Classifier Agent**: Visión GPT-4o-mini determina si la imagen es un menú
3. **OCR Agent**: Extracción de texto de imágenes clasificadas como menú
4. **Parser Agent**: Parsing estructurado a `MenuItem` schema
5. **Persistence Agent**: Almacenamiento en JSONL

**Arquitectura**:
- Framework: LangGraph (state machine)
- Modelos: GPT-4o-mini con structured outputs
- Schema: `geosmart_foodservice/flavour_analyzer/models.py`

**Limitación**: Baja tasa de clasificación positiva (~5-10% de imágenes son menús legibles)

## 2. Análisis Geoespacial

### 2.1 Índice de Hambre (Hunger Index)

**Concepto**: Métrica proxy de demanda insatisfecha basada en densidad de restaurantes y horarios populares.

**Metodología**:
1. Kernel Density Estimation (KDE) sobre puntos de restaurantes
2. Ponderación por:
   - `reviewsCount` (indicador de popularidad)
   - `totalScore` (calidad percibida)
   - Horarios de mayor afluencia (cuando disponibles)
3. Normalización a escala 0-100

**Implementación**: `components/maps/hunger-index-map.js` (Observable)

### 2.2 Análisis de Competencia

**Técnicas**:
- **DBSCAN Clustering**: Identificación de hotspots de competencia
  - `eps=0.01` (aprox. 1 km)
  - `min_samples=10`
  
- **Moran's I**: Autocorrelación espacial de scores
  - Detecta si restaurantes de alta calidad se agrupan geográficamente

- **Voronoi Diagrams**: Áreas de influencia de cada competidor

**Scripts**:
- `geosmart_foodservice/gmaps_geo/geo.py` - Funciones core
- `notebooks/data_explor.ipynb` - Análisis exploratorio

### 2.3 Demografía y Segmentación

**Fuentes**: US Census 2020 (ACS 5-year estimates)

**Variables clave**:
- Porcentaje población blanca (target primario)
- Ingreso medio del hogar
- Densidad poblacional
- Distribución de edades

**Procesamiento**:
1. Join espacial: tractos censales ∩ área de estudio
2. Filtrado: tractos con ≥40% población blanca
3. Buffer 2km para análisis de proximidad

**Output**: `whiteHoustonCensusTracts_40percent.geojson`

## 3. Análisis Estadístico

### 3.1 Segmentación de Mercado (K-means)

**Features**:
- `price_tier` (1-4)
- `totalScore`
- `reviewsCount`
- `hours_per_week`

**Proceso**:
1. Normalización con `StandardScaler`
2. K-means con k=4 (validado por elbow method)
3. Interpretación de clusters:
   - Premium/alta demanda
   - Value/volumen
   - Nicho/especializado
   - Bajo rendimiento

**Script**: `geosmart_foodservice/gmaps_geo/stats.py`

### 3.2 Detección de Anomalías

**Algoritmos**:
- **Isolation Forest**: Detección de outliers multivariados
- **Local Outlier Factor (LOF)**: Outliers basados en densidad local

**Aplicación**: Identificar restaurantes con desempeño inusual (muy alto o muy bajo) para análisis cualitativo.

### 3.3 Modelo Predictivo (Random Forest)

**Target**: `reviewsCount` (proxy de demanda)

**Features**:
- Categoría de precio
- Tipo de cocina
- Horas de operación
- Ubicación (via one-hot encoding de sub-zonas)

**Métricas**:
- Cross-validation (5-fold)
- Feature importance para identificar drivers clave

## 4. Visualización Interactiva (Observable Framework)

### 4.1 Mapas Interactivos

**Biblioteca base**: Mapbox GL JS

**Componentes desarrollados**:
- `hunger-index-map.js`: Mapa de calor con índice de hambre
- `restaurants-competition-map.js`: Puntos de competidores con clusters
- `restaurants-drivethru-map.js`: Filtro por drive-through
- `demographics-map.js`: Coropletas de datos censales
- `zones-interest-map.js`: Polígonos de zonas candidatas

**Features**:
- Layers toggleables
- Tooltips con metadata
- Filtros interactivos
- Cálculo dinámico de métricas

### 4.2 Gráficas y Dashboards

**Biblioteca**: Observable Plot

**Componentes**:
- `top-categories-bar.js`: Barras horizontales de top-N categorías
- `timeline-chart.js`: Línea de tiempo de eventos clave
- Custom plots en páginas (sentiment distribution, aspect scores)

## 5. Limitaciones y Consideraciones

### 5.1 Datos

- **Sesgo temporal**: Reviews concentradas en 2022-2024
- **Cobertura geográfica**: Enfocada en "White Houston" por target del cliente
- **Muestra de menús**: Baja tasa de clasificación positiva limita análisis de sabores
- **Batch reviews**: Sólo ~10 reseñas procesadas en muestra; batch completo pendiente

### 5.2 Modelos

- **Hunger Index**: Proxy heurístico, no modelo causal
- **Sentiment**: Modelo entrenado en inglés; posible sesgo en reseñas bilingües
- **Clustering**: K-means asume clusters esféricos; alternativas (HDBSCAN) no exploradas

### 5.3 Contexto de Negocio

- Análisis basado en data hasta Q2 2025
- Supuestos sobre preferencias del mercado anglosajón requieren validación en campo
- Competidor directo "Pasteko" identificado pero no analizado en profundidad (data limitada)

## 6. Reproducibilidad

### Requisitos

**Software**:
- Python 3.9+
- Node.js 18+
- QGIS 3.28+ (opcional, para QA geoespacial)

**Dependencias Python**:
```bash
pip install -r requirements.txt
```

**Dependencias Observable**:
```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
npm install
```

### Ejecución del Pipeline

1. **Agregación de reviews**:
```bash
python pasteskikos_softlanding_houston/scripts/aggregate_review_batch_output.py
```

2. **Build del sitio**:
```bash
cd PastesKikos_SoftLanding_en_Houston_ObservableHQ/hello-framework
npm run build
```

3. **Preview local**:
```bash
npm run dev
```

## 7. Referencias Metodológicas

- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. *Geographical Analysis*, 27(2), 93–115.
- Ester, M., et al. (1996). A density-based algorithm for discovering clusters. *KDD-96 Proceedings*.
- Devlin, J., et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers. *NAACL*.
- OpenAI (2024). GPT-4o Technical Report.

---

**Última actualización**: Junio 2025  
**Autor**: [Tu nombre/equipo]


