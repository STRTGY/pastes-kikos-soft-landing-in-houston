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
	// New optional overlays for restaurants/points use-cases
	categoricalPoints = null, // { data, name, property }
	heatmapPoints = null, // { data, name }
	size,
	layerStyles = {},
	mapboxToken,
	mapboxStyle = DEFAULT_STYLE,
	// Always-on points layer that sits on top of all others and is not toggleable
	alwaysOnTopPoints = null // { data, name }
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
	let dtPopup = null; // popup for Drive-through sobre restaurantes

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
		// Close popup if hiding Drive-through sobre restaurantes overlay
		if (!visible && (name === "% Drive-through sobre restaurantes" || name === "has_drive_thru_vs_total_restaurants")) {
			try { if (dtPopup) { dtPopup.remove(); dtPopup = null; } } catch { /* ignore */ }
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

	// ------------------------------
	// Helpers: formatting and ids
	// ------------------------------
	const formatInteger = (n, locale = 'es-MX') => Number.isFinite(n) ? n.toLocaleString(locale) : 'N/A';
	const formatPercent = (p) => Number.isFinite(p) ? `${Math.round(p)}%` : 'N/A';
	const clampPercent = (p) => Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : NaN;

	// ------------------------------
	// Overlay builders and strategies
	// ------------------------------
	const buildRoadsOverlay = (roadsGeo) => {
		try {
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
			const present = new Set();
			try {
				for (const f of (roadsGeo.features || [])) {
					const code = Number(f?.properties?.F_SYSTEM);
					if (Number.isFinite(code)) present.add(code);
				}
			} catch { /* ignore */ }
			const fallback = layerStyles?.["Jerarquía vial"]?.line || {};
			const fallbackColor = fallback.color || "#6b7280";
			const fallbackWidth = typeof fallback.weight === "number" ? fallback.weight : 1.25;
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
				paint: { "line-color": colorExpr, "line-width": widthExpr, "line-opacity": 0.9 },
				layout: { "line-cap": "round", "line-join": "round" }
			});
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
				return `<div style=\"display:flex;align-items:center;margin:2px 0;\">\n\t\t\t\t\t\t<span style=\"display:inline-block;width:14px;height:3px;background:${color};margin-right:6px;\"></span>\n\t\t\t\t\t\t<span>${code} — ${label} (w=${weight})</span>\n\t\t\t\t\t</div>`;
			}).join("");
			legend.style.display = "none";
			container.appendChild(legend);
			return { name: "Jerarquía vial", sources: ["roads-src"], layers: ["roads-line"], legendEl: legend };
		} catch (e) { derror("roads layer failed", e); }
		return null;
	};

	const buildChoroplethWhiteVsTotal = ({ geo, name, property }) => {
		try {
			const sourceId = `ch-src-${name}`;
			const fillId = `ch-fill-${name}`;
			const lineId = `ch-line-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			const values = [];
			try {
				for (const f of (geo.features || [])) {
					const v = f?.properties?.[property];
					if (typeof v === "number" && Number.isFinite(v)) values.push(v);
				}
			} catch { /* ignore */ }
			const dataMin = values.length ? Math.min(...values) : 0;
			const dataMax = values.length ? Math.max(...values) : 1;
			const rangeOverride = layerStyles?.[name]?.choropleth?.range;
			const minRange = Array.isArray(rangeOverride) && rangeOverride.length === 2 ? Number(rangeOverride[0]) : (dataMin >= 0 && dataMax <= 100 ? 0 : dataMin);
			const maxRange = Array.isArray(rangeOverride) && rangeOverride.length === 2 ? Number(rangeOverride[1]) : (dataMin >= 0 && dataMax <= 100 ? 100 : dataMax);
			const denom = (maxRange - minRange) === 0 ? 1 : (maxRange - minRange);
			const tExpr = ["max", 0, ["min", 1, ["/", ["-", ["to-number", ["get", property]], minRange], denom]]];
			const red = "#dc2626";
			const blue = "#1d4ed8";
			addLayerOnce({ id: fillId, type: "fill", source: sourceId, paint: { "fill-color": ["interpolate", ["linear"], tExpr, 0, red, 1, blue], "fill-opacity": ["interpolate", ["linear"], tExpr, 0, 0.2, 1, 0.8] } });
			addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#1f3a8a", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.5, "line-opacity": 0.7 } });
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
					rows.push(`<div style="display:flex;align-items:center;margin:2px 0;">\n\t\t\t\t\t\t<span style=\"display:inline-block;width:14px;height:14px;background:${color};opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;\"></span>\n\t\t\t\t\t\t<span>${label}</span>\n\t\t\t\t\t</div>`);
				} else {
					rows.push(`<div style="display:flex;align-items:center;margin:2px 0;">\n\t\t\t\t\t\t<span style=\"display:inline-block;width:14px;height:14px;background:linear-gradient(90deg, ${red}, ${blue});opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;\"></span>\n\t\t\t\t\t\t<span>${label}</span>\n\t\t\t\t\t</div>`);
				}
			}
			legend.innerHTML = `<div style=\"font-weight:600;margin-bottom:4px;\">${name}</div>` + rows.join("");
			container.appendChild(legend);
			try {
				map.on("mouseenter", fillId, () => { container.style.cursor = "pointer"; });
				map.on("mouseleave", fillId, () => { container.style.cursor = ""; });
				map.on("click", fillId, (e) => {
					const feat = (e?.features && e.features[0]) || null;
					const props = feat?.properties || {};
					const totalPop = Number(props.POB_TOT);
					const pctWhite = Number(props.White_vs_Total);
					const pctClamped = clampPercent(pctWhite);
					const whiteCount = (Number.isFinite(totalPop) && Number.isFinite(pctClamped)) ? Math.round(totalPop * pctClamped / 100) : NaN;
					const html = `\n\t\t\t\t\t\t\t\t<div style=\"font: 13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\">\n\t\t\t\t\t\t\t\t\t<div style=\"font-weight:600;margin-bottom:4px;\">Demografía: White_vs_Total</div>\n\t\t\t\t\t\t\t\t\t<div>% Población blanca: <strong>${formatPercent(pctClamped)}</strong></div>\n\t\t\t\t\t\t\t\t\t<div>Población blanca: <strong>${formatInteger(whiteCount)}</strong></div>\n\t\t\t\t\t\t\t\t\t<div>Población total: <strong>${formatInteger(totalPop)}</strong></div>\n\t\t\t\t\t\t\t\t</div>`;
					try { if (demoPopup) { demoPopup.remove(); } } catch { /* ignore */ }
					demoPopup = new mapboxgl.Popup({ closeButton: true, closeOnMove: true }).setLngLat(e.lngLat).setHTML(html).addTo(map);
				});
			} catch { /* ignore */ }
			return { name, sources: [sourceId], layers: [fillId, lineId], legendEl: legend };
		} catch (e) { derror("choropleth White_vs_Total failed", e); }
		return null;
	};

	const buildChoroplethDriveThru = ({ geo, name, property }) => {
		try {
			const sourceId = `ch-src-${name}`;
			const fillId = `ch-fill-${name}`;
			const lineId = `ch-line-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			const prop = property === "has_drive_thru_vs_total_restaurants" ? "has_drive_thru_vs_total_restaurants" : property;
			const valueExpr = ["to-number", ["get", prop]];
			const clamped = ["max", 0, ["min", 100, valueExpr]];
			const colorLow = "#f3f4f6";
			const colorHigh = "#b91c1c";
			addLayerOnce({ id: fillId, type: "fill", source: sourceId, paint: {
				"fill-color": ["interpolate", ["exponential", .1], clamped, 0, colorLow, 5, "#fecaca", 15, "#f87171", 35, "#ef4444", 60, "#dc2626", 100, colorHigh],
				"fill-opacity": ["interpolate", ["exponential", .1], clamped, 0, 0.18, 5, 0.32, 15, 0.45, 35, 0.62, 60, 0.75, 100, 0.85]
			}});
			addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#7f1d1d", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.4, "line-opacity": 0.6 } });
			const legend = makeLegendContainer(); legend.style.display = "none";
			const stops = [0, 2, 5, 10, 20, 40, 60, 80, 100];
			legend.innerHTML = `<div style=\"font-weight:600;margin-bottom:4px;\">${name}</div>` + stops.map((s) => {
				const opacity = (0.2 + 0.65 * Math.pow(s / 100, 3)).toFixed(2);
				return `<div style=\"display:flex;align-items:center;margin:2px 0;\">\n\t\t\t\t\t\t<span style=\"display:inline-block;width:14px;height:14px;background:linear-gradient(90deg, ${colorLow}, ${colorHigh});opacity:${opacity};border:1px solid #9ca3af;margin-right:6px;\"></span>\n\t\t\t\t\t\t<span>${s}%</span>\n\t\t\t\t\t</div>`;
			}).join("");
			container.appendChild(legend);
			try {
				map.on("mouseenter", fillId, () => { container.style.cursor = "pointer"; });
				map.on("mouseleave", fillId, () => { container.style.cursor = ""; });
				map.on("click", fillId, (e) => {
					const feat = (e?.features && e.features[0]) || null;
					const props = feat?.properties || {};
					const pct = Number(props.has_drive_thru_vs_total_restaurants);
					const pctClamped = clampPercent(pct);
					const totalRest = Number(props.total_restaurants);
					const knownDriveThru = Number(props.count_has_drive_through);
					const driveThruCount = Number.isFinite(knownDriveThru) ? knownDriveThru : (Number.isFinite(totalRest) && Number.isFinite(pctClamped)) ? Math.round(totalRest * pctClamped / 100) : NaN;
					const html = `\n\t\t\t\t\t\t\t\t<div style=\"font: 13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\">\n\t\t\t\t\t\t\t\t\t<div style=\"font-weight:600;margin-bottom:4px;\">% Drive-through sobre restaurantes</div>\n\t\t\t\t\t\t\t\t\t<div>Porcentaje: <strong>${formatPercent(pctClamped)}</strong></div>\n\t\t\t\t\t\t\t\t\t<div>Restaurantes con drive-through: <strong>${formatInteger(driveThruCount)}</strong></div>\n\t\t\t\t\t\t\t\t\t<div>Restaurantes totales: <strong>${formatInteger(totalRest)}</strong></div>\n\t\t\t\t\t\t\t\t</div>`;
					try { if (dtPopup) { dtPopup.remove(); } } catch { /* ignore */ }
					dtPopup = new mapboxgl.Popup({ closeButton: true, closeOnMove: true }).setLngLat(e.lngLat).setHTML(html).addTo(map);
				});
			} catch { /* ignore */ }
			return { name, sources: [sourceId], layers: [fillId, lineId], legendEl: legend };
		} catch (e) { derror("choropleth drive-thru failed", e); }
		return null;
	};

	const buildChoroplethGeneric = ({ geo, name }) => {
		try {
			const sourceId = `ch-src-${name}`;
			const fillId = `ch-fill-${name}`;
			const lineId = `ch-line-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			const fillOpacity = typeof layerStyles?.[name]?.choropleth?.fillOpacity === "number" ? layerStyles[name].choropleth.fillOpacity : 0.6;
			addLayerOnce({ id: fillId, type: "fill", source: sourceId, paint: { "fill-color": "#60a5fa", "fill-opacity": fillOpacity } });
			addLayerOnce({ id: lineId, type: "line", source: sourceId, paint: { "line-color": layerStyles?.[name]?.choropleth?.borderColor || "#1f3a8a", "line-width": layerStyles?.[name]?.choropleth?.borderWidth || 0.5 } });
			const legend = makeLegendContainer(); legend.style.display = "none"; legend.innerHTML = `<div style=\"font-weight:600;margin-bottom:4px;\">${name}</div>`;
			container.appendChild(legend);
			return { name, sources: [sourceId], layers: [fillId, lineId], legendEl: legend };
		} catch (e) { derror("choropleth generic failed", e); }
		return null;
	};

	const buildPointsOverlay = (name, geo) => {
		try {
			const sourceId = `pt-src-${name}`;
			const circleId = `pt-circle-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			const cfg = layerStyles?.[name]?.point || {};
			addLayerOnce({ id: circleId, type: "circle", source: sourceId, paint: {
				"circle-radius": cfg.radiusBase ?? 3,
				"circle-color": cfg.fillColor || cfg.color || "#38bdf8",
				"circle-stroke-color": cfg.color || "#0ea5e9",
				"circle-stroke-width": cfg.weight ?? 1,
				"circle-opacity": typeof cfg.fillOpacity === "number" ? cfg.fillOpacity : 0.8
			}});
			// Cursor + popup
			try {
				map.on("mouseenter", circleId, () => { container.style.cursor = "pointer"; });
				map.on("mouseleave", circleId, () => { container.style.cursor = ""; });
				map.on("click", circleId, (e) => {
					const f = e?.features?.[0]; if (!f) return;
					const coords = f.geometry?.coordinates;
					const p = f.properties || {};
					const title = p.title || p.name || "Restaurante";
					const cat = p.categoryName || p.category || "";
					const reviews = Number(p.reviewsCount) || 0;
					const hood = p.neighborhood || "";
					const stars = Number(p.totalScore);
					const estrellas = Number.isFinite(stars) ? stars.toFixed(1) : "";
					new mapboxgl.Popup({ closeButton: true })
						.setLngLat(coords)
						.setHTML(`<div style=\"font-weight:600;margin-bottom:4px;\">${title}</div>
						  <div style=\"font-size:12px;color:#374151;\">${cat}</div>
						  <div style=\"font-size:12px;color:#374151;\">Barrio: ${hood}</div>
						  <div style=\"font-size:12px;color:#374151;\">Estrellas: ${estrellas}</div>
						  <div style=\"font-size:12px;color:#374151;\">Reseñas: ${reviews}</div>`)
						.addTo(map);
				});
			} catch { /* ignore */ }
			// Legend
			const legend = makeLegendContainer();
			legend.style.display = "none";
			const color = cfg.fillColor || cfg.color || "#38bdf8";
			legend.innerHTML = `<div style=\"font-weight:600;margin-bottom:4px;\">${name}</div>`
				+ `<div style=\"display:flex;align-items:center;margin:2px 0;\">`
				+ `<span style=\"display:inline-block;width:14px;height:14px;background:${color};border:1px solid #9ca3af;margin-right:6px;\"></span>`
				+ `<span>Punto</span>`
				+ `</div>`;
			container.appendChild(legend);
			return { name, sources: [sourceId], layers: [circleId], legendEl: legend };
		} catch (e) { derror("points layer failed", e); }
		return null;
	};

	const buildCategoricalPointsOverlay = ({ name, geo, property = "categoryName" }) => {
		try {
			const sourceId = `pt-cat-src-${name}`;
			const layerId = `pt-cat-circle-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			// Collect categories and frequencies
			const freq = new Map();
			for (const f of (geo.features || [])) {
				const v = String(f?.properties?.[property] ?? "Otros");
				freq.set(v, (freq.get(v) || 0) + 1);
			}
			const cats = Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
			const maxCats = Math.max(1, Math.min(12, Number(layerStyles?.[name]?.categoriesLimit) || 12));
			const topCats = cats.slice(0, maxCats);
			const othersLabel = "Otros";
			// Qualitative palette (12 distinct)
			const palette = layerStyles?.[name]?.palette || [
				"#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
				"#e377c2","#7f7f7f","#bcbd22","#17becf","#6b7280","#22c55e"
			];
			const colorByCat = new Map();
			for (let i = 0; i < topCats.length; i++) colorByCat.set(topCats[i], palette[i % palette.length]);
			const defaultColor = layerStyles?.[name]?.defaultColor || "#9ca3af";
			const matchInput = ["coalesce", ["to-string", ["get", property]], othersLabel];
			const colorExpr = ["match", matchInput];
			for (const c of topCats) { colorExpr.push(c, colorByCat.get(c) || defaultColor); }
			colorExpr.push(othersLabel, defaultColor);
			colorExpr.push(defaultColor);
			const cfg = layerStyles?.[name]?.point || {};
			addLayerOnce({ id: layerId, type: "circle", source: sourceId, paint: {
				"circle-radius": cfg.radiusBase ?? 3,
				"circle-color": colorExpr,
				"circle-stroke-color": cfg.strokeColor || "#111827",
				"circle-stroke-width": cfg.weight ?? 0.5,
				"circle-opacity": typeof cfg.fillOpacity === "number" ? cfg.fillOpacity : 0.9
			}});
			// Cursor + popup
			try {
				map.on("mouseenter", layerId, () => { container.style.cursor = "pointer"; });
				map.on("mouseleave", layerId, () => { container.style.cursor = ""; });
				map.on("click", layerId, (e) => {
					const f = e?.features?.[0]; if (!f) return;
					const coords = f.geometry?.coordinates;
					const p = f.properties || {};
					const title = p.title || p.name || "Restaurante";
					const cat = String(p[property] ?? p.categoryName ?? "");
					const reviews = Number(p.reviewsCount) || 0;
					const hood = p.neighborhood || "";
					const stars = Number(p.totalScore);
					const estrellas = Number.isFinite(stars) ? stars.toFixed(1) : "";
					new mapboxgl.Popup({ closeButton: true })
						.setLngLat(coords)
						.setHTML(`<div style=\"font-weight:600;margin-bottom:4px;\">${title}</div>
						  <div style=\"font-size:12px;color:#374151;\">${cat}</div>
						  <div style=\"font-size:12px;color:#374151;\">Barrio: ${hood}</div>
						  <div style=\"font-size:12px;color:#374151;\">Estrellas: ${estrellas}</div>
						  <div style=\"font-size:12px;color:#374151;\">Reseñas: ${reviews}</div>`)
						.addTo(map);
				});
			} catch { /* ignore */ }
			// Legend
			const legend = makeLegendContainer();
			legend.style.display = "none";
			legend.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${name}</div>`
				+ topCats.map((c) => `<div style="display:flex;align-items:center;margin:2px 0;">
					<span style="display:inline-block;width:14px;height:14px;background:${colorByCat.get(c)};border:1px solid #9ca3af;margin-right:6px;"></span>
					<span>${c}</span>
				</div>`).join("")
				+ (cats.length > topCats.length ? `<div style="margin-top:4px;color:#374151;font-size:12px;">+ ${(cats.length - topCats.length)} categorías agrupadas como "${othersLabel}"</div>` : "");
			container.appendChild(legend);
			return { name, sources: [sourceId], layers: [layerId], legendEl: legend };
		} catch (e) { derror("categorical points layer failed", e); }
		return null;
	};

	const buildHeatmapOverlay = ({ name, geo }) => {
		try {
			const sourceId = `pt-heat-src-${name}`;
			const layerId = `pt-heat-${name}`;
			addSourceOnce(sourceId, { type: "geojson", data: geo });
			addLayerOnce({ id: layerId, type: "heatmap", source: sourceId, paint: {
				"heatmap-weight": 1,
				"heatmap-intensity": 1.0,
				"heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 18, 14, 28, 16, 40],
				"heatmap-opacity": 0.7
			}});
			return { name, sources: [sourceId], layers: [layerId], legendEl: null };
		} catch (e) { derror("heatmap layer failed", e); }
		return null;
	};

	const getChoroplethStrategy = (name, property) => {
		if (name === "Demografía: White_vs_Total" || property === "White_vs_Total") return buildChoroplethWhiteVsTotal;
		if (name === "% Drive-through sobre restaurantes" || property === "has_drive_thru_vs_total_restaurants") return buildChoroplethDriveThru;
		return ({ geo, name }) => buildChoroplethGeneric({ geo, name });
	};

	map.on("load", () => {
		// Roads — style by F_SYSTEM with overrides and legend
		if (roads) {
			try {
				const roadsGeo = maybeReproject3857To4326(coerceGeoJSON(roads));
				if (roadsGeo) {
					const od = buildRoadsOverlay(roadsGeo);
					if (od) addOverlay(od.name, od.sources, od.layers, od.legendEl);
				}
			} catch (e) { derror("roads layer failed", e); }
		}

		// Choropleths
		for (const entry of choropleths) {
			if (!entry || !entry.data || !entry.property) continue;
			try {
				const geo = coerceGeoJSON(entry.data); if (!geo) continue;
				const name = entry.name || entry.property;
				const strategy = getChoroplethStrategy(name, entry.property);
				const od = strategy({ geo, name, property: entry.property });
				if (od) addOverlay(od.name, od.sources, od.layers, od.legendEl);
			} catch (e) { derror("choropleth failed", e); }
		}

		// Points layers
		for (const [name, data] of Object.entries(pointsLayers || {})) {
			if (!data) continue;
			try {
				const geo = coerceGeoJSON(data); if (!geo) continue;
				const od = buildPointsOverlay(name, geo);
				if (od) addOverlay(od.name, od.sources, od.layers, od.legendEl);
			} catch (e) { derror("points layer failed", e); }
		}

		// Categorical points overlay (e.g., restaurants by category)
		if (categoricalPoints && categoricalPoints.data) {
			try {
				const geo = coerceGeoJSON(categoricalPoints.data); if (geo) {
					const name = categoricalPoints.name || "Puntos por categoría";
					const property = categoricalPoints.property || "categoryName";
					const od = buildCategoricalPointsOverlay({ name, geo, property });
					if (od) addOverlay(od.name, od.sources, od.layers, od.legendEl);
				}
			} catch (e) { derror("categorical points overlay failed", e); }
		}

		// Heatmap points overlay
		const hm = heatmapPoints;
		if (hm && (hm.data || hm.geo || hm.source || hm.features)) {
			try {
				const data = hm.data || hm.geo || hm.source || hm;
				const geo = coerceGeoJSON(data); if (geo) {
					const name = hm.name || "Puntos (heatmap)";
					const od = buildHeatmapOverlay({ name, geo });
					if (od) addOverlay(od.name, od.sources, od.layers, od.legendEl);
				}
			} catch (e) { derror("heatmap overlay failed", e); }
		}

		// Always-on top points (not toggleable, added last to sit on top)
		if (alwaysOnTopPoints && (alwaysOnTopPoints.data || alwaysOnTopPoints.geo || alwaysOnTopPoints.source || alwaysOnTopPoints.features)) {
			try {
				const data = alwaysOnTopPoints.data || alwaysOnTopPoints.geo || alwaysOnTopPoints.source || alwaysOnTopPoints;
				const geo = coerceGeoJSON(data);
				if (geo) {
					const name = alwaysOnTopPoints.name || "Highlights";
					const sourceId = `always-src-${name}`;
					const layerId = `always-pts-${name}`;
					addSourceOnce(sourceId, { type: "geojson", data: geo });
					const cfg = layerStyles?.[name]?.point || {};
					addLayerOnce({ id: layerId, type: "circle", source: sourceId, paint: {
						"circle-radius": cfg.radiusBase ?? 6,
						"circle-color": cfg.fillColor || cfg.color || "#111827",
						"circle-stroke-color": cfg.strokeColor || "#f59e0b",
						"circle-stroke-width": cfg.weight ?? 2,
						"circle-opacity": typeof cfg.fillOpacity === "number" ? cfg.fillOpacity : 0.95
					}});
					try {
						map.on("mouseenter", layerId, () => { container.style.cursor = "pointer"; });
						map.on("mouseleave", layerId, () => { container.style.cursor = ""; });
						map.on("click", layerId, (e) => {
							const f = e?.features?.[0]; if (!f) return;
							const coords = f.geometry?.coordinates;
							new mapboxgl.Popup({ closeButton: true })
								.setLngLat(coords)
								.setHTML(`<div style=\"font-weight:600;margin-bottom:4px;\">${name}</div>`)
								.addTo(map);
						});
					} catch { /* ignore */ }
				}
			} catch (e) { derror("always-on points failed", e); }
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


