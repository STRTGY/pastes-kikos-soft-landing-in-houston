---
title: Hábitos de Consumo
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

<div class="hero">
  <h1 id="1-3-habitos-de-consumo">1.3 Hábitos de Consumo</h1>
</div>

<div class="text">
  <p>El análisis de hábitos de consumo permite contextualizar cómo, cuándo y por qué los residentes de Houston optan por comida rápida. Se revisan horarios pico de demanda, frecuencia de consumo fuera de casa, gasto promedio, importancia relativa de factores como rapidez, precio y calidad de los ingredientes, así como la preferencia por modalidades “para llevar”, consumo en sitio o a través de aplicaciones de delivery. Esta información es clave para adaptar la oferta de Kikos al estilo de vida local.</p>
  
</div>

```js
// Datos de hábitos y eventos
const habitos = await FileAttachment("../../data/habitos.json").json();
const eventos = await FileAttachment("../../data/habitos_timeline.json").json();

// GeoJSON de restaurantes y componente de barras Top 10
const restaurantsHou = await FileAttachment("../../data/gis/restaurants_houston.geojson").json();
const { topCategoriesBar } = await import("../../components/top_categories_bar.js");

// Helpers UI
function kpiCard(title, value, suffix = "") {
  const formatted = typeof value === "number" ? value.toLocaleString("es-MX") : value;
  return html`<div class="card"><h2>${title}</h2><span class="big">${formatted}${suffix ? ` ${suffix}` : ""}</span></div>`;
}

// Charts
function formatosChart(data, {width} = {}) {
  return Plot.plot({
    width,
    height: 260,
    marginLeft: 110,
    x: {label: "Cantidad"},
    y: {label: null},
    marks: [Plot.barX(data, {x: "cantidad", y: "formato", tip: true}), Plot.ruleX([0])]
  });
}

function gastoDonut({porcentaje_restaurantes, porcentaje_otros}, {width} = {}) {
  const pie = [
    {categoria: "Restaurantes", valor: porcentaje_restaurantes},
    {categoria: "Otros alimentos", valor: porcentaje_otros}
  ];
  return Plot.plot({
    width,
    height: 240,
    color: {legend: true},
    marks: [Plot.arc(pie, {theta: "valor", fill: "categoria", innerRadius: 70, tip: true})]
  });
}

function timelineEventos(rows, {width} = {}) {
  const data = rows.map((d) => ({...d, fecha: new Date(d.fecha)}));
  return Plot.plot({
    width,
    height: 200,
    x: {type: "utc"},
    y: {axis: null},
    marks: [
      Plot.ruleX(data, {x: "fecha"}),
      Plot.text(data, {x: "fecha", y: 0, text: (d) => `${d.evento}`, dy: -10}),
      Plot.text(data, {x: "fecha", y: 0, text: (d) => `${d.nota}`, dy: 10, fill: "currentColor", opacity: 0.7})
    ]
  });
}
```

<div class="hero">
  <h3 id="kpis-clave">KPIs clave</h3>
</div>

<div class="grid grid-cols-4">
  ${kpiCard("Gasto anual por persona", habitos.gasto_anual, "USD")}
  ${kpiCard("% gasto en restaurantes", habitos.porcentaje_restaurantes, "%")}
  ${kpiCard("Consumidores que reducirán gasto", habitos.inflacion_reduce_gasto_pct, "%")}
  ${kpiCard("Restaurantes / cocinas", `${habitos.restaurantes_total.toLocaleString("es-MX")} / ${habitos.cocinas_representadas}`)}
  
</div>

<div class="hero">
  <h2 id="analisis-de-los-habitos-de-consumo-en-restaurantes-en-houston-tx-2024-2025">Análisis de los Hábitos de Consumo en Restaurantes en Houston, TX 2024-2025</h2>
</div>
<div class="hero">
  <h3 id="introduccion">Introducción</h3>
</div>

<div class="text">
  <p>Houston, TX, se ha consolidado como una capital culinaria de primer nivel en Estados Unidos, reconocida por su diversidad, innovación y vibrante escena gastronómica. Nombrada una de las "Mejores Ciudades Gastronómicas de EE. UU." por Travel + Leisure en 2024, la ciudad presenta un panorama complejo y dinámico, marcado por un alto gasto de los consumidores, la influencia de una población multicultural y una rápida adopción de nuevas tecnologías. Este reporte analiza los hallazgos más relevantes sobre los hábitos de consumo, las tendencias emergentes y los factores que definen el mercado de restaurantes en Houston.</p>
  
  <p class="lead"><strong>1. Hábitos de Gasto y Comportamiento del Consumidor</strong></p>
  <p>Los residentes de Houston demuestran un fuerte compromiso con la gastronomía, asignando una porción significativa de su presupuesto a comer fuera. Sin embargo, este hábito se ve moderado por las presiones económicas actuales.</p>
  <ul>
    <li><strong>Gasto Elevado:</strong> Houston ocupa el noveno lugar a nivel nacional en gasto en restaurantes. En promedio, un residente invierte $776 dólares al año (aproximadamente $65 al mes), lo que constituye un 31.72% de su gasto total en alimentos.</li>
    <li><strong>Impacto de la Inflación:</strong> La ciudad ha sido clasificada como la segunda más cara de EE. UU. para la compra de alimentos, con un costo semanal promedio superior a los $300. Como consecuencia, casi el 50% de los consumidores planean reducir sus gastos en restaurantes para mitigar el impacto de la inflación.</li>
  </ul>
</div>

<div class="hero">
  <h3 id="distribucion-del-gasto-en-alimentos">Distribución del gasto en alimentos</h3>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => gastoDonut(habitos, {width}))}
  </div>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => topCategoriesBar(restaurantsHou, { width, height: 450 }))}
  </div>
</div>

<div class="text">
  <p class="lead"><strong>2. Paisaje Culinario: Diversidad y Tendencias Emergentes</strong></p> 
  <p>La oferta gastronómica de Houston es un reflejo de su diversidad cultural, combinando tradición con tendencias de vanguardia.</p>
  <p><strong>Diversidad Cultural:</strong> La ciudad alberga aproximadamente 11,000 restaurantes que representan más de 70 culturas diferentes. Las cocinas más destacadas incluyen Tex-Mex, barbacoa, criolla, vietnamita, india, de Medio Oriente, africana y asiática.</p>
  <p class="lead"><strong>Formatos Populares:</strong></p>
  <ul>
    <li><strong>Comida Rápida (QSR):</strong> Houston lidera como la ciudad con más sucursales de las nueve cadenas de comida rápida más grandes de EE. UU., con un total de 558 establecimientos.</li>
    <li><strong>Food Trucks:</strong> Con más de 700 food trucks operativos, este formato se ha consolidado como una opción accesible y diversa para los consumidores.</li>
    <li><strong>Food Halls:</strong> Espacios como Bravery Chef Hall y The Heights Mercantile funcionan como incubadoras de talento y centros de innovación culinaria.</li>
  </ul>
  <p class="lead"><strong>Tendencias de Consumo:</strong></p>
  <ul>
    <li><strong>Cocina de Fusión y Experiencial:</strong> Existe una fuerte inclinación hacia conceptos que ofrecen una experiencia, como el Korean BBQ y el hotpot, así como platos de fusión que combinan tradiciones culinarias.</li>
    <li><strong>Opciones Saludables y Sostenibles:</strong> Ha crecido la demanda de opciones veganas, basadas en plantas y alimentos funcionales. La sostenibilidad, incluyendo la reducción de desperdicios y el uso de empaques ecológicos, es una prioridad para 2025.</li>
  </ul>
</div>

<div class="hero">
  <h3 id="formatos-populares-visualizacion">Formatos populares (visualización)</h3>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => formatosChart(habitos.formatos, {width}))}
  </div>
</div>

<div class="text">
  <p class="lead"><strong>3. Influencia de la Tecnología y la Cultura Digital</strong></p>
  <p>La tecnología está transformando la manera en que los restaurantes operan y cómo los consumidores descubren y acceden a la comida.</p>
  <ul>
    <li><strong>Redes Sociales como Catálogo:</strong> Plataformas como Instagram y TikTok son herramientas clave para el marketing de restaurantes y el descubrimiento de nuevas experiencias por parte de los comensales.</li>
    <li><strong>Optimización con IA y Automatización:</strong> La adopción de inteligencia artificial en la cocina está ayudando a los restaurantes a optimizar procesos, reducir costos y mejorar la consistencia de sus platillos.</li>
    <li><strong>Personalización y Pedidos Digitales:</strong> Las plataformas de entrega de comida continúan creciendo, ofreciendo conveniencia y personalización basada en el historial y las preferencias dietéticas de los usuarios.</li>
  </ul>
</div>

<div class="hero">
  <h3 id="tecnologia-y-cultura-digital-resumen-visual">Tecnología y cultura digital (resumen visual)</h3>
</div>

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Descubrimiento</h2>
    <p style="font-size:24px;">📱</p>
    <p>Redes sociales impulsan awareness y prueba (IG, TikTok).</p>
  </div>
  <div class="card">
    <h2>Eficiencia</h2>
    <p style="font-size:24px;">🤖</p>
    <p>IA y estandarización para consistencia y costo.</p>
  </div>
  <div class="card">
    <h2>Conveniencia</h2>
    <p style="font-size:24px;">🛍️</p>
    <p>Delivery y pickup con personalización desde el día 1.</p>
  </div>
</div>

<div class="text">
  <p class="lead"><strong>4. Reconocimientos y Vitalidad de la Escena Local (2024-2025)</strong></p>
  <p>Los recientes galardones y la activa agenda de eventos confirman el estatus de Houston como un epicentro gastronómico.</p>
  <ul>
    <li><strong>Premios Michelin:</strong> La llegada de las estrellas Michelin en noviembre de 2024 (con 6 restaurantes galardonados) generó un aumento del 16.9% en las reservas de OpenTable el mes siguiente.</li>
    <li><strong>James Beard Awards:</strong> Houston obtuvo 13 nominaciones semifinalistas para los premios de 2025, reconociendo a restaurantes, panaderías y programas de bebidas.</li>
    <li><strong>Festivales Culinarios:</strong> La ciudad mantiene una agenda robusta con eventos como el Houston Rodeo, FoodieLand, Taco Fest y las Latin Restaurant Weeks, que celebran y promueven la rica herencia culinaria latina.</li>
  </ul>
</div>

<div class="hero">
  <h3 id="linea-de-tiempo-2024-2025">Línea de tiempo 2024–2025</h3>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => timelineEventos(eventos, {width}))}
  </div>
</div>

<div class="text">
  <p class="lead"><strong>Conclusión y Perspectivas a Futuro</strong></p>
  <p>El panorama de restaurantes en Houston es resiliente y se encuentra en constante evolución. A pesar de los desafíos económicos como la inflación, los consumidores continúan valorando las experiencias culinarias, impulsando un mercado diverso y competitivo. Las tendencias clave para el futuro cercano serán la sostenibilidad, la integración tecnológica para mejorar la eficiencia y la personalización, y la continua celebración de la diversidad cultural a través de la comida. La ciudad está bien posicionada para mantener su reputación como un líder gastronómico nacional.</p>
</div>

<div class="hero">
  <h3 id="recomendaciones-accionables">Recomendaciones accionables</h3>
</div>

<div class="text">
  <ul>
    <li><strong>Dónde</strong>: priorizar corredores con alto flujo de lunch y fines de semana; proximidad a hubs de oficinas y eventos.</li>
    <li><strong>Cómo</strong>: iniciar con food truck o pop-up para validar demanda; escalar a QSR en micro-mercados validados; evaluar food hall para awareness y PR.</li>
    <li><strong>Cuándo</strong>: reforzar lunch y tarde-noche; extender horarios en calendarios de eventos; experimentar brunch fines de semana.</li>
    <li><strong>Menú y precio</strong>: ofrecer core rápido/asequible, opciones light/plant-based y combos.</li>
    <li><strong>Canales</strong>: delivery y pickup desde el día 1; contenido en IG/TikTok con creators locales.</li>
    <li><strong>Métricas</strong>: ligar decisiones a KPIs de gasto y formatos; monitorear reservas/eventos (timeline).</li>
  </ul>
</div>

<div class="hero">
  <h3 id="fuentes">Fuentes</h3>
</div>

<div class="text">
  <ul>
    <li>Travel + Leisure (2024): “Best U.S. Food Cities” — Houston.</li>
    <li>OpenTable (2024): repunte de 16.9% tras estrellas Michelin.</li>
    <li>James Beard Awards (2025): nominaciones Houston.</li>
    <li>Indicadores de costo de alimentos e inflación en Houston (2024–2025).</li>
  </ul>
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

.introduction p {
  margin: 0;
  max-width: none;
  

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
    max-width: none;
  }
}

</style>
