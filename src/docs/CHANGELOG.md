# Changelog - Pastes Kikos Soft Landing Houston

## [1.0.0] - 2025-06-04 - Entregable Final

### Added
- **Observable Framework Site**: Sitio interactivo completo con análisis de mercado
  - Portada con memo ejecutivo (Para: José Luis, Fecha: 4 de junio 2025)
  - 13 páginas organizadas en 4 secciones principales
  - 6+ mapas interactivos (Mapbox GL JS)
  - Visualizaciones con Observable Plot
  
- **Análisis de Reseñas** (NLP + Sentiment Analysis):
  - Pipeline completo con OpenAI Batch API
  - Script de agregación (`aggregate_review_batch_output.py`)
  - Outputs: `reviews_parsed.json`, `reviews_summary.json`
  - Integración en página "Propuesta de Valor"

- **Documentación Completa**:
  - `README_DATOS.md`: Fuentes, esquemas, licencias
  - `METODOLOGIA.md`: Pipeline técnico detallado
  - `CHANGELOG.md`: Este archivo

- **Datos Procesados**:
  - Reviews: 10+ reseñas analizadas (muestra)
  - GIS: 30+ capas geoespaciales curadas
  - Hábitos: JSON agregado con KPIs clave

### Fixed
- Paths de `FileAttachment` en componentes Observable
- Estructura de carpetas `src/data/` (gis + static + analytics)
- Estilos CSS consistentes en todas las páginas

### Changed
- Formato de intro.md → memo ejecutivo formal
- Reorganización de datos en `hello-framework/src/data/`
- Token Mapbox actualizado y restringido por dominio

## [0.9.0] - 2025-05-15 - Beta Review

### Added
- Multi-agent menu extraction pipeline (LangGraph)
- Hunger Index component (Mapbox-based)
- Drive-through analysis layer
- Demographics choropleth maps

### Fixed
- Opening hours parsing (multiple time formats)
- Price normalization edge cases

## [0.8.0] - 2025-04-20 - Data Collection Complete

### Added
- Google Maps scraper (Apify integration)
- 11,000+ restaurant records
- 200,000+ reviews text
- 16,000+ menu photos

### Fixed
- Geocoding accuracy for edge cases
- Duplicate place_ids removal

## [0.7.0] - 2025-03-30 - GIS Foundation

### Added
- Census tracts processing
- Traffic roads integration (TxDOT)
- Buffer zones (2km analysis)
- DBSCAN clustering implementation

## [0.6.0] - 2025-03-10 - Initial Framework Setup

### Added
- Observable Framework project initialization
- Component library structure
- Basic mapping utilities

## Project Milestones

### Phase 1: Research & Data Collection (Jan-Mar 2025)
- Market sizing and competitor identification
- Data sources evaluation and acquisition
- Ethical review and API compliance

### Phase 2: Analysis & Modeling (Mar-May 2025)
- Geospatial analysis pipelines
- NLP sentiment extraction
- Statistical segmentation models

### Phase 3: Visualization & Documentation (May-Jun 2025)
- Observable Framework development
- Interactive dashboards
- Executive summary and technical docs

### Phase 4: Delivery (Jun 2025)
- Final QA and build
- GitHub Pages deployment
- Stakeholder presentation

## Known Issues & Future Work

### Data Gaps
- [ ] Menu extractions: Low coverage (~5% images classified as menus)
  - **Solution**: Manual labeling + fine-tuned classifier
- [ ] Reviews: Only 10 processed in current batch
  - **Solution**: Complete batch processing of 200K+ reviews
- [ ] Traffic data: Limited to permanent count stations
  - **Solution**: Integrate Uber Movement or similar real-time data

### Technical Debt
- [ ] Mapbox token management (currently hardcoded)
- [ ] Build optimization (GeoJSON files >5MB)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Internationalization (full ES translation)

### Feature Requests
- [ ] Site search implementation (activated but needs index)
- [ ] PDF export of full report
- [ ] API endpoints for programmatic access to summaries
- [ ] Real-time data refresh from Google Maps API

## Contributors
- Data Engineering: [Nombre]
- GIS Analysis: [Nombre]
- NLP/ML: [Nombre]
- Visualization: [Nombre]
- Product Owner: José Luis

## License
Proprietary - Pastes Kikos / STRTGY Consulting

---
*Este CHANGELOG sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)*


