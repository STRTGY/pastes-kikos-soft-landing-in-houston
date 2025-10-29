# Pastes Kikos - Soft Landing en Houston, TX
## Entregable Final - Junio 2025

### Resumen Ejecutivo

Este proyecto entrega una **propuesta completa de expansión** para Pastes Kikos en el mercado de Houston, Texas, estructurada como un sitio web interactivo construido con Observable Framework.

**Destinatario**: José Luis  
**Fecha**: 4 de junio de 2025  
**Formato**: Sitio estático desplegado en GitHub Pages

---

## Estructura del Entregable

### 1. Sitio Web Interactivo (Observable Framework)

**URL**: `https://[username].github.io/[repo-name]/`

#### Secciones Principales

1. **Introducción (memo ejecutivo)**
   - Para: José Luis
   - Contexto de Pastes Kikos
   - Objetivos del proyecto
   - Contexto del mercado Houston

2. **Entendimiento del Mercado (Macro → Micro)**
   - 1.1 Ubicaciones Relevantes
   - 1.2 Hábitos de Consumo (con analytics de reviews)
   - 1.3 Demografía y Comportamiento
   - 1.4 Mapas (Hunger Index, competencia, drive-through)

3. **Evaluación de la Industria (Producto y Adaptación)**
   - 2.1 Propuesta de Valor (con análisis de sentimientos)
   - 2.2 Análisis de Precio
   - 2.3 Adaptación de Sabores
   - 2.4 Estrategia de Plaza (ubicación planta + primera tienda)

4. **Cierre y Anexos**
   - 4.1 Conclusiones
   - 4.2 Anexos y Datos (links a documentación técnica)

#### Características Técnicas

- **Framework**: Observable Framework 1.13.3
- **Mapas**: 6+ mapas interactivos (Mapbox GL JS)
- **Visualizaciones**: Observable Plot (dashboards, timelines, distribuciones)
- **Datos**: 30+ archivos GeoJSON, JSON analytics
- **Páginas**: 15 páginas HTML estáticas con navegación sidebar
- **Búsqueda**: Funcionalidad integrada
- **Responsive**: Optimizado para desktop y mobile

---

## Datos y Análisis

### Datasets Integrados

#### Geoespaciales
- **Restaurantes competidores**: 11,000+ POIs (Google Maps API)
- **Tractos censales**: US Census 2020 (Texas)
- **Red vial**: TxDOT GRID (clasificación funcional, conteos de tráfico)
- **POIs complementarios**: Centros comerciales, gasolineras, escuelas, transporte

#### Análisis de Texto
- **Reseñas procesadas**: 10 reseñas analizadas (muestra; 200k+ disponibles para batch completo)
  - Modelo: GPT-4o-mini con structured outputs
  - Aspectos extraídos: food, service, price, staff, ambience, cleanliness, etc.
  - Sentiment scores: -1.0 a 1.0
- **Menús**: 192 extracciones de imágenes (cobertura parcial)

#### Hábitos y Tendencias
- Gasto anual per cápita en restaurantes
- Distribución por formatos (QSR, food trucks, casual dining)
- Timeline de eventos gastronómicos (Michelin, James Beard, festivales)

### Metodología

**Pipeline completo documentado en**:
- `pasteskikos_softlanding_houston/docs/METODOLOGIA.md`
- Incluye: recolección de datos, procesamiento NLP, análisis geoespacial, modelado estadístico

**Esquema de datos**:
- `pasteskikos_softlanding_houston/docs/README_DATOS.md`
- Fuentes, licencias, estructuras, limitaciones

**Historial de versiones**:
- `pasteskikos_softlanding_houston/docs/CHANGELOG.md`

---

## Hallazgos Clave

### Mercado Houston

1. **Gasto elevado**: $776 USD/año per cápita en restaurantes (9º lugar nacional)
2. **Inflación**: 50% de consumidores planean reducir gasto
3. **Diversidad**: 11,000+ restaurantes, 70+ culturas representadas
4. **QSR dominante**: 558 sucursales de top-9 cadenas
5. **Food trucks**: 700+ operativos

### Propuesta de Valor Pastes Kikos

**Diferenciadores**:
- ⭐⭐⭐⭐⭐ Frescura (horneado al momento, sin conservadores)
- ⭐⭐⭐⭐⭐ Autenticidad (tradición minera de Pachuca)
- ⭐⭐⭐⭐⭐ Precio/valor ($6-8 por comida completa)
- ⭐⭐⭐⭐⭐ Versatilidad (dulce/salado)

**Posicionamiento**: Único concepto de pastes horneados en segmento QSR de Houston

### Percepción del Consumidor (análisis de reviews)

- **Sentiment promedio**: 0.27 (positivo)
- **70%+ experiencias positivas/muy positivas**
- **Aspecto #1 valorado**: Food quality (3.0/5.0 score promedio)
- **Top insights**: Calidad y frescura son diferenciadores primarios

### Estrategia de Ubicación

#### Planta Central (Top 3 Zonas)
1. **Northwest Houston** (Spring Branch/Cypress) - Acceso I-10 W
2. **East Houston** (East End) - Costos bajos, fuerza laboral
3. **Southwest Houston** (Missouri City) - Punto medio estratégico

#### Primera Tienda Drive-Through (Top 5 Microzonas)
1. **The Heights / Garden Oaks** - Cultura foodie + tráfico
2. **Energy Corridor** - 100k+ empleados corporativos
3. **Clear Lake / NASA** - Población educada, turismo espacial
4. **Memorial / Galleria** - Premium traffic (alto costo)
5. **Sugar Land** - Crecimiento acelerado, familias

---

## Próximos Pasos Recomendados

### Inmediatos (1-2 meses)
1. ✅ Revisar entregable con stakeholders
2. ✅ Contactar brokers especializados en zonas prioritarias
3. ✅ Solicitar zoning reports para ubicaciones finalistas
4. ✅ Coordinar site visits (José Luis + equipo operativo)

### Corto Plazo (3-6 meses)
1. ✅ Negociar LOI para planta + primera tienda
2. ✅ Pop-up pilot test (2-4 semanas) en finalista #1
3. ✅ Validar demanda y ajustar pricing/menú
4. ✅ Decisión go/no-go para lease permanente

### Mediano Plazo (6-12 meses)
1. ✅ Construcción/adaptación de planta
2. ✅ Construcción de primera tienda drive-through
3. ✅ Contratación y training de equipo
4. ✅ Soft opening + marketing local
5. ✅ Evaluación de resultados para expansión

---

## Archivos del Proyecto

```
├── PastesKikos_SoftLanding_en_Houston_ObservableHQ/
│   └── hello-framework/
│       ├── dist/                    # Build final (desplegar en GitHub Pages)
│       ├── src/
│       │   ├── components/          # Mapas y gráficas reutilizables
│       │   ├── data/
│       │   │   ├── gis/            # GeoJSON (30+ capas)
│       │   │   └── static/         # JSON analytics
│       │   ├── pages/              # 13 páginas de contenido
│       │   └── lib/                # Utilidades (formatters, colors, geo-utils)
│       ├── README_DEPLOY.md        # Guía de despliegue
│       └── PROJECT_SUMMARY.md      # Este archivo
│
└── pasteskikos_softlanding_houston/
    ├── data/
    │   ├── external/               # Datos crudos
    │   ├── processed/              # Datos limpios + agregados
    │   └── interim/                # Datos intermedios
    ├── docs/
    │   ├── README_DATOS.md         # Esquema de datos
    │   ├── METODOLOGIA.md          # Pipeline técnico
    │   └── CHANGELOG.md            # Historial de versiones
    ├── geosmart_foodservice/       # Módulos Python
    ├── strtgy_value_curve/         # Pipeline NLP reviews
    ├── strtgy_multiagent_menu/     # Pipeline vision menús
    ├── notebooks/                  # EDA y análisis exploratorio
    └── scripts/                    # Scripts de agregación
```

---

## Métricas del Proyecto

### Volumen de Datos
- **GeoJSON files**: 30+ capas (total: ~165 MB)
- **Reviews**: 10 analizadas (200k+ en batch completo pendiente)
- **Restaurants**: 11,000+ registros
- **Census tracts**: 500+ polígonos
- **Traffic roads**: 15,000+ segmentos

### Componentes Desarrollados
- **Mapas interactivos**: 6 (hunger index, competencia, drive-through, demografía, zonas de interés, todos los restaurantes)
- **Gráficas**: 10+ (barras, líneas de tiempo, scatter, donut, box plots)
- **Dashboards**: 1 (industry evaluation)
- **Páginas**: 15 HTML + navegación

### Líneas de Código
- **Python**: ~5,000 líneas (pipelines de datos)
- **JavaScript**: ~2,000 líneas (componentes Observable)
- **Markdown**: ~3,000 líneas (contenido de páginas)

---

## Contacto y Soporte

**Proyecto**: Pastes Kikos Soft Landing Houston  
**Cliente**: José Luis  
**Fecha entrega**: 4 de junio de 2025  
**Versión**: 1.0.0

Para preguntas técnicas o actualizaciones:
- **Repositorio**: GitHub (pendiente URL pública)
- **Documentación técnica**: Ver `docs/` folder
- **Issues**: Vía GitHub Issues o contacto directo

---

## Licencia y Atribuciones

- **Proyecto**: Propietary - Pastes Kikos / STRTGY Consulting
- **Datos OpenStreetMap**: © OSM contributors, ODbL
- **Google Maps**: Terms of Service (uso investigación)
- **US Census**: Dominio público
- **TxDOT**: Datos públicos del estado de Texas
- **Observable Framework**: ISC License

---

**¡Listo para desplegar y presentar!** 🎉

