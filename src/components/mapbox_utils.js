import mapboxgl from "npm:mapbox-gl";

// Ensure Mapbox GL CSS is loaded once
if (typeof document !== "undefined" && !document.getElementById("mapbox-gl-css")) {
	const link = document.createElement("link");
	link.id = "mapbox-gl-css";
	link.rel = "stylesheet";
	link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
	document.head.appendChild(link);
}

export function ensureMapboxAccessToken(token) {
	if (typeof token === "string" && token.length > 0) {
		mapboxgl.accessToken = token;
		return token;
	}
	if (typeof window !== "undefined" && typeof window.MAPBOX_TOKEN === "string") {
		mapboxgl.accessToken = window.MAPBOX_TOKEN;
		return window.MAPBOX_TOKEN;
	}
	return mapboxgl.accessToken;
}

function normalizeCenter(center) {
	if (Array.isArray(center) && center.length === 2) {
		const a = Number(center[0]);
		const b = Number(center[1]);
		if (Number.isFinite(a) && Number.isFinite(b)) {
			// If it's likely [lat, lng] (Leaflet order) flip to [lng, lat]
			if (Math.abs(b) > 90 || (Math.abs(a) <= 90 && Math.abs(b) > 90)) return [b, a];
		}
	}
	return center;
}

export function createMapboxMap(container, { style, center, zoom }) {
	const normalizedCenter = normalizeCenter(center);
	const map = new mapboxgl.Map({
		container,
		style,
		center: normalizedCenter,
		zoom,
		pitch: 0,
		bearing: 0,
		interactive: true
	});
	try { map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "top-right"); } catch { /* ignore */ }
	return map;
}

export function waitForContainerSize(container, map, onReady) {
	const start = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
	const maxMs = 10000;
	const tick = () => {
		const w = container.clientWidth || 0;
		const h = container.clientHeight || 0;
		if (w > 0 && h > 0) {
			try { map.resize(); } catch { /* ignore */ }
			onReady();
			return;
		}
		const nowTs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
		if (nowTs - start > maxMs) {
			onReady();
			return;
		}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(tick); else setTimeout(tick, 50);
	};
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(tick); else setTimeout(tick, 0);
}

export default mapboxgl;


