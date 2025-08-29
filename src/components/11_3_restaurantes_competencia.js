import consumerCentricityMapMapbox from "./consumer_centricity_map_mapbox.js";

export default async function restaurantesCompetenciaMap({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	competition,
	pastekos
} = {}) {
	return consumerCentricityMapMapbox({
		center,
		zoom,
		size,
		mapboxToken,
		mapboxStyle,
		pointsLayers: {
			"Restaurantes competidores (todos)": competition
		},
		categoricalPoints: {
			name: "Competencia por categoría",
			data: competition,
			property: "categoryName"
		},
		heatmapPoints: { // compatible con alias internos para heatmap
			name: "Competencia (heatmap)",
			data: competition
		},
		alwaysOnTopPoints: pastekos ? { name: "Pastes Kikos", data: pastekos } : null,
		layerStyles
	});
}




