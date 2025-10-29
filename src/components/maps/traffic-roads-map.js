import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de tráfico con múltiples capas: congestión futura, estaciones permanentes y heatmap
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {Array} options.center - Centro del mapa [lat, lng]
 * @param {number} options.zoom - Nivel de zoom
 * @param {Object} options.size - Tamaño del mapa {height, width}
 * @param {string} options.mapboxToken - Token de Mapbox
 * @param {string} options.mapboxStyle - Estilo de Mapbox
 * @param {Object} options.congestion - Datos GeoJSON de congestión futura
 * @param {Object} options.stations - Datos GeoJSON de estaciones permanentes de conteo
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function trafficRoadsMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	mapboxToken,
	mapboxStyle,
	congestion,
	stations,
	ariaLabel = "Mapa de tráfico y congestión"
} = {}) {
	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		lineOverlays: [{
			data: congestion,
			name: "Congestión futura",
			property: "FUT_CONG",
			styleMap: {
				"Not Congested": "#9ca3af",
				"Moderately Congested": "#f59e0b",
				"Congested": "#ef4444",
				"Severely Congested": "#991b1b"
			},
			line: {
				widthDefault: 2.5,
				opacity: 0.95
			}
		}],
		pointsLayers: {
			"Estaciones permanentes": stations
		},
		heatmapPoints: {
			name: "Densidad de estaciones",
			data: stations
		}
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

