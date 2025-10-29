import { MAPBOX_TOKEN } from "./public-env.generated.js";

/**
 * Default configuration for all maps in the project
 * Centralized to maintain consistency across pages
 */
export const MAP_DEFAULTS = {
  center: [29.7604, -95.3698], // Houston coordinates
  zoom: 10,
  size: { height: undefined }, // Components should adjust to container
  mapboxStyle: "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re",
  mapboxToken: MAPBOX_TOKEN
};

/**
 * Helper to merge defaults with custom options
 * @param {Object} options - Custom options to override defaults
 * @returns {Object} Merged configuration
 */
export function getMapConfig(options = {}) {
  return {
    ...MAP_DEFAULTS,
    ...options,
    // Ensure token is always available
    mapboxToken: options.mapboxToken || MAP_DEFAULTS.mapboxToken
  };
}

