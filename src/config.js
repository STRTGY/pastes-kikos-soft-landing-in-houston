/**
 * Configuración global del proyecto
 * Pastes Kikos - Soft Landing en Houston
 */

// Mapbox Configuration
export const MAPBOX_TOKEN = "pk.eyJ1IjoiZmVpcG93ZXIiLCJhIjoiY21jeHVyaHJyMGdnbjJrb2tzZWlwaXh1dyJ9.gp0JyqMwW4czxwqqZQUOtw";
export const MAPBOX_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";

// Houston Geographic Center
export const HOUSTON_CENTER = [29.7604, -95.3698];
export const DEFAULT_ZOOM = 10;

// Map Configuration
export const MAP_CONFIG = {
  defaultHeight: 720,
  defaultZoom: DEFAULT_ZOOM,
  center: HOUSTON_CENTER,
  style: MAPBOX_STYLE,
  token: MAPBOX_TOKEN
};

// Theme Colors
export const THEMES = {
  primary: "#1d4ed8",
  secondary: "#dc2626",
  accent: "#f59e0b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  light: "#f3f4f6",
  dark: "#1f2937"
};

// Choropleth Color Schemes
export const COLOR_SCHEMES = {
  redBlue: {
    low: "#dc2626",
    high: "#1d4ed8"
  },
  darkRedBlue: {
    low: "#7f1d1d",
    high: "#1e3a8a"
  },
  redGradient: {
    low: "#f3f4f6",
    high: "#b91c1c"
  }
};

// Data file paths (relative to src/)
export const DATA_PATHS = {
  gis: {
    demographics: "./data/gis/whitePOBvsPOBTOT_houston.geojson",
    restaurants: "./data/gis/restaurantes.geojson",
    restaurantsHouston: "./data/gis/restaurants_houston.geojson",
    competition: "./data/gis/restaurantCompetition_whitinWhiteHouston.geojson",
    angloZones: "./data/gis/whiteHouston_zonas_de_interes_polygon.geojson",
    traffic: "./data/gis/houstonMetropolitan_functional_classification_2_3_clusters_4326.geojson"
  },
  static: {
    habitos: "./data/static/habitos.json",
    habitosTimeline: "./data/static/habitos_timeline.json",
    industryEvaluation: "./data/static/industry_evaluation_houston.json",
    edaData: "./data/static/ohq_eda_data.json"
  }
};

