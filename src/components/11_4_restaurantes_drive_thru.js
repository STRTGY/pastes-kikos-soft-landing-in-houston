import consumerCentricityMapMapbox from "./consumer_centricity_map_mapbox.js";

export default async function restaurantesDriveThruMap({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	restaurants
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
	return consumerCentricityMapMapbox({
		center,
		zoom,
		size,
		mapboxToken,
		mapboxStyle,
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
				// Opcional: estilos de puntos y paleta; el mapeo exacto de color a categoría
				// lo decide internamente la capa categórica según frecuencia.
				point: { radiusBase: 3, weight: 0.6, fillOpacity: 0.95, strokeColor: "#111827" },
				palette: ["#9ca3af", "#16a34a"] // verdes para "true", grises para "false" (si aplica)
			}
		}
	});
}




