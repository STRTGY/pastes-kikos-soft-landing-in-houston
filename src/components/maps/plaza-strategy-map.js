import { consumerCentricityMapMapbox } from "../core/mapbox-base.js";

/**
 * Mapa estratégico de plaza con múltiples capas para análisis de ubicación
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<HTMLElement>} Elemento del mapa
 */
export default async function plazaStrategyMap({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	restaurants,
	zonasInteres,
	trafficRoads,
	demographics
} = {}) {
	// Filtrar restaurantes con drive-thru
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

	return consumerCentricityMapMapbox({
		center,
		zoom,
		size,
		mapboxToken,
		mapboxStyle,
		// Coropletas: zonas de interés y demografía
		choropleths: [
			{ 
				data: zonasInteres, 
				name: "Zonas de Interés (Clusters)", 
				property: "CLUSTER_SIZE",
				colors: ["#fef3c7", "#fde047", "#facc15", "#eab308", "#ca8a04"]
			},
			{ 
				data: demographics, 
				name: "Demografía (% Población Blanca)", 
				property: "PERCWHITE",
				colors: ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"]
			}
		],
		// Capas de líneas: carreteras clasificadas por tráfico
		lineOverlays: [{
			data: trafficRoads,
			name: "Carreteras Principales",
			property: "FUNCTIONAL",
			styleMap: {
				"2": "#ef4444", // Interstate/Principal
				"3": "#f59e0b"  // Other Principal Arterial
			},
			line: {
				widthDefault: 3,
				opacity: 0.85
			}
		}],
		// Puntos categóricos: todos los restaurantes por drive-thru
		categoricalPoints: {
			name: "Restaurantes (Drive-thru)",
			data: restaurants,
			property: "has_drive_through"
		},
		// Heatmap: solo restaurantes con drive-thru
		heatmapPoints: {
			name: "Densidad Drive-thru",
			data: onlyDriveThru
		},
		layerStyles: {
			...layerStyles,
			"Restaurantes (Drive-thru)": {
				point: { radiusBase: 3, weight: 0.6, fillOpacity: 0.95, strokeColor: "#111827" },
				palette: ["#9ca3af", "#16a34a"] // gris para false, verde para true
			}
		}
	});
}

