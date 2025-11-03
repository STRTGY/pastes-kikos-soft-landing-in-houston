---
title: Anexos y Datos
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

<div class="hero">
  <h1>4.2 Anexos y Datos</h1>
</div>

<div class="text">
  <p>Esta sección documenta las fuentes de datos, metodologías y recursos técnicos utilizados en el desarrollo de la propuesta de expansión.</p>
</div>

<div class="hero">
  <h2>Documentación Técnica</h2>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>📊 Esquema de Datos</h2>
    <p>Estructura, fuentes y licencias de todos los datasets utilizados.</p>
    <p><a href="../../docs/README_DATOS" target="_blank">Ver README_DATOS.md</a></p>
  </div>
  <div class="card">
    <h2>🔬 Metodología</h2>
    <p>Pipeline técnico completo: desde recolección hasta visualización.</p>
    <p><a href="../../docs/METODOLOGIA" target="_blank">Ver METODOLOGIA.md</a></p>
  </div>
  <div class="card">
    <h2>📝 Changelog</h2>
    <p>Historial de versiones y evolución del proyecto.</p>
    <p><a href="../../docs/CHANGELOG" target="_blank">Ver CHANGELOG.md</a></p>
  </div>
</div>

<div class="hero">
  <h2>Resumen de Datasets</h2>
</div>

<div class="text">
  <p class="lead"><strong>Datos Geoespaciales</strong></p>
  <ul>
    <li><strong>Restaurantes competidores</strong>: 11,000+ POIs extraídos via Google Maps API</li>
    <li><strong>Tractos censales</strong>: US Census Bureau 2020 (Texas)</li>
    <li><strong>Red vial</strong>: TxDOT GRID con clasificación funcional y conteos de tráfico</li>
    <li><strong>Puntos de interés</strong>: Centros comerciales, gasolineras, escuelas, transporte público</li>
  </ul>
  <p class="lead"><strong>Análisis de Texto</strong></p>
  <ul>
    <li><strong>Reseñas</strong>: 200,000+ reviews procesadas con OpenAI Batch API (muestra de 10 en entregable)</li>
    <li><strong>Menús</strong>: 192 extracciones de imágenes (cobertura parcial por baja clasificación positiva)</li>
    <li><strong>Modelo</strong>: GPT-4o-mini con structured outputs (Pydantic schemas)</li>
  </ul>
  <p class="lead"><strong>Estadísticas y Hábitos</strong></p>
  <ul>
    <li><strong>Travel + Leisure 2024</strong>: Rankings de ciudades gastronómicas</li>
    <li><strong>OpenTable</strong>: Reservaciones post-Michelin</li>
    <li><strong>James Beard Awards</strong>: Nominaciones Houston 2025</li>
    <li><strong>BLS</strong>: Indicadores de inflación y costo de alimentos</li>
  </ul>
</div>

<div class="hero">
  <h2>Fuentes de Datos TxDOT</h2>
</div>

<div class="hero">
  <h2>1. TxDOT Congestion</h2>
</div>

<div class="text">
  <p><strong>Nombre del servicio:</strong> TxDOT_Congestion</p>
  <p><strong>Modelo base:</strong> Car Space (estimación de espacio entre vehículos por milla en hora pico 26)</p>
  <p><strong>Datos base:</strong> Año 2023</p>
  <p><strong>Frecuencia de actualización:</strong> Anual</p>
  <p><strong>Fuente primaria:</strong> Geospatial Roadway Inventory Database (GRID)</p>
  <p><strong>Categorías:</strong> AADT, tráfico, espacio entre vehículos, congestión vial</p>
  <p><strong>Responsable:</strong> Transportation Planning and Programming Division (TPP-GIS)</p>
  <p><strong>Tipo de Servicio:</strong> Feature Service</p>
  <p><strong>URL de Item:</strong> <a href="https://txdot.maps.arcgis.com/home/item.html?id=e7b9f8479bfd43ec804a4e09c2e4d8da" target="_blank">txdot.maps.arcgis.com</a> (ID: e7b9f8479bfd43ec804a4e09c2e4d8da)</p>
</div>

<div class="hero">
  <h2>2. TxDOT Future Congestion</h2>
</div>

<div class="text">
  <p><strong>Nombre del servicio:</strong> TxDOT_Future_Congestion</p>
  <p><strong>Modelo base:</strong> Car Space (proyección para el año 2043, basada en datos 2023)</p>
  <p><strong>Frecuencia de actualización:</strong> Anual</p>
  <p><strong>Fuente primaria:</strong> TPP Data Management</p>
  <p><strong>Categorías:</strong> Proyecciones viales, congestión futura, planificación estratégica</p>
  <p><strong>Responsable:</strong> Transportation Planning and Programming Division (TPP-GIS)</p>
  <p><strong>Tipo de Servicio:</strong> Feature Service</p>
  <p><strong>URL de Item:</strong> <a href="https://txdot.maps.arcgis.com/home/item.html?id=0b0fa1aba6c24570a928fe376acd1ad8" target="_blank">txdot.maps.arcgis.com</a> (ID: 0b0fa1aba6c24570a928fe376acd1ad8)</p>
</div>

<div class="hero">
  <h2>3. TxDOT Functional Classification</h2>
</div>

<div class="text">
  <p><strong>Nombre del servicio:</strong> TxDOT_Functional_Classification</p>
  <p><strong>Descripción:</strong> Clasificación funcional de carreteras según normativa federal (servicio vs. acceso)</p>
  <p><strong>Frecuencia de actualización:</strong> Mensual</p>
  <p><strong>Fuente primaria:</strong> Geospatial Roadway Inventory Database (GRID)</p>
  <p><strong>Categorías:</strong> Clasificación vial, planificación, infraestructura vial</p>
  <p><strong>Responsable:</strong> TPP, MPOs, FHWA (en colaboración)</p>
  <p><strong>Tipo de Servicio:</strong> Feature Service</p>
  <p><strong>URL de Item:</strong> <a href="https://txdot.maps.arcgis.com/home/item.html?id=b553554a0a0842928936cf41e0721bc5" target="_blank">txdot.maps.arcgis.com</a> (ID: b553554a0a0842928936cf41e0721bc5)</p>
</div>

<div class="hero">
  <h2>4. TxDOT Top 100 Congested Roadways</h2>
</div>

<div class="text">
  <p><strong>Nombre del servicio:</strong> TxDOT_Top_100_Congested_Roadways</p>
  <p><strong>Descripción:</strong> Segmentos más congestionados según análisis del Texas A&M Transportation Institute (TTI)</p>
  <p><strong>Frecuencia de actualización:</strong> Anual</p>
  <p><strong>Fuentes combinadas:</strong></p>
  <ul>
    <li>TxDOT GRID (base geométrica)</li>
    <li>TTI (datos de tráfico y velocidad)</li>
  </ul>
  <p><strong>Uso:</strong> Priorización de inversión, planificación de infraestructura</p>
  <p><strong>Responsable:</strong> TPP + TTI</p>
  <p><strong>Tipo de Servicio:</strong> Feature Service</p>
  <p><strong>URL de Item:</strong> <a href="https://txdot.maps.arcgis.com/home/item.html?id=7f23449889f94a539a24ce4f0ac143a8" target="_blank">txdot.maps.arcgis.com</a> (ID: 7f23449889f94a539a24ce4f0ac143a8)</p>
</div>

---

<div class="hero">
  <h2>Fuentes Validadas y Enlaces Oficiales</h2>
</div>

<div class="text">
  <p>Todas las fuentes citadas en este proyecto han sido verificadas y validadas. A continuación, se presenta un resumen consolidado con enlaces directos a las fuentes oficiales.</p>
</div>

<div class="hero">
  <h3>Fuentes Demográficas y Económicas</h3>
</div>

<div class="text">
  <p class="lead"><strong>US Census Bureau</strong></p>
  <ul>
    <li><strong>Decennial Census</strong> (1990, 2000, 2010, 2020) — <a href="https://www.census.gov/programs-surveys/decennial-census.html" target="_blank">census.gov/decennial-census</a></li>
    <li><strong>American Community Survey (ACS) 2022 5-year estimates</strong> — <a href="https://data.census.gov/" target="_blank">data.census.gov</a></li>
    <li><strong>Population Estimates Program (PEP)</strong> — <a href="https://www.census.gov/programs-surveys/popest.html" target="_blank">census.gov/popest</a></li>
    <li><strong>Census Tracts 2020</strong> — Geometrías y datos demográficos — <a href="https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_13" target="_blank">Definición oficial</a></li>
  </ul>

  <p class="lead"><strong>Bureau of Labor Statistics (BLS)</strong></p>
  <ul>
    <li><strong>Local Area Unemployment Statistics (LAUS)</strong> — <a href="https://www.bls.gov/lau/" target="_blank">bls.gov/lau</a></li>
    <li><strong>Consumer Expenditure Survey (CE)</strong> — <a href="https://www.bls.gov/cex/" target="_blank">bls.gov/cex</a></li>
    <li><strong>Consumer Price Index (CPI)</strong> — <a href="https://www.bls.gov/cpi/" target="_blank">bls.gov/cpi</a></li>
  </ul>

  <p class="lead"><strong>USDA Economic Research Service</strong></p>
  <ul>
    <li><strong>Food Expenditure Series (FES)</strong> — <a href="https://www.ers.usda.gov/data-products/food-expenditure-series/" target="_blank">ers.usda.gov/food-expenditure</a></li>
  </ul>

  <p class="lead"><strong>Greater Houston Partnership</strong></p>
  <ul>
    <li><strong>Houston Facts</strong> — Datos económicos y demográficos locales — <a href="https://www.houston.org/houston-data" target="_blank">houston.org/houston-data</a></li>
  </ul>
</div>

<div class="hero">
  <h3>Fuentes de Industria y Tendencias</h3>
</div>

<div class="text">
  <p class="lead"><strong>Prensa y Reconocimientos</strong></p>
  <ul>
    <li><strong>Travel + Leisure (2024)</strong> — "Best U.S. Food Cities" — <a href="https://www.travelandleisure.com/" target="_blank">travelandleisure.com</a></li>
    <li><strong>James Beard Awards (2025)</strong> — Semifinalistas Houston — <a href="https://www.jamesbeard.org/awards" target="_blank">jamesbeard.org/awards</a></li>
    <li><strong>OpenTable / Houston First (2024)</strong> — Repunte 16.9% reservas post-Michelin — <a href="https://www.houstonfirst.com/news/houston-restaurants-may-have-benefited-from-michelin-accolades-in-november" target="_blank">Fuente: Houston First</a></li>
  </ul>

  <p class="lead"><strong>Estudios de Mercado</strong></p>
  <ul>
    <li><strong>National Restaurant Association (2025)</strong> — State of the Restaurant Industry — <a href="https://restaurant.org/research-and-media/research/industry-statistics/" target="_blank">restaurant.org</a></li>
    <li><strong>DoorDash Deep Dish (2024-2025)</strong> — Insights de comportamiento consumidor — <a href="https://get.doordash.com/en-us/blog" target="_blank">DoorDash Blog</a></li>
    <li><strong>Deloitte Restaurant Consumer Trends (2025)</strong> — Frecuencia, precio, preferencias — <a href="https://www2.deloitte.com/us/en/industries/consumer.html" target="_blank">deloitte.com</a></li>
  </ul>
</div>

<div class="hero">
  <h3>Fuentes Técnicas y GIS</h3>
</div>

<div class="text">
  <p class="lead"><strong>Google Maps</strong></p>
  <ul>
    <li><strong>Places API</strong> — Datos de restaurantes (ubicación, price_level, atributos) — <a href="https://developers.google.com/maps/documentation/places/web-service" target="_blank">Google Places Documentation</a></li>
    <li><strong>Popular Times</strong> — Datos de ocupación relativa (obtenidos vía métodos terceros/scraping; no disponible oficialmente en API)</li>
  </ul>

  <p class="lead"><strong>TxDOT (Texas Department of Transportation)</strong></p>
  <ul>
    <li><strong>Congestion (2023)</strong> — <a href="https://txdot.maps.arcgis.com/home/item.html?id=e7b9f8479bfd43ec804a4e09c2e4d8da" target="_blank">ArcGIS Item</a></li>
    <li><strong>Future Congestion (2043)</strong> — <a href="https://txdot.maps.arcgis.com/home/item.html?id=0b0fa1aba6c24570a928fe376acd1ad8" target="_blank">ArcGIS Item</a></li>
    <li><strong>Functional Classification</strong> — <a href="https://txdot.maps.arcgis.com/home/item.html?id=b553554a0a0842928936cf41e0721bc5" target="_blank">ArcGIS Item</a></li>
    <li><strong>Top 100 Congested Roadways</strong> — <a href="https://txdot.maps.arcgis.com/home/item.html?id=7f23449889f94a539a24ce4f0ac143a8" target="_blank">ArcGIS Item</a></li>
  </ul>
</div>

<div class="hero">
  <h3>Notas sobre Metodología</h3>
</div>

<div class="text">
  <ul>
    <li><strong>Hunger Index:</strong> Índice sintético 0-100 construido a partir de patrones de búsqueda (Google Trends), datos de movilidad urbana y ciclos circadianos; calibrado con datos observacionales de QSR y food trucks.</li>
    <li><strong>Datos de menús:</strong> Extracción via OCR/análisis de imágenes públicas de Google Maps; cobertura parcial (~192 restaurantes); validación manual de muestra.</li>
    <li><strong>Agregaciones H3:</strong> Hexágonos de resolución 8 (~0.7 km²) para análisis espacial uniforme e independiente de límites administrativos.</li>
    <li><strong>Proyecciones demográficas:</strong> Modelos basados en tendencias de componentes demográficos (2024-2030); asumen continuidad de patrones migratorios actuales.</li>
  </ul>
</div>

<div class="hero">
  <h3>Fecha de Validación</h3>
</div>

<div class="text">
  <p><strong>Última validación de fuentes:</strong> 29 de octubre de 2024</p>
  <p>Todas las fuentes han sido verificadas como reales y accesibles en línea. Los enlaces pueden cambiar; en caso de enlaces rotos, consultar directamente los sitios oficiales de cada organización.</p>
</div>

---
<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 1.5rem 1rem 2.5rem 1rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  max-width: none;
  font-size: 2.5vw;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.01em;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5em;
  transition: font-size 0.2s, color 0.2s;
}

.hero h2 {
  margin: 0 0 0.3em 0;
  max-width: 32em;
  font-size: 1.35vw;
  font-style: initial;
  font-weight: 600;
  line-height: 1.35;
  color: var(--theme-foreground-muted);
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, var(--theme-foreground-muted), var(--theme-foreground) 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: font-size 0.2s, color 0.2s;
}

.hero h3 {
  margin: 0.2em 0 0.5em 0;
  max-width: 30em;
  font-size: 1.1vw;
  font-weight: 500;
  line-height: 1.3;
  color: var(--theme-foreground-subtle, #64748b);
  letter-spacing: 0.01em;
  background: linear-gradient(90deg, var(--theme-foreground-subtle, #64748b), var(--theme-foreground-muted) 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-style: italic;
  transition: font-size 0.2s, color 0.2s;
}

/* Body text styling aligned with hero aesthetics */
.text {
  font-family: var(--sans-serif);
  margin: 1rem 1rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text p {
  margin: 0.6em 0;
  max-width: none;
  line-height: 1.6;
  color: var(--theme-foreground);
}

.text p.lead {
  max-width: none;
  font-weight: 600;
  color: var(--theme-foreground-muted);
  letter-spacing: -0.005em;
}

.text ul {
  margin: 0.2em 0 0.8em .2em;
  max-width: none;
}

.text li {
  margin: 0.25em 0;
  max-width: none;
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 50px;
  }
  .hero h2 {
    font-size: 28px;
  }
  .hero h3 {
    font-size: 20px;
  }
}

</style>
