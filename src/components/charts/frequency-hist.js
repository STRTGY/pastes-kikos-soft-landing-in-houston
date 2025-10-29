import * as Plot from "npm:@observablehq/plot";

export function frequencyHist(data, { width, height = 300 } = {}) {
  const { distribution, mean, median } = data;

  return Plot.plot({
    width,
    height,
    marginBottom: 60,
    x: { label: "Ocasiones por semana", grid: true },
    y: { label: "Número de consumidores", grid: true },
    marks: [
      Plot.barY(distribution, {
        x: "occasions_per_week",
        y: "count",
        fill: "#0ea5e9",
        stroke: "white",
        strokeWidth: 1,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${d.occasions_per_week} veces/semana\n${d.count.toLocaleString()} consumidores`,
        opacity: 0.9
      }),
      Plot.ruleX([mean], { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "4,4" }),
      Plot.ruleX([median], { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "4,4" }),
      Plot.text([{ x: mean, y: 850, label: `Media: ${mean}` }], {
        x: "x",
        y: "y",
        text: "label",
        fill: "#ef4444",
        dx: 5,
        dy: -5,
        fontWeight: "bold"
      }),
      Plot.text([{ x: median, y: 800, label: `Mediana: ${median}` }], {
        x: "x",
        y: "y",
        text: "label",
        fill: "#10b981",
        dx: 5,
        dy: -5,
        fontWeight: "bold"
      }),
      Plot.ruleY([0])
    ]
  });
}

export default frequencyHist;

