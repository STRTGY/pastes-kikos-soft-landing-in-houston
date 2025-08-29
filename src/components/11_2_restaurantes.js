import consumerCentricityMapMapbox from "./consumer_centricity_map_mapbox.js";

export default async function restaurantesMap({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	restaurants
} = {}) {
	return consumerCentricityMapMapbox({
		center,
		zoom,
		size,
		mapboxToken,
		mapboxStyle,
		pointsLayers: {
			"Restaurantes (todos)": restaurants
		},
		categoricalPoints: {
			name: "Restaurantes por categoría",
			data: restaurants,
			property: "categoryName"
		},
		heatmapPoints: { // compatible con alias internos para heatmap
			name: "Restaurantes (heatmap)",
			data: restaurants
		},
		layerStyles
	});
}


