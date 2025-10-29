/**
 * Paletas de colores y utilidades para visualizaciones
 */

/**
 * Paleta cualitativa para categorías (12 colores distintos)
 */
export const QUALITATIVE_PALETTE = [
  "#1f77b4", // azul
  "#ff7f0e", // naranja
  "#2ca02c", // verde
  "#d62728", // rojo
  "#9467bd", // púrpura
  "#8c564b", // café
  "#e377c2", // rosa
  "#7f7f7f", // gris
  "#bcbd22", // lima
  "#17becf", // cian
  "#6b7280", // gris oscuro
  "#22c55e"  // verde claro
];

/**
 * Paleta secuencial rojo-azul para choropleths
 */
export const RED_BLUE_SEQUENTIAL = {
  low: "#dc2626",
  high: "#1d4ed8"
};

/**
 * Paleta secuencial rojo oscuro-azul oscuro
 */
export const DARK_RED_BLUE_SEQUENTIAL = {
  low: "#7f1d1d",
  high: "#1e3a8a"
};

/**
 * Paleta para drive-through (gris a rojo)
 */
export const DRIVE_THRU_PALETTE = {
  low: "#f3f4f6",
  high: "#b91c1c"
};

/**
 * Paleta de rojos para heat maps
 */
export const HEAT_PALETTE = {
  start: "#fee2e2",
  mid: "#f87171",
  end: "#7f1d1d"
};

/**
 * Colores para jerarquía vial
 */
export const ROAD_HIERARCHY_COLORS = {
  3: { label: "Principal Arterial (Other)", color: "#4daf4a", weight: 4 },
  4: { label: "Minor Arterial", color: "#984ea3", weight: 2 }
};

/**
 * Colores para puntos de interés
 */
export const POI_COLORS = {
  restaurant: "#ef4444",
  bank: "#3b82f6",
  education: "#8b5cf6",
  government: "#6b7280",
  mall: "#ec4899",
  fuel: "#f59e0b"
};

/**
 * Interpola entre dos colores hex
 * @param {string} color1 - Color inicial en hex (#RRGGBB)
 * @param {string} color2 - Color final en hex (#RRGGBB)
 * @param {number} t - Valor de interpolación entre 0 y 1
 * @returns {string} Color interpolado en hex
 */
export function interpolateColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  
  return rgbToHex(r, g, b);
}

/**
 * Convierte color hex a RGB
 * @param {string} hex - Color en formato hex (#RRGGBB)
 * @returns {Object|null} {r, g, b} o null
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convierte RGB a hex
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {string} Color en formato hex
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Obtiene un color de la paleta cualitativa por índice
 * @param {number} index - Índice del color
 * @returns {string} Color en hex
 */
export function getQualitativeColor(index) {
  return QUALITATIVE_PALETTE[index % QUALITATIVE_PALETTE.length];
}

/**
 * Genera una escala de colores para valores numéricos
 * @param {number} value - Valor a mapear
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {Object} palette - Paleta con propiedades low y high
 * @returns {string} Color en hex
 */
export function getSequentialColor(value, min, max, palette = RED_BLUE_SEQUENTIAL) {
  const t = (value - min) / (max - min);
  return interpolateColor(palette.low, palette.high, t);
}

/**
 * Paleta para demografía (género, diversidad, etc.)
 */
export const DEMOGRAPHICS_PALETTE = {
  male: "#3b82f6",
  female: "#ec4899",
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#6b7280",
  primary: "#1f77b4",
  secondary: "#ff7f0e"
};

/**
 * Paleta para grupos de edad
 */
export const AGE_PALETTE = [
  "#fee2e2", // 0-4
  "#fecaca", // 5-9
  "#fca5a5", // 10-14
  "#f87171", // 15-19
  "#ef4444", // 20-24
  "#dc2626", // 25-29
  "#b91c1c", // 30-34
  "#991b1b", // 35-39
  "#7f1d1d", // 40-44
  "#6b7280", // 45-49
  "#4b5563", // 50-54
  "#374151", // 55-59
  "#1f2937", // 60-64
  "#111827", // 65-69
  "#0c4a6e", // 70-74
  "#075985", // 75-79
  "#0369a1", // 80-84
  "#0284c7"  // 85+
];

/**
 * Paleta para diversidad racial/étnica
 */
export const DIVERSITY_PALETTE = [
  "#1f77b4", // Blanco
  "#ff7f0e", // Hispano
  "#2ca02c", // Afroamericano
  "#d62728", // Asiático
  "#9467bd", // Dos o más
  "#8c564b"  // Otro
];

