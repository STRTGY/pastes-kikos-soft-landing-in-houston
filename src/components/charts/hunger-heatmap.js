import * as Plot from "npm:@observablehq/plot";

export function hungerHeatmap(data, { width, height = 400 } = {}) {
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return Plot.plot({
    width,
    height,
    marginLeft: 80,
    marginBottom: 60,
    x: {
      label: "Hora del día",
      domain: hours,
      tickFormat: (h) => `${h}:00`
    },
    y: {
      label: null,
      domain: dayOrder,
      tickFormat: (d) => {
        const map = {
          Monday: "Lun", Tuesday: "Mar", Wednesday: "Mié", Thursday: "Jue",
          Friday: "Vie", Saturday: "Sáb", Sunday: "Dom"
        };
        return map[d] || d;
      }
    },
    color: {
      type: "linear",
      scheme: "RdYlGn",
      domain: [0, 100],
      legend: true,
      label: "Hunger Index (0-100)"
    },
    marks: [
      Plot.cell(data, {
        x: "hour",
        y: "day",
        fill: "index",
        stroke: "white",
        strokeWidth: 0.5,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => {
          const dayMap = {
            Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles",
            Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo"
          };
          return `${dayMap[d.day]} ${d.hour}:00\nHunger Index: ${d.index}/100`;
        }
      })
    ]
  });
}

export default hungerHeatmap;

