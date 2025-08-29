---
title: Industry Evaluation
toc: false
---

```js
const { default: IndustryEvaluationDashboard } = await import("../../components/industry_evaluation_dashboard.js");
```

```js
// Token y estilo (mock). Ajustar cuando se integre en producción.
const MAPBOX_TOKEN = "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw";
const MAPBOX_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";
```

```js
// Carga de datos reales (esquema proporcionado) con saneamiento de NaN → null
const industryRaw = await FileAttachment("../../data/industry_evaluation_houston.json").text();
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
  <h1>Industry Evaluation</h1>
  <h2>Houston Industry Evaluation</h2>
</div>

<div class="text lead">
  <p>Explora el panorama competitivo de restaurantes en Houston. El mapa interactivo filtra dinámicamente las gráficas por zona al pasar el cursor, mostrando categorías, precios, horarios y reseñas.</p>
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
  margin: 1.5rem 1rem 1.5rem 1rem;
  text-align: center;
}

.hero h1 {
  font-size: 42px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin: 0 0 0.4em 0;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0 0 0.2em 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--theme-foreground-muted);
}

.text {
  font-family: var(--sans-serif);
  margin: 0.6rem 1rem 1rem 1rem;
  display: flex;
  justify-content: center;
}

.text p {
  max-width: 70ch;
  line-height: 1.6;
}

.note {
  font-size: 12px;
  color: var(--theme-foreground-muted);
  margin-top: 6px;
}
</style>


