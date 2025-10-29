import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de restaurantes competidores con destaque para Pastes Kikos
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function restaurantsCompetitionMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	competition,
	pastekos,
	ariaLabel = "Mapa de competencia de restaurantes"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		pointsLayers: {
			"Restaurantes competidores (todos)": competition
		},
		categoricalPoints: {
			name: "Competencia por categoría",
			data: competition,
			property: "categoryName"
		},
		heatmapPoints: {
			name: "Competencia (heatmap)",
			data: competition
		},
		alwaysOnTopPoints: pastekos ? { name: "Pastes Kikos", data: pastekos } : null,
		layerStyles
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

