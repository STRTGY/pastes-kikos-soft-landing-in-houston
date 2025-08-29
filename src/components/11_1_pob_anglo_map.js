import consumerCentricityMapMapbox from "./consumer_centricity_map_mapbox.js";

export default async function pobAngloMap({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle,
	demog
} = {}) {
	return consumerCentricityMapMapbox({
		center,
		zoom,
		size,
		mapboxToken,
		mapboxStyle,
		choropleths: [
			{ data: demog, name: "Demografía: White_vs_Total", property: "White_vs_Total" }
		],
		layerStyles
	});
}


