import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de demografía mostrando población anglosajona
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto (MAP_DEFAULTS)
 * @param {Array} options.center - Centro del mapa [lat, lng]
 * @param {number} options.zoom - Nivel de zoom
 * @param {Object} options.size - Tamaño del mapa {height, width}
 * @param {Object} options.layerStyles - Estilos personalizados para capas
 * @param {string} options.mapboxToken - Token de Mapbox
 * @param {string} options.mapboxStyle - Estilo de Mapbox
 * @param {Object} options.demog - Datos GeoJSON de demografía
 * @param {string} options.ariaLabel - Label accesible para el mapa
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function demographicsMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	demog,
	ariaLabel = "Mapa de demografía de Houston"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		choropleths: [
			{ data: demog, name: "Demografía: White_vs_Total", property: "White_vs_Total" }
		],
		layerStyles
	});
	
	// Add accessibility attributes
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

