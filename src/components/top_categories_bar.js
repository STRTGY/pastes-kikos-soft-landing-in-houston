import * as Plot from "npm:@observablehq/plot";

function extractCategory(properties) {
  if (!properties || typeof properties !== "object") return null;
  const candidates = [
    properties.categoryName,
    properties.category,
    properties.subcategory,
    properties.categories,
    properties.type,
    properties.Type,
    properties.Cuisine,
    properties.cuisine
  ];
  let value = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  if (!value && Array.isArray(properties.categories)) {
    value = properties.categories.filter((s) => typeof s === "string" && s.trim().length > 0)[0];
  }
  if (Array.isArray(value)) {
    value = value.filter((s) => typeof s === "string" && s.trim().length > 0).join(", ");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return null;
}

export function topCategoriesBar(restaurantsGeoJSON, { width, height = 300 } = {}) {
  const features = (restaurantsGeoJSON && restaurantsGeoJSON.features) || [];
  const counts = new Map();
  for (const f of features) {
    try {
      const c = extractCategory(f?.properties) || "Sin categoría";
      counts.set(c, (counts.get(c) || 0) + 1);
    } catch {
      // ignore feature errors
    }
  }
  const rows = Array.from(counts, ([categoria, cantidad]) => ({ categoria, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)
    .reverse(); // reverse so the largest appears on top in barX

  return Plot.plot({
    width,
    height,
    marginLeft: 160,
    x: { label: "Restaurantes" },
    y: { label: null, domain: rows.map((d) => d.categoria) },
    color: { scheme: "blues" },
    marks: [
      Plot.barX(rows, { x: "cantidad", y: "categoria", tip: true }),
      Plot.ruleX([0])
    ]
  });
}

export default topCategoriesBar;


