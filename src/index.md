---
toc: false
---

```js
// Mapbox version (swap back to hunger_index.js to use Leaflet)
const { default: hungerIndexMap } = await import("./components/hunger_index_mapbox.js");
```

```js
const restaurantsHou = await FileAttachment("./data/gis/restaurants_houston.geojson").json();
```

```js
// Estilos opcionales
const layerStyles = {
  "Índice de hambre": { borderColor: "#1f2937", borderWidth: 0.25, fillOpacity: 0.55 },
  "Restaurantes": { point: { color: "#ef4444", fillColor: "#f87171", weight: 1, radius: 3, fillOpacity: 0.8 } }
};
```

```js
// Instancia del mapa
const hungerEl = hungerIndexMap({
  center: [29.7604, -95.3698],
  zoom: 11,
  restaurants: restaurantsHou,
  size: { height: 720 },
  cellSizeDegrees: 0.01,
  layerStyles,
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw"
});
```

<div class="hero">
  <h1>Soft Landing de Pastes Kikos en Houston, TX</h1>
  <h2>Índice de Hambre</h2>
</div>

<div class="text">
  <p>El <b>Índice de Hambre</b> es una métrica desarrollada a partir del análisis de los horarios más populares (mayor afluencia o ventas) de los restaurantes que compiten directa e indirectamente con Pastes Kikos en la ciudad de Houston, TX. Este índice permite identificar las zonas y franjas horarias donde la demanda de alimentos es más alta, ayudando a visualizar oportunidades estratégicas para la expansión y posicionamiento de Pastes Kikos en el mercado local.</p>
</div>

<div class="grid grid-cols-1">
  <div class="card">
    ${hungerEl}
  </div>
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
