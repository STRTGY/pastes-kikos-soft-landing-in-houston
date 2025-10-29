import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de zonas de interés (clusters anglo)
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function zonesInterestMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	angloZones,
	ariaLabel = "Mapa de zonas de interés"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		choropleths: [
			{ data: angloZones, name: "Zonas de interés (Anglo)", property: "CLUSTER_SIZE" }
		],
		layerStyles
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

