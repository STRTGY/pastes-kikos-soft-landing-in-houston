import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";
import { MAP_DEFAULTS } from "../../config/maps.js";

/**
 * Mapa de restaurantes con énfasis en drive-thru
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Configuración por defecto
 * @param {string} options.ariaLabel - Label accesible
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function restaurantsDriveThruMap({
	defaults = MAP_DEFAULTS,
	center,
	zoom,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	restaurants,
	ariaLabel = "Mapa de restaurantes con drive-thru"
} = {}) {
	// Subconjunto con solo restaurantes con drive-thru para heatmap
	const onlyDriveThru = (() => {
		try {
			const obj = typeof restaurants === "string" ? JSON.parse(restaurants) : restaurants;
			const feats = Array.isArray(obj?.features) ? obj.features : (Array.isArray(obj) ? obj : []);
			const selected = feats.filter((f) => {
				const v = f?.properties?.has_drive_through;
				return v === true || v === 1 || v === "true";
			});
			return { type: "FeatureCollection", features: selected };
		} catch {
			return { type: "FeatureCollection", features: [] };
		}
	})();

	const mapEl = await consumerCentricityMapMapbox({
		center: center || defaults.center,
		zoom: zoom || defaults.zoom,
		size: size || defaults.size,
		mapboxToken: mapboxToken || defaults.mapboxToken,
		mapboxStyle: mapboxStyle || defaults.mapboxStyle,
		// 1) Capa de restaurantes de Houston, coloreada por has_drive_through (true/false)
		categoricalPoints: {
			name: "Restaurantes (Drive-thru vs No)",
			data: restaurants,
			property: "has_drive_through"
		},
		// 2) Heatmap: solo restaurantes con drive-thru
		heatmapPoints: {
			name: "Restaurantes con Drive-thru (heatmap)",
			data: onlyDriveThru
		},
		layerStyles: {
			...layerStyles,
			"Restaurantes (Drive-thru vs No)": {
				point: { radiusBase: 3, weight: 0.6, fillOpacity: 0.95, strokeColor: "#111827" },
				palette: ["#9ca3af", "#16a34a"] // grises para false, verdes para true
			}
		}
	});
	
	mapEl.setAttribute("role", "img");
	mapEl.setAttribute("aria-label", ariaLabel);
	
	return mapEl;
}

