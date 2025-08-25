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
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
