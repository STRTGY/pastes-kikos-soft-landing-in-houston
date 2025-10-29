import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de clasificación funcional de vialidades (arteriales principales y menores)
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {Array} options.center - Centro del mapa [lat, lng]
 * @param {number} options.zoom - Nivel de zoom
 * @param {Object} options.size - Tamaño del mapa {height, width}
 * @param {string} options.mapboxToken - Token de Mapbox
 * @param {string} options.mapboxStyle - Estilo de Mapbox
 * @param {Object} options.roads - Datos GeoJSON de clasificación funcional
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function roadsFunctionalMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	mapboxToken,
	mapboxStyle,
	roads,
	ariaLabel = "Mapa de clasificación funcional de vialidades"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		roads
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

