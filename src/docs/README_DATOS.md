# Documentación de Datos - Pastes Kikos Soft Landing Houston

## Fuentes de Datos

### 1. Datos Geoespaciales (GIS)

#### Fuente principal: OpenStreetMap y Google Maps
- **Restaurantes competidores**: Extraídos via Google Maps API
  - `restaurantCompetition_withinWhiteHouston.geojson` (todos los restaurantes)
  - `restaurantCompetition_withinWhiteHouston_hasDriveThrough.geojson` (con drive-through)
  - `restaurantes.geojson` (base completa)

- **Puntos de interés**:
  - `mallShoppingComplex_whiteHouston.geojson` - Centros comerciales
  - `fuelingStation_whiteHouston.geojson` - Gasolineras
  - `educationFacilities_whiteHouston.geojson` - Escuelas y universidades
  - `governmentFacilities_whiteHouston.geojson` - Edificios gubernamentales
  - `publicTransportStations_whiteHouston.geojson` - Estaciones de transporte

#### US Census Bureau
- **Tractos censales**: `tl_2024_48_tract` (Texas)
- **Áreas urbanas**: `tl_2024_us_uac20`
- **Procesados**:
  - `whiteHoustonCensusTracts_40percent.geojson` - Tractos con ≥40% población blanca
  - `whiteHoustonCensusTracts_2kmBuffer.geojson` - Con buffer de análisis

#### TxDOT (Texas Department of Transportation)
- **Red vial**: `Traffic_Roads/` (clasificación funcional, conteos de tráfico)
- **Archivos**:
  - `houstonMetropolitan_functional_classification.geojson`
  - `permanent_count_stations.geojson`
  - `future_congestion.geojson`

### 2. Datos de Reseñas y Análisis de Sentimiento

#### Google Maps Reviews (via crawler)
- **Archivo fuente**: `data/interim/df_reviews_total.csv`
- **Procesamiento**: OpenAI Batch API con modelo `gpt-4o-mini`
- **Salida procesada**:
  - `data/processed/reviews_parsed.json` (reseñas individuales analizadas)
  - `data/processed/reviews_summary.json` (agregados estadísticos)

**Esquema ReviewAnalysis**:
```json
{
  "sentiment_score": float (-1.0 a 1.0),
  "summary": string,
  "aspects": {
    "food": {"score": float (0-5), "description": string},
    "service": {...},
    "price": {...},
    ...
  }
}
```

### 3. Datos de Menús y Sabores

#### Extracción via LangGraph Multi-Agent
- **Imágenes fuente**: Google Maps photos (menús)
- **Pipeline**: Clasificación → OCR → Parsing → Extracción estructurada
- **Salida**: `data/processed/menu_extractions.jsonl`

**Esquema MenuItem**:
```json
{
  "item_name": string,
  "description": string,
  "price": {"amount": float, "currency": string},
  "flavour_notes": [
    {"taste": enum, "specific_flavour": string, "intensity": float}
  ]
}
```

**Nota**: Cobertura parcial (~192 registros); mayoría de imágenes clasificadas como "not_menu".

### 4. Datos Estadísticos y Hábitos

#### Fuentes secundarias
- **Travel + Leisure 2024**: "Best U.S. Food Cities"
- **OpenTable 2024**: Reservaciones post-Michelin
- **James Beard Awards 2025**: Nominaciones Houston
- **Indicadores económicos**: Costo de alimentos, inflación (Bureau of Labor Statistics)

**Archivo agregado**: `data/static/habitos.json`
- Gasto anual per cápita
- Porcentaje gasto en restaurantes
- Distribución por formatos (QSR, food trucks, casual dining)

## Esquema de Directorios

```
pasteskikos_softlanding_houston/
├── data/
│   ├── external/           # Datos crudos de fuentes externas
│   │   ├── *.geojson
│   │   ├── Traffic_Roads/
│   │   ├── openaiBatches/
│   │   └── tl_2024_*/
│   ├── interim/            # Datos intermedios
│   │   ├── df_reviews_total.csv
│   │   └── photos/
│   ├── processed/          # Datos finales limpiados
│   │   ├── reviews_parsed.json
│   │   ├── reviews_summary.json
│   │   └── menu_extractions.jsonl
│   └── raw/                # Datos originales sin procesar
│
└── docs/                   # Documentación
    ├── README_DATOS.md
    ├── METODOLOGIA.md
    └── CHANGELOG.md
```

## Licencias y Atribuciones

- **OpenStreetMap**: © OpenStreetMap contributors, ODbL
- **Google Maps**: Datos obtenidos via Terms of Service; uso exclusivo investigación académica/interna
- **US Census Bureau**: Datos de dominio público
- **TxDOT**: Datos públicos del estado de Texas

## Contacto y Actualizaciones

Para preguntas sobre los datos o actualizaciones del dataset:
- **Proyecto**: Pastes Kikos Soft Landing Houston
- **Fecha última actualización**: Junio 2025
- **Contacto**: [Tu contacto aquí]

## Notas Técnicas

### Sistemas de Referencia
- **CRS estándar**: EPSG:4326 (WGS84)
- **Proyectados**: EPSG:32615 (UTM Zone 15N) para análisis de distancias

### Herramientas Utilizadas
- **Python**: pandas, geopandas, shapely
- **GIS**: QGIS 3.x
- **APIs**: Google Maps Platform, OpenAI
- **Observable Framework**: v1.13.3

### Limitaciones Conocidas
1. Cobertura de menús limitada (~200 restaurantes con extracción válida)
2. Reseñas: muestra de ~10 registros procesados (batch completo pendiente)
3. Datos de tráfico: estaciones fijas, no cobertura completa de red
4. Demografía: Census 2020 (próxima actualización 2030)


