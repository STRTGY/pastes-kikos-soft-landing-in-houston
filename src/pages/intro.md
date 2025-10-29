---
title: Soft Landing en Houston | Pastes Kikos
theme: [glacier, wide]
sidebar: true
keywords: soft landing, Houston, Pastes Kikos, expansión, mercado, análisis estratégico, gastronomía, demografía, competencia, drive-through, QSR, food trucks, hábitos de consumo, inteligencia territorial, propuesta de valor, precios, sabores, movilidad urbana
---

<div class="memo-header">
  <p><strong>Para:</strong> José Luis</p>
  <p><strong>Fecha:</strong> 4 de junio de 2025</p>
  <p><strong>Asunto:</strong> Estrategia de entrada y expansión para Pastes Kikos en el mercado de Houston</p>
</div>

<div class="hero">
  <h1>Propuesta de Expansión</h1>
  <h2>Pastes Kikos en Houston, Texas</h2>
</div>

<div class="text">
  <p>Este documento presenta la <strong>Propuesta de Expansión de Pastes Kikos en Houston, Texas</strong>, desarrollada bajo un enfoque de investigación territorial y análisis estratégico de mercado. Se enmarca en un <em>soft landing</em>, es decir, un proceso de entrada gradual y estructurado en un nuevo mercado, minimizando riesgos y maximizando las oportunidades de adopción de un producto con características diferenciales.</p>
</div>

<div class="hero">
  <h2>Contexto de la Marca Pastes Kikos</h2>
</div>

<div class="text">
  <p><strong>Pastes Kikos</strong> es una marca mexicana dedicada a la elaboración de pastes: empanadas horneadas de tradición minera con rellenos dulces y salados. La empresa ha construido su identidad en torno a tres pilares:</p>
  <ul>
    <li><strong>Autenticidad:</strong> Rescata la herencia gastronómica de Pachuca, Hidalgo, adaptándola al formato moderno de comida rápida.</li>
    <li><strong>Calidad:</strong> Utiliza ingredientes frescos, sin conservadores, ofreciendo un producto consistente que puede representar una comida completa en dos piezas.</li>
    <li><strong>Versatilidad:</strong> Su portafolio abarca tanto sabores tradicionales (papa con carne, frijol, mole) como opciones dulces y ediciones limitadas.</li>
  </ul>
  <p>Con una operación consolidada en México y un modelo replicable, la marca busca proyectarse internacionalmente destacando la <em>frescura, practicidad y autenticidad mexicana</em> frente a competidores de comida rápida convencional.</p>
</div>

<div class="hero">
  <h2>Objetivos del Proyecto</h2>
</div>

<div class="text">
  <ul>
    <li><strong>Comprender el mercado de Houston</strong> desde una perspectiva macro a micro, considerando corredores gastronómicos, hábitos de consumo, dinámica demográfica y patrones de movilidad.</li>
    <li><strong>Analizar la competencia directa e indirecta</strong>, con especial atención a <em>Pasteko</em> y a otros jugadores de empanadas, hand pies y cadenas de comida rápida.</li>
    <li><strong>Evaluar la propuesta de valor de Pastes Kikos</strong>, su política de precios, formatos y posibles adaptaciones de sabores para el público anglosajón y latino.</li>
    <li><strong>Definir la estrategia de ubicación</strong> tanto para una planta central como para la primera tienda con modelo de <em>drive-through</em>.</li>
    <li><strong>Construir herramientas de análisis interactivo</strong> en Observable Framework, que integren capas geoespaciales, indicadores de competencia y demografía, y un <em>Hunger Index</em> para medir la demanda insatisfecha.</li>
  </ul>
</div>

<div class="hero">
  <h2>Contexto de la Investigación</h2>
</div>

<div class="text">
  <p>Houston es una de las ciudades más diversas y dinámicas de Estados Unidos. Se caracteriza por:</p>
  <ul>
    <li>Un <strong>mercado gastronómico consolidado y competitivo</strong>, con alta presencia de cadenas QSR (<em>Quick Service Restaurants</em>), food trucks y conceptos étnicos.</li>
    <li>Una <strong>demografía multicultural</strong>, con predominancia anglosajona pero con un mercado latino relevante, lo que abre la puerta a sabores auténticamente mexicanos.</li>
    <li><strong>Tendencias de consumo</strong> que privilegian conveniencia, rapidez y delivery: más del 55% del gasto en alimentos en EE. UU. se destina a consumo fuera del hogar, con una fuerte preferencia por pedidos para llevar o a domicilio.</li>
    <li><strong>Infraestructura urbana</strong> que favorece la movilidad en automóvil, lo que hace estratégico el modelo <em>drive-through</em> y la selección de arterias de alto flujo vehicular.</li>
  </ul>
  <p>Con estos elementos, el proyecto busca sentar las bases de una estrategia de expansión realista y competitiva para Pastes Kikos, diferenciándose en calidad, frescura y autenticidad, y utilizando inteligencia territorial y de mercado como soporte para la toma de decisiones.</p>
</div>

---
<style>

.memo-header {
  font-family: var(--sans-serif);
  margin: 1rem 1rem 1.5rem 1rem;
  padding: 1rem;
  background: var(--theme-background-alt);
  border-left: 4px solid var(--theme-foreground-focus);
}

.memo-header p {
  margin: 0.3em 0;
  font-size: 14px;
}

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