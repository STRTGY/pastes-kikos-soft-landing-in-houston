---
title: Hábitos de Consumo
theme: [glacier, wide]
toc: false
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana, hunger index, popular times
---

<div class="hero">
  <h1 id="1-2-habitos-de-consumo">1.2 Hábitos de Consumo</h1>
</div>

<div class="text">
  <p>El análisis de hábitos de consumo permite contextualizar cómo, cuándo y por qué los residentes de Houston optan por comida rápida. Se revisan horarios pico de demanda basados en Hunger Index y Google Maps Popular Times, frecuencia de consumo fuera de casa, gasto promedio, importancia relativa de factores como rapidez, precio y calidad de los ingredientes, así como la preferencia por modalidades "para llevar", consumo en sitio o a través de aplicaciones de delivery. Esta información es clave para adaptar la oferta de Kikos al estilo de vida local.</p>
</div>

```js
import { channelsStacked } from "../../components/charts/channels-stacked.js";
import { daypartHeatmap } from "../../components/charts/daypart-heatmap.js";
import { frequencyHist } from "../../components/charts/frequency-hist.js";
import { priceElasticity } from "../../components/charts/price-elasticity.js";
import { hungerHeatmap } from "../../components/charts/hunger-heatmap.js";
import { popularTimesHeatmap } from "../../components/charts/popular-times-heatmap.js";
import { demandBivariate } from "../../components/charts/demand-bivariate.js";
```

```js
// Datasets
const habitos = await FileAttachment("../../data/static/habitos.json").json();
const eventos = await FileAttachment("../../data/static/habitos_timeline.json").json();
const restaurantsCats = await FileAttachment("../../data/consumidor/restaurants_houston_categories.json").json();

const channelsMix = await FileAttachment("../../data/consumidor/channels_mix_2024_2025.json").json();
const daypartData = await FileAttachment("../../data/consumidor/daypart_heatmap.json").json();
const frequencyData = await FileAttachment("../../data/consumidor/frequency_hist.json").json();
const priceSensitivity = await FileAttachment("../../data/consumidor/price_sensitivity.json").json();
const hungerIndex = await FileAttachment("../../data/consumidor/hunger_index.json").json();
const hungerStats = await FileAttachment("../../data/consumidor/hunger_index_stats.json").json();
const popularTimesAgg = await FileAttachment("../../data/consumidor/popular_times_agg.json").json();
const popularTimesByCat = await FileAttachment("../../data/consumidor/popular_times_by_category.json").json();

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
    x: {label: "Cantidad", grid: true},
    y: {label: null},
    marks: [
      Plot.barX(data, {
        x: "cantidad", 
        y: "formato", 
        fill: "#0ea5e9",
        stroke: "white",
        strokeWidth: 1,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${d.formato}: ${d.cantidad.toLocaleString()} establecimientos`,
        opacity: 0.9
      }), 
      Plot.ruleX([0])
    ]
  });
}

function gastoDonut({porcentaje_restaurantes, porcentaje_otros}, {width} = {}) {
  const data = [
    {categoria: "Restaurantes", valor: porcentaje_restaurantes},
    {categoria: "Otros alimentos", valor: porcentaje_otros}
  ];
  return Plot.plot({
    width,
    height: 200,
    marginLeft: 150,
    x: {label: "Porcentaje (%)", domain: [0, 100], grid: true},
    y: {label: null},
    color: {
      legend: true,
      domain: ["Restaurantes", "Otros alimentos"],
      range: ["#0ea5e9", "#8b5cf6"]
    },
    marks: [
      Plot.barX(data, {
        x: "valor",
        y: "categoria",
        fill: "categoria",
        stroke: "white",
        strokeWidth: 1,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${d.categoria}: ${d.valor}%`,
        opacity: 0.9
      }),
      Plot.ruleX([0])
    ]
  });
}

function topCategoriesBarSimple(data, {width, height = 400} = {}) {
  const top10 = data.slice(0, 10).reverse();
  return Plot.plot({
    width,
    height,
    marginLeft: 160,
    x: {label: "Restaurantes", grid: true},
    y: {label: null, domain: top10.map((d) => d.categoria)},
    color: {scheme: "blues"},
    marks: [
      Plot.barX(top10, {
        x: "cantidad", 
        y: "categoria", 
        fill: "#0ea5e9",
        stroke: "white",
        strokeWidth: 1,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${d.categoria}: ${d.cantidad.toLocaleString()} restaurantes`,
        opacity: 0.9
      }),
      Plot.ruleX([0])
    ]
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

```js
// UI Controls
const selectedCategory = view(Inputs.select(
  ["Agregado", "QSR", "Food Truck", "Food Hall"],
  {label: "Categoría Popular Times", value: "Agregado"}
));
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

<div class="grid grid-cols-2" style="margin-top: 1rem;">
  ${kpiCard("Ocasiones/semana (media)", frequencyData.mean, "veces")}
  ${kpiCard("Mejor franja lunch", `${hungerStats.best_lunch_windows[0].day.slice(0,3)} ${hungerStats.best_lunch_windows[0].start}–${hungerStats.best_lunch_windows[0].end}h`)}
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

<div class="hero">
  <h3 id="canales-de-consumo">Canales de consumo: Dine-in, Takeout y Delivery (2024-2025)</h3>
</div>

<div class="text">
  <p>El mix de canales muestra una evolución hacia formatos off-premise. Entre 2024 y 2025, el takeout creció 2 puntos porcentuales, mientras que el dine-in retrocedió levemente. El delivery se mantiene estable en 27%, reflejando la consolidación de plataformas digitales como DoorDash y Uber Eats.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => channelsStacked(channelsMix, {width, height: 320}))}
  </div>
</div>

<div class="hero">
  <h3 id="frecuencia-de-consumo">Frecuencia de consumo fuera de casa</h3>
</div>

<div class="text">
  <p>Los consumidores de Houston comen fuera de casa en promedio <strong>${frequencyData.mean} veces por semana</strong> (mediana: ${frequencyData.median}). La distribución muestra un pico en 3-4 ocasiones semanales, con segmentos de alta frecuencia (5+ veces) representando un mercado objetivo atractivo para QSR.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => frequencyHist(frequencyData, {width, height: 350}))}
  </div>
</div>

<div class="hero">
  <h3 id="sensibilidad-al-precio">Sensibilidad al precio y elasticidad de demanda</h3>
</div>

<div class="text">
  <p>El análisis de elasticidad-precio muestra una relación inversa entre ticket promedio y frecuencia de visitas. Un punto de precio baseline de <strong>$${priceSensitivity.baseline_price}</strong> genera ${priceSensitivity.baseline_visits} visitas/mes. Cada dólar de incremento reduce la demanda aproximadamente un 10-12%, evidenciando sensibilidad moderada-alta en el segmento QSR.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => priceElasticity(priceSensitivity, {width, height: 350}))}
  </div>
</div>

<div class="hero">
  <h3 id="top-categorias-houston">Top categorías culinarias en Houston</h3>
</div>

<div class="text">
  <p>La diversidad gastronómica de Houston se refleja en la distribución de categorías. Mexican, American y Chinese lideran, seguidos por Vietnamese e Italian. Esta variedad resalta la oportunidad para conceptos de fusión y ofertas especializadas.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => topCategoriesBarSimple(restaurantsCats, {width, height: 450}))}
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

<div class="hero">
  <h3 id="dayparts-demanda">Demanda por franja horaria (dayparts)</h3>
</div>

<div class="text">
  <p>El mapa de calor de dayparts revela patrones claros: <strong>Lunch (11-14h) lidera en todos los días laborales</strong>, con picos máximos los jueves y viernes. Dinner domina fines de semana, especialmente sábados. Late-night cobra relevancia viernes y sábado, sugiriendo oportunidad para extensión de horarios.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => daypartHeatmap(daypartData, {width, height: 320}))}
  </div>
</div>

<div class="hero">
  <h3 id="hunger-index">Hunger Index: Apetito agregado por hora y día</h3>
</div>

<div class="text">
  <p>El Hunger Index (0-100) estima la demanda potencial de alimentos en Houston basándose en patrones de búsqueda, movilidad y datos sociodemográficos. Los <strong>picos ocurren a las 12:00h (almuerzo) y 19:00h (cena)</strong>, con máximos absolutos en jueves mediodía (índice 100) y sábado noche (índice 100). Las mejores franjas de lunch son jueves, miércoles y martes entre 11-14h.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => hungerHeatmap(hungerIndex.heatmap, {width, height: 420}))}
  </div>
</div>

<div class="grid grid-cols-3" style="margin-top: 1rem;">
  <div class="card">
    <h2>Pico absoluto</h2>
    <span class="big" style="color: var(--theme-foreground-focus);">100</span>
    <p style="margin-top: 0.5rem;">Thu 12:00 & Sat 19:00</p>
  </div>
  <div class="card">
    <h2>Promedio semanal</h2>
    <span class="big">${hungerStats.weekly_avg}</span>
  </div>
  <div class="card">
    <h2>Weekend boost</h2>
    <span class="big" style="color: #10b981;">+${(hungerStats.weekend_avg - hungerStats.weekday_avg).toFixed(1)}</span>
    <p style="margin-top: 0.5rem;">vs. weekday</p>
  </div>
</div>

<div class="hero">
  <h3 id="popular-times">Google Maps Popular Times: Ocupación real por categoría</h3>
</div>

<div class="text">
  <p>Los datos de Google Maps Popular Times muestran la ocupación observada en POIs de Houston. Seleccione una categoría para ver el patrón específico. <strong>QSR</strong> muestra ocupación alta en lunch y cena; <strong>Food Trucks</strong> picos en lunch; <strong>Food Halls</strong> dominan noches de jueves-sábado.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    <p style="text-align: center; margin-bottom: 1rem;"><strong>Categoría seleccionada: ${selectedCategory}</strong></p>
    ${resize((width) => {
      const catMap = {"QSR": "QSR", "Food Truck": "Food Truck", "Food Hall": "Food Hall", "Agregado": null};
      const cat = catMap[selectedCategory];
      return popularTimesHeatmap(cat ? popularTimesByCat : popularTimesAgg, {width, height: 420, category: cat});
    })}
  </div>
</div>

<div class="hero">
  <h3 id="demanda-combinada">Análisis combinado: Hunger vs. Ocupación (oportunidades)</h3>
</div>

<div class="text">
  <p>El gráfico bivariado cruza Hunger Index (demanda potencial) con ocupación observada (Popular Times). Los puntos en <strong>zona superior-izquierda (alto hunger, baja ocupación)</strong> representan ventanas de oportunidad donde existe demanda insatisfecha. Los círculos rojos destacan las 20 mejores oportunidades, principalmente en <strong>horarios de transición (10-11h, 15-17h)</strong> y madrugadas de fin de semana.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => demandBivariate(hungerIndex.heatmap, popularTimesAgg.heatmap, {width, height: 450}))}
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
    <li><strong>Dónde</strong>: priorizar corredores con alto flujo de lunch (Thu-Wed 11-14h según Hunger Index); proximidad a hubs de oficinas y eventos.</li>
    <li><strong>Cómo</strong>: iniciar con food truck o pop-up para validar demanda en franjas de oportunidad (10-11h, 15-17h); escalar a QSR en micro-mercados validados; evaluar food hall para awareness y PR en weekend nights.</li>
    <li><strong>Cuándo</strong>: reforzar lunch (pico Thu 12h) y cena fines de semana (Sat 19-21h); extender horarios en calendarios de eventos; experimentar late-night Fri-Sat (22-01h).</li>
    <li><strong>Menú y precio</strong>: punto óptimo <strong>$8-10</strong> por ticket (balance demanda-margen); ofrecer core rápido/asequible, opciones light/plant-based y combos para frecuencias altas (3-5x/sem).</li>
    <li><strong>Canales</strong>: delivery y pickup desde el día 1 (27% mercado off-premise); contenido en IG/TikTok con creators locales; aprovechar plataformas para targeting daypart.</li>
    <li><strong>Métricas</strong>: monitorear ocupación vs. hunger gap; testear precios en rangos $6-12; trackear conversión por daypart y canal; ligar decisiones a KPIs de gasto y formatos.</li>
  </ul>
</div>

<div class="hero">
  <h3 id="fuentes">Fuentes y metodología</h3>
</div>

<div class="text">
  <ul>
    <li><strong>Travel + Leisure (2024):</strong> "Best U.S. Food Cities" — Houston — <a href="https://www.travelandleisure.com/" target="_blank">travelandleisure.com</a></li>
    <li><strong>OpenTable / Houston First (2024):</strong> repunte de 16.9% en reservas tras estrellas Michelin en Houston (noviembre 2024) — <a href="https://www.houstonfirst.com/news/houston-restaurants-may-have-benefited-from-michelin-accolades-in-november" target="_blank">Fuente: Houston First</a></li>
    <li><strong>James Beard Awards (2025):</strong> nominaciones semifinalistas Houston — <a href="https://www.jamesbeard.org/awards" target="_blank">jamesbeard.org</a></li>
    <li><strong>BLS Consumer Price Index (2024-2025):</strong> índices de inflación Food-at-Home vs Food-Away-from-Home — <a href="https://www.bls.gov/cpi/" target="_blank">bls.gov/cpi</a></li>
    <li><strong>National Restaurant Association (2025):</strong> State of the Restaurant Industry — mix de canales, tendencias off-premise — <a href="https://restaurant.org/research-and-media/research/industry-statistics/" target="_blank">restaurant.org</a></li>
    <li><strong>DoorDash Deep Dish (2024-2025):</strong> reportes de comportamiento de consumidor y ordering trends — <a href="https://get.doordash.com/en-us/blog" target="_blank">DoorDash Blog</a></li>
    <li><strong>Deloitte Restaurant Consumer Trends (2025):</strong> frecuencia de consumo, sensibilidad a precio, preferencias digitales — <a href="https://www2.deloitte.com/us/en/industries/consumer.html" target="_blank">deloitte.com</a></li>
    <li><strong>Greater Houston Partnership / U.S. Census ACS (2024):</strong> demografía, ingreso mediano, composición de fuerza laboral — <a href="https://www.houston.org/houston-data" target="_blank">houston.org</a> / <a href="https://data.census.gov/" target="_blank">data.census.gov</a></li>
    <li><strong>Hunger Index (metodología):</strong> índice sintético 0-100 construido a partir de patrones de búsqueda (Google Trends: "restaurants near me", "food delivery"), datos de movilidad urbana agregados y ciclos circadianos. Calibrado con data observacional de transacciones en QSR y food trucks en mercados comparables.</li>
    <li><strong>Google Maps Popular Times (metodología):</strong> datos agregados de ocupación relativa por hora/día basados en información pública de Google Maps. <em>Nota:</em> Popular Times no está disponible oficialmente en la Places API; los datos fueron obtenidos mediante métodos de scraping/terceros y agregados por categoría (QSR, Food Truck, Food Hall) ponderando por número de reviews y rating para estimar ocupación promedio citywide.</li>
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
