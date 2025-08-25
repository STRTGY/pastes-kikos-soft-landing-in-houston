import mapboxgl, { ensureMapboxAccessToken, createMapboxMap, waitForContainerSize } from "./mapbox_utils.js";

const DEBUG = typeof window !== "undefined" ? (window.DEBUG_CC_MAP ?? true) : true;
const dlog = (...args) => { if (DEBUG) console.log("[CCMapMB]", ...args); };
const dwarn = (...args) => console.warn("[CCMapMB]", ...args);
const derror = (...args) => console.error("[CCMapMB]", ...args);

const DEFAULT_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";

function isFeature(obj) { return obj && obj.type === "Feature" && obj.geometry != null; }
function isGeometry(obj) { return obj && (
	obj.type === "Point" || obj.type === "MultiPoint" ||
	obj.type === "LineString" || obj.type === "MultiLineString" ||
	obj.type === "Polygon" || obj.type === "MultiPolygon" ||
	obj.type === "GeometryCollection"
); }
function isValidGeoJSON(obj) {
	if (!obj || typeof obj !== "object") return false;
	if (obj.type === "FeatureCollection") return Array.isArray(obj.features);
	if (isFeature(obj)) return true;
	if (isGeometry(obj)) return true;
	return false;
}
function coerceGeoJSON(data) {
	try {
		const obj = typeof data === "string" ? JSON.parse(data) : data;
		if (isValidGeoJSON(obj)) return obj;
		if (obj && Array.isArray(obj.features) && !obj.type) {
			return { type: "FeatureCollection", features: obj.features };
		}
		if (Array.isArray(obj) && obj.every((f) => isFeature(f))) {
			return { type: "FeatureCollection", features: obj };
		}
		if (isGeometry(obj)) {
			return { type: "Feature", geometry: obj, properties: {} };
		}
	} catch { /* ignore */ }
	return null;
}

function maybeReproject3857To4326(geo) {
	// Heuristic detection copied from Leaflet version
	const isLikelyEPSG3857 = (() => {
		const crsName = geo?.crs?.properties?.name || geo?.crs?.name || "";
		if (typeof crsName === "string" && /(3857|900913)/i.test(crsName)) return true;
		try {
			const getFirstCoord = (geom) => {
				if (!geom) return null;
				const t = geom.type; const c = geom.coordinates;
				if (!t || !c) return null;
				if (t === "Point") return c;
				if (t === "LineString" || t === "MultiPoint") return c[0];
				if (t === "MultiLineString" || t === "Polygon") return c[0][0];
				if (t === "MultiPolygon") return c[0][0][0];
				return null;
			};
			const first = (geo.features || [])[0];
			const coord = first ? getFirstCoord(first.geometry) : null;
			if (Array.isArray(coord) && coord.length >= 2) {
				const x = coord[0], y = coord[1];
				if (Number.isFinite(x) && Number.isFinite(y)) {
					return Math.abs(x) > 180 || Math.abs(y) > 90;
				}
			}
		} catch { /* ignore */ }
		return false;
	})();
	if (!isLikelyEPSG3857) return geo;
	const R = 6378137;
	const to4326 = (coords) => {
		const x = coords[0]; const y = coords[1];
		const lng = (x / R) * 180 / Math.PI;
		const lat = (2 * Math.atan(Math.exp(y / R)) - (Math.PI / 2)) * 180 / Math.PI;
		return [lng, lat];
	};
	const reprojectGeom = (g) => {
		const t = g.type; const c = g.coordinates;
		if (t === "Point") return { type: t, coordinates: to4326(c) };
		if (t === "MultiPoint" || t === "LineString") return { type: t, coordinates: c.map(to4326) };
		if (t === "MultiLineString" || t === "Polygon") return { type: t, coordinates: c.map((r) => r.map(to4326)) };
		if (t === "MultiPolygon") return { type: t, coordinates: c.map((p) => p.map((r) => r.map(to4326))) };
		return g;
	};
	return {
		type: "FeatureCollection",
		features: (geo.features || []).map((f) => ({ ...f, geometry: reprojectGeom(f.geometry) }))
	};
}

export function consumerCentricityMapMapbox({
	center = [29.7604, -95.3698],
	zoom = 10,
	roads = null,
	demographics = null,
	demographicProperty,
	choropleths = [],
	pointsLayers = {},
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle = DEFAULT_STYLE
} = {}) {
	ensureMapboxAccessToken(mapboxToken);
	const container = document.createElement("div");
	container.style.width = size?.width ? `${size.width}px` : "100%";
	container.style.height = size?.height ? `${size.height}px` : "640px";
	container.style.borderRadius = "8px";
	container.style.overflow = "hidden";
	container.style.position = "relative";

	const map = createMapboxMap(container, { style: mapboxStyle, center, zoom });
	const overlays = {}; // name -> {sources: [ids], layers: [ids], legendEl?: HTMLElement}
	const allOverlayNames = [];
	const visibleNames = new Set();
	let demoPopup = null; // popup for Demografía: White_vs_Total

	const addSourceOnce = (id, def) => { if (!map.getSource(id)) map.addSource(id, def); };
	const addLayerOnce = (layer) => { if (!map.getLayer(layer.id)) map.addLayer(layer); };
	const setVisibility = (id, visible) => {
		if (!map.getLayer(id)) return;
		map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
	};
	const addOverlay = (name, sources, layers, legendEl) => {
		overlays[name] = { sources, layers, legendEl };
		allOverlayNames.push(name);
		// Hide overlays by default; legends hidden too
		for (const id of layers) setVisibility(id, false);
		if (legendEl) legendEl.style.display = "none";
	};

	const makeLegendContainer = () => {
		const el = document.createElement("div");
		el.style.position = "absolute";
		el.style.right = "10px";
		el.style.bottom = "10px";
		el.style.zIndex = "1000";
		el.style.background = "rgba(255,255,255,0.9)";
		el.style.padding = "8px";
		el.style.borderRadius = "6px";
		return el;
	};

	const notifyOverlayVisibility = () => {
		const visible = Array.from(visibleNames);
		container.dispatchEvent(new CustomEvent("layerschange", { detail: { visible, all: allOverlayNames.slice() } }));
	};

	const toggleOverlay = (name, visible) => {
		const def = overlays[name]; if (!def) return;
		for (const id of def.layers) setVisibility(id, visible);
		if (def.legendEl) def.legendEl.style.display = visible ? "block" : "none";
		if (visible) visibleNames.add(name); else visibleNames.delete(name);
		// Close popup if hiding Demografía overlay
		if (!visible && (name === "Demografía: White_vs_Total")) {
			try { if (demoPopup) { demoPopup.remove(); demoPopup = null; } } catch { /* ignore */ }
		}
		notifyOverlayVisibility();
	};

	const addToggleControl = () => {
		const ctrl = document.createElement("div");
		ctrl.style.position = "absolute";
		ctrl.style.left = "10px";
		ctrl.style.top = "10px";
		ctrl.style.zIndex = "1000";
		ctrl.style.background = "rgba(255,255,255,0.95)";
		ctrl.style.padding = "8px 10px";
		ctrl.style.borderRadius = "6px";
		ctrl.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
		ctrl.style.font = "14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
		ctrl.innerHTML = `<div style="font-weight:600;margin-bottom:6px;">Capas</div>`;
		for (const name of allOverlayNames) {
			const label = document.createElement("label");
			label.style.display = "block";
			label.style.margin = "4px 0";
			const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = false; cb.style.marginRight = "6px";
			cb.addEventListener("change", () => toggleOverlay(name, cb.checked));
			label.appendChild(cb);
			label.appendChild(document.createTextNode(name));
			ctrl.appendChild(label);
		}
		container.appendChild(ctrl);
	};

	map.on("load", () => {
		// Roads — style by F_SYSTEM with overrides and legend
		if (roads) {
			try {
				const roadsGeo = maybeReproject3857To4326(coerceGeoJSON(roads));
				if (roadsGeo) {
					// Base mapping and overrides
					const byFSystem = {
						3: { label: "Principal Arterial (Other)", color: "#4daf4a", weight: 4 },
						4: { label: "Minor Arterial", color: "#984ea3", weight: 2 }
					};
					const overrides = (layerStyles?.["Jerarquía vial"]?.byFSystem) || {};
					for (const [k, v] of Object.entries(overrides)) {
						const code = Number(k);
						if (!Number.isFinite(code)) continue;
						byFSystem[code] = { ...(byFSystem[code] || {}), ...v };
					}
					// Collect present codes from data
					const present = new Set();
					try {
						for (const f of roadsGeo.features || []) {
							const code = Number(f?.properties?.F_SYSTEM);
							if (Number.isFinite(code)) present.add(code);
						}
					} catch { /* ignore */ }
					// Fallback style
					const fallback = layerStyles?.["Jerarquía vial"]?.line || {};
					const fallbackColor = fallback.color || "#6b7280";
					const fallbackWidth = typeof fallback.weight === "number" ? fallback.weight : 1.25;
					// Build expressions for color and width by F_SYSTEM
					const matchInput = ["to-number", ["get", "F_SYSTEM"]];
					const colorExpr = ["match", matchInput];
					const widthExpr = ["match", matchInput];
					const sortedCodes = Array.from(new Set([...Object.keys(byFSystem).map(Number), ...present])).filter(Number.isFinite).sort((a,b)=>a-b);
					for (const code of sortedCodes) {
						const s = byFSystem[code] || {};
						colorExpr.push(code, s.color || fallbackColor);
						widthExpr.push(code, typeof s.weight === "number" ? s.weight : fallbackWidth);
					}
					colorExpr.push(fallbackColor);
					widthExpr.push(fallbackWidth);

					addSourceOnce("roads-src", { type: "geojson", data: roadsGeo });
					addLayerOnce({
						id: "roads-line",
						type: "line",
						source: "roads-src",
						paint: {
							"line-color": colorExpr,
							"line-width": widthExpr,
							"line-opacity": 0.9
						},
						layout: { "line-cap": "round", "line-join": "round" }
					});

					// Legend DOM showing present codes
					const legend = document.createElement("div");
					legend.style.position = "absolute";
					legend.style.right = "10px";
					legend.style.bottom = "10px";
					legend.style.zIndex = "1000";
					legend.style.background = "rgba(255,255,255,0.9)";
					legend.style.padding = "8px";
					legend.style.borderRadius = "6px";
					const entries = sortedCodes.length ? sortedCodes : Object.keys(byFSystem).map(Number);
					legend.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">F_SYSTEM</div>` + entries.map((code) => {
						const s = byFSystem[code] || {};
						const color = s.color || fallbackColor;
						const weight = typeof s.weight === "number" ? s.weight : fallbackWidth;
						const label = s.label || `F_SYSTEM ${code}`;
						return `<div style=\"display:flex;align-items:center;margin:2px 0;\">
							<span style=\"display:inline-block;width:14px;height:3px;background:${color};margin-right:6px;\"></span>
							<span>${code} — ${label} (w=${weight})</span>
						</div>`;
					}).join("");
					legend.style.display = "none";
					container.appendChild(legend);

					addOverlay("Jerarquía vial", ["roads-src"], ["roads-line"], legend);
				}
			} catch (e) { derror("roads layer failed", e); }
		}

		// Choropleths
		for (const entry of choropleths) {
			if (!entry || !entry.data || !entry.property) continue;
			try {
				const geo = coerceGeoJSON(entry.data); if (!geo) continue;
				const name = entry.name || entry.property;
				const sourceId = `ch-src-${name}`;
				const fillId = `ch-fill-${name}`;
				const lineId = `ch-line-${name}`;
				addSourceOnce(sourceId, { type: "geojson", data: geo });

				// Specialized implementation for Demografía: White_vs_Total
				if (name === "Demografía: White_vs_Total" || entry.property === "White_vs_Total") {
					// Compute range
					const values = [];
					try {
						for (const f of geo.features || []) {
							const v = f?.properties?.[entry.property];
							if (typeof v === "number" && Number.isFinite(v)) values.push(v);
						}
					} catch { /* ignore */ }
					const dataMin = values.length ? Math.min(...values) : 0;
					const dataMax = values.length ? Math.max(...values) : 1;
					const rangeOverride = layerStyles?.[name]?.choropleth?.range;
					const minRange = Array.isArray(rangeOverride) && rangeOverride.length === 2 ? Number(rangeOverride[0]) : (dataMin >= 0 && dataMax <= 100 ? 0 : dataMin);
					const maxRange = Array.isArray(rangeOverride) && rangeOverride.length === 2 ? Number(rangeOverride[1]) : (dataMin >= 0 && dataMax <= 100 ? 100 : dataMax);
					const denom = (maxRange - minRange) === 0 ? 1 : (maxRange - minRange);
					// Normalized t in [0,1]
					const tExpr = ["max", 0, ["min", 1, ["/", ["-", ["to-number", ["get", entry.property]], minRange], denom]]];
					const red = "#dc2626";  // red-600
					const blue = "#1d4ed8"; // indigo-600
					addLayerOnce({
						id: fillId,
						type: "fill",
						source: sourceId,
						paint: {
							"fill-color": ["interpolate", ["linear"], tExpr, 0, red, 1, blue],
							"fill-opacity": ["interpolate", ["linear"], tExpr, 0, 0.2, 1, 0.8]
						}
					});
					addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#1f3a8a", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.5, "line-opacity": 0.7 } });
					// Legend with equal intervals and opacity-coded swatches
					const legend = makeLegendContainer();
					legend.style.display = "none";
					const steps = Math.max(3, Math.min(9, layerStyles?.[name]?.choropleth?.steps || 6));
					const stepSize = (maxRange - minRange) / steps;
					const rows = [];
					for (let i = 0; i < steps; i++) {
						const a = minRange + i * stepSize;
						const b = i === steps - 1 ? maxRange : (minRange + (i + 1) * stepSize);
						const mid = (a + b) / 2;
						const tMid = Math.max(0, Math.min(1, (mid - minRange) / denom));
						const color = tMid <= 0 ? red : (tMid >= 1 ? blue : undefined);
						const label = (minRange >= 0 && maxRange <= 100) ? `${a.toFixed(0)}% – ${b.toFixed(0)}%` : `${a.toFixed(2)} – ${b.toFixed(2)}`;
						const opacity = (0.2 + 0.6 * tMid).toFixed(2);
						if (color) {
							rows.push(`<div style="display:flex;align-items:center;margin:2px 0;">
								<span style="display:inline-block;width:14px;height:14px;background:${color};opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;"></span>
								<span>${label}</span>
							</div>`);
						} else {
							rows.push(`<div style="display:flex;align-items:center;margin:2px 0;">
								<span style="display:inline-block;width:14px;height:14px;background:linear-gradient(90deg, ${red}, ${blue});opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;"></span>
								<span>${label}</span>
							</div>`);
						}
					}
					legend.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${name}</div>` + rows.join("");
					container.appendChild(legend);
					addOverlay(name, [sourceId], [fillId, lineId], legend);

					// Interactivity: hover cursor and popup on click
					try {
						map.on("mouseenter", fillId, () => { container.style.cursor = "pointer"; });
						map.on("mouseleave", fillId, () => { container.style.cursor = ""; });
						map.on("click", fillId, (e) => {
							const feat = (e?.features && e.features[0]) || null;
							const props = feat?.properties || {};
							const totalPop = Number(props.POB_TOT);
							const pctWhite = Number(props.White_vs_Total);
							const pctClamped = Number.isFinite(pctWhite) ? Math.max(0, Math.min(100, pctWhite)) : NaN;
							const whiteCount = (Number.isFinite(totalPop) && Number.isFinite(pctClamped))
								? Math.round(totalPop * pctClamped / 100)
								: NaN;
							const fmtInt = (n) => Number.isFinite(n) ? n.toLocaleString('es-MX') : 'N/A';
							const fmtPct = (p) => Number.isFinite(p) ? `${Math.round(p)}%` : 'N/A';
							const html = `
								<div style="font: 13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
									<div style="font-weight:600;margin-bottom:4px;">Demografía: White_vs_Total</div>
									<div>% Población blanca: <strong>${fmtPct(pctClamped)}</strong></div>
									<div>Población blanca: <strong>${fmtInt(whiteCount)}</strong></div>
									<div>Población total: <strong>${fmtInt(totalPop)}</strong></div>
								</div>`;
							try { if (demoPopup) { demoPopup.remove(); } } catch { /* ignore */ }
							demoPopup = new mapboxgl.Popup({ closeButton: true, closeOnMove: true })
								.setLngLat(e.lngLat)
								.setHTML(html)
								.addTo(map);
						});
					} catch { /* ignore */ }
				} else if (name === "% Drive-through sobre restaurantes" || entry.property === "has_drive_thru_vs_total_restaurants") {
					// Drive-through choropleth with strong contrast for high values (0..100)
					const prop = entry.property === "has_drive_thru_vs_total_restaurants" ? "has_drive_thru_vs_total_restaurants" : entry.property;
					const valueExpr = ["to-number", ["get", prop]];
					const clamped = ["max", 0, ["min", 100, valueExpr]];
					const colorLow = "#f3f4f6"; // gray-100
					// Adjust palette to make lower values more visually distinct
					const colorHigh = "#b91c1c"; // red-700
					addLayerOnce({
						id: fillId,
						type: "fill",
						source: sourceId,
						paint: {
							"fill-color": [
								"interpolate",
								["exponential", 2.2], // Lower base for more rapid color change at low end
								clamped,
								0, colorLow,
								5, "#fecaca",    // red-200, light red for low but nonzero
								15, "#f87171",   // red-400
								35, "#ef4444",   // red-500
								60, "#dc2626",   // red-600
								100, colorHigh
							],
							"fill-opacity": [
								"interpolate",
								["exponential", 2.2],
								clamped,
								0, 0.18,
								5, 0.32,
								15, 0.45,
								35, 0.62,
								60, 0.75,
								100, 0.85
							]
						}
					});
					addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#7f1d1d", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.4, "line-opacity": 0.6 } });
					// Legend emphasizing upper tail
					const legend = makeLegendContainer(); legend.style.display = "none";
					const stops = [0, 2, 5, 10, 20, 40, 60, 80, 100];
					legend.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${name}</div>` + stops.map((s) => {
						const opacity = (0.2 + 0.65 * Math.pow(s / 100, 3)).toFixed(2);
						return `<div style="display:flex;align-items:center;margin:2px 0;">
							<span style="display:inline-block;width:14px;height:14px;background:linear-gradient(90deg, ${colorLow}, ${colorHigh});opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;"></span>
							<span>${s}%</span>
						</div>`;
					}).join("");
					container.appendChild(legend);
					addOverlay(name, [sourceId], [fillId, lineId], legend);
				} else {
					// Default choropleth fallback
					const fillOpacity = typeof layerStyles?.[name]?.choropleth?.fillOpacity === "number" ? layerStyles[name].choropleth.fillOpacity : 0.6;
					addLayerOnce({ id: fillId, type: "fill", source: sourceId, paint: { "fill-color": "#60a5fa", "fill-opacity": fillOpacity } });
					addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#1f3a8a", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.5 } });
					const legend = makeLegendContainer(); legend.style.display = "none"; legend.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${name}</div>`;
					container.appendChild(legend);
					addOverlay(name, [sourceId], [fillId, lineId], legend);
				}
			} catch (e) { derror("choropleth failed", e); }
		}

		// Points layers
		for (const [name, data] of Object.entries(pointsLayers || {})) {
			if (!data) continue;
			try {
				const geo = coerceGeoJSON(data); if (!geo) continue;
				const sourceId = `pt-src-${name}`; const circleId = `pt-circle-${name}`;
				addSourceOnce(sourceId, { type: "geojson", data: geo });
				const cfg = layerStyles?.[name]?.point || {};
				addLayerOnce({ id: circleId, type: "circle", source: sourceId, paint: {
					"circle-radius": cfg.radiusBase ?? 3,
					"circle-color": cfg.fillColor || cfg.color || "#38bdf8",
					"circle-stroke-color": cfg.color || "#0ea5e9",
					"circle-stroke-width": cfg.weight ?? 1,
					"circle-opacity": typeof cfg.fillOpacity === "number" ? cfg.fillOpacity : 0.8
				}});
				addOverlay(name, [sourceId], [circleId], null);
			} catch (e) { derror("points layer failed", e); }
		}

		addToggleControl();
		notifyOverlayVisibility();
	});

	waitForContainerSize(container, map, () => { try { map.resize(); } catch { /* ignore */ } });

	if (typeof window !== "undefined" && window.console && window.console.debug) {
		window.console.debug("[CCMapMB] Map initialized and returned container");
	}

	return container;
}

export default consumerCentricityMapMapbox;


