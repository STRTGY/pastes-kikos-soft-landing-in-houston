import * as Plot from "npm:@observablehq/plot";

export function popularTimesHeatmap(data, { width, height = 400, category = null } = {}) {
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const chartData = category && data[category] 
    ? data[category].map(d => ({ ...d, occupancy: d.occupancy || 0 }))
    : data.heatmap || [];

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
      scheme: "Blues",
      domain: [0, 100],
      legend: true,
      label: "Ocupación relativa (%)"
    },
    marks: [
      Plot.cell(chartData, {
        x: "hour",
        y: "day",
        fill: "occupancy",
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
          return `${dayMap[d.day]} ${d.hour}:00\nOcupación: ${d.occupancy}%`;
        }
      })
    ]
  });
}

export default popularTimesHeatmap;

