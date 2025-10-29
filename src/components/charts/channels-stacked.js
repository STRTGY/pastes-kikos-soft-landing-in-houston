import * as Plot from "npm:@observablehq/plot";

export function channelsStacked(data, { width, height = 300 } = {}) {
  const transformed = data.flatMap((d) => [
    { year: d.year, channel: "Dine-in", value: d.dine_in },
    { year: d.year, channel: "Takeout", value: d.takeout },
    { year: d.year, channel: "Delivery", value: d.delivery }
  ]);

  return Plot.plot({
    width,
    height,
    marginBottom: 50,
    x: { label: "Año" },
    y: { label: "% de ocasiones", grid: true, domain: [0, 100] },
    color: { 
      legend: true, 
      domain: ["Dine-in", "Takeout", "Delivery"],
      range: ["#0ea5e9", "#8b5cf6", "#f59e0b"]
    },
    marks: [
      Plot.barY(transformed, {
        x: "year",
        y: "value",
        fill: "channel",
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${d.year} - ${d.channel}: ${d.value}%`,
        opacity: 0.9
      }),
      Plot.ruleY([0])
    ]
  });
}

export default channelsStacked;

