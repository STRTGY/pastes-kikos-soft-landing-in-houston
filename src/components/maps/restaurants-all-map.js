import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de todos los restaurantes con múltiples vistas:
 * - Todos los restaurantes
 * - Por categoría
 * - Heatmap
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function restaurantsAllMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	restaurants,
	ariaLabel = "Mapa de restaurantes de Houston"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		pointsLayers: {
			"Restaurantes (todos)": restaurants
		},
		categoricalPoints: {
			name: "Restaurantes por categoría",
			data: restaurants,
			property: "categoryName"
		},
		heatmapPoints: {
			name: "Restaurantes (heatmap)",
			data: restaurants
		},
		layerStyles
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

