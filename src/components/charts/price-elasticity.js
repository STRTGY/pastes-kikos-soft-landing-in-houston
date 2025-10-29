import * as Plot from "npm:@observablehq/plot";

export function priceElasticity(data, { width, height = 300 } = {}) {
  const { scenarios, baseline_price, baseline_visits } = data;

  return Plot.plot({
    width,
    height,
    marginBottom: 60,
    marginLeft: 60,
    x: { label: "Precio promedio (USD)", grid: true },
    y: { label: "Visitas por mes", grid: true },
    marks: [
      Plot.line(scenarios, {
        x: "price",
        y: "visits_per_month",
        stroke: "#8b5cf6",
        strokeWidth: 3,
        curve: "catmull-rom"
      }),
      Plot.dot(scenarios, {
        x: "price",
        y: "visits_per_month",
        fill: "#8b5cf6",
        stroke: "white",
        strokeWidth: 2,
        r: 5,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `$${d.price} → ${d.visits_per_month} visitas/mes\nElasticidad: ${d.elasticity}`
      }),
      Plot.dot([{ price: baseline_price, visits: baseline_visits }], {
        x: "price",
        y: "visits",
        fill: "#ef4444",
        r: 8,
        stroke: "#fff",
        strokeWidth: 3
      }),
      Plot.text([{ price: baseline_price, visits: baseline_visits, label: "Baseline" }], {
        x: "price",
        y: "visits",
        text: "label",
        dy: -18,
        fill: "#ef4444",
        fontWeight: "bold",
        fontSize: 12
      })
    ]
  });
}

export default priceElasticity;

