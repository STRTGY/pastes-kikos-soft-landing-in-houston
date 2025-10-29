import * as Plot from "npm:@observablehq/plot";

export function demandBivariate(hungerData, popularTimesData, { width, height = 400 } = {}) {
  const combined = hungerData.map((h) => {
    const pt = popularTimesData.find((p) => p.day === h.day && p.hour === h.hour);
    return {
      day: h.day,
      hour: h.hour,
      hunger: h.index,
      occupancy: pt ? pt.occupancy : 0,
      opportunity: h.index - (pt ? pt.occupancy : 0)
    };
  });

  const opportunities = combined
    .filter((d) => d.opportunity > 15)
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 20);

  return Plot.plot({
    width,
    height,
    marginLeft: 60,
    marginBottom: 60,
    x: { label: "Ocupación actual (%)", grid: true },
    y: { label: "Hunger Index", grid: true },
    color: {
      type: "linear",
      scheme: "RdYlGn",
      domain: [-20, 40],
      legend: true,
      label: "Gap (Hunger - Ocupación)"
    },
    marks: [
      Plot.dot(combined, {
        x: "occupancy",
        y: "hunger",
        fill: "opportunity",
        stroke: "white",
        strokeWidth: 0.5,
        r: 4,
        opacity: 0.8,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => {
          const dayMap = {
            Monday: "Lun", Tuesday: "Mar", Wednesday: "Mié",
            Thursday: "Jue", Friday: "Vie", Saturday: "Sáb", Sunday: "Dom"
          };
          return `${dayMap[d.day]} ${d.hour}:00\nHunger: ${d.hunger} | Ocupación: ${d.occupancy}\nGap: ${d.opportunity > 0 ? '+' : ''}${d.opportunity}`;
        }
      }),
      Plot.dot(opportunities, {
        x: "occupancy",
        y: "hunger",
        r: 7,
        stroke: "#ef4444",
        strokeWidth: 2.5,
        fill: "none"
      }),
      Plot.line([{ x: 0, y: 0 }, { x: 100, y: 100 }], {
        x: "x",
        y: "y",
        stroke: "#94a3b8",
        strokeDasharray: "4,4",
        strokeWidth: 1.5,
        opacity: 0.5
      })
    ]
  });
}

export default demandBivariate;

