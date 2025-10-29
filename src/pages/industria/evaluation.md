---
title: Industry Evaluation
toc: false
---

```js
const { default: IndustryEvaluationDashboard } = await import("../../components/dashboards/industry-evaluation.js");
```

```js
import { MAP_DEFAULTS } from "../../config/maps.js";
const { mapboxToken: MAPBOX_TOKEN, mapboxStyle: MAPBOX_STYLE } = MAP_DEFAULTS;
```

```js
const industryRaw = await FileAttachment("../../data/static/industry_evaluation_houston.json").text();
const industryData = JSON.parse(industryRaw.replace(/\bNaN\b/g, "null"));
```

```js
const dashboardEl = IndustryEvaluationDashboard({
  center: [29.7604, -95.3698],
  zoom: 11,
  size: { height: 900 },
  mapboxStyle: MAPBOX_STYLE,
  mapboxToken: MAPBOX_TOKEN,
  data: industryData
});
```

<div class="hero">
  <h1>2.0 Industry Evaluation</h1>
  <h2>Houston Industry Evaluation</h2>
</div>

<div class="text">
  <p class="lead">Explora el panorama competitivo de restaurantes en Houston. El mapa interactivo filtra dinámicamente las gráficas por zona al pasar el cursor, mostrando categorías, precios, horarios y reseñas.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${dashboardEl}
  </div>
  <div class="note">Nota: Los datos son mock-ups con fines de diseño; la integración de datos reales seguirá esta estructura.</div>
  
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

.note {
  font-size: 12px;
  color: var(--theme-foreground-muted);
  margin-top: 6px;
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


