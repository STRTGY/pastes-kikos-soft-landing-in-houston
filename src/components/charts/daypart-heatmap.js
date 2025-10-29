import * as Plot from "npm:@observablehq/plot";

export function daypartHeatmap(data, { width, height = 300 } = {}) {
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const daypartOrder = ["Breakfast", "Lunch", "Dinner", "Late-night"];

  const dayMap = {
    Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles", Thursday: "Jueves",
    Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo"
  };

  return Plot.plot({
    width,
    height,
    marginLeft: 90,
    marginBottom: 60,
    x: {
      label: "Día de la semana",
      domain: dayOrder,
      tickFormat: (d) => {
        const shortMap = {
          Monday: "Lun", Tuesday: "Mar", Wednesday: "Mié", Thursday: "Jue",
          Friday: "Vie", Saturday: "Sáb", Sunday: "Dom"
        };
        return shortMap[d] || d;
      }
    },
    y: {
      label: null,
      domain: daypartOrder
    },
    color: {
      scheme: "YlOrRd",
      legend: true,
      label: "Índice de demanda"
    },
    marks: [
      Plot.cell(data, {
        x: "day",
        y: "daypart",
        fill: "value",
        stroke: "white",
        strokeWidth: 0.5,
        tip: {
          fill: "var(--theme-background-alt)",
          stroke: "var(--theme-foreground-muted)"
        },
        title: (d) => `${dayMap[d.day]} - ${d.daypart}\nÍndice: ${d.value}`
      })
    ]
  });
}

export default daypartHeatmap;

