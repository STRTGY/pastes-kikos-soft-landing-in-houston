import mapboxgl, { ensureMapboxAccessToken, createMapboxMap, waitForContainerSize } from "./mapbox_utils.js";

const DEBUG = typeof window !== "undefined" ? (window.DEBUG_HUNGER_INDEX ?? true) : true;
const dlog = (...args) => { if (DEBUG) console.log("[HungerIndexMB]", ...args); };
const dwarn = (...args) => console.warn("[HungerIndexMB]", ...args);
const derror = (...args) => console.error("[HungerIndexMB]", ...args);

const DEFAULT_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";

// Throttle helper to reduce recomputations on slider input
function throttle(func, waitMs) {
  let last = 0;
  let timer = null;
  let queuedArgs = null;
  const run = (ctx, args) => {
    last = Date.now();
    timer = null;
    queuedArgs = null;
    try { func.apply(ctx, args); } catch (e) { console.error(e); }
  };
  return function throttled(...args) {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    if (remaining <= 0 || remaining > waitMs) {
      if (timer) { clearTimeout(timer); timer = null; }
      run(this, args);
    } else {
      queuedArgs = args;
      if (!timer) timer = setTimeout(() => run(this, queuedArgs), remaining);
    }
  };
}

// Palette helpers
function getPaletteStops(name) {
  switch ((name || "").toLowerCase()) {
    case "viridis":
      return ["#440154", "#21908C", "#FDE725"]; // low, mid, high
    case "cividis":
      return ["#00204C", "#575D6D", "#FFE945"];
    case "ylorrd":
      return ["#ffffcc", "#fd8d3c", "#bd0026"];
    case "gorr":
    default:
      return ["#22c55e", "#f59e0b", "#dc2626"]; // green→orange→red
  }
}
function gridFillColorExpression(paletteName) {
  const [low, mid, high] = getPaletteStops(paletteName);
  return [
    "interpolate",
    ["linear"],
    ["feature-state", "hunger01"],
    0.0, low,
    0.5, mid,
    1.0, high
  ];
}

// Caches
const hungerCache = new Map(); // timeIndex -> { counts: number[], hunger: number[] }
const weightsCache = new Map(); // timeIndex -> Map(id -> w)

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

function computeBBox(geo) {
	let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
	try {
		for (const f of geo.features || []) {
			const g = f?.geometry;
			if (!g || g.type !== "Point") continue;
			const [lng, lat] = g.coordinates || [];
			if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
			if (lat < minLat) minLat = lat;
			if (lng < minLng) minLng = lng;
			if (lat > maxLat) maxLat = lat;
			if (lng > maxLng) maxLng = lng;
		}
	} catch { /* ignore */ }
	if (!Number.isFinite(minLat)) return null;
	return { minLat, minLng, maxLat, maxLng };
}

function buildGridPolygons(restaurantsGeo, cellSizeDegrees, getWeight, layerStyles) {
	const geo = coerceGeoJSON(restaurantsGeo);
	if (!geo) return null;
	const bbox = computeBBox(geo);
	if (!bbox) return null;
	const pad = cellSizeDegrees;
	let minLat = bbox.minLat - pad;
	let maxLat = bbox.maxLat + pad;
	let minLng = bbox.minLng - pad;
	let maxLng = bbox.maxLng + pad;
	const approxCols = Math.max(1, Math.round((maxLng - minLng) / cellSizeDegrees));
	const approxRows = Math.max(1, Math.round((maxLat - minLat) / cellSizeDegrees));
	const maxCells = 2500;
	let lngStep = cellSizeDegrees;
	let latStep = cellSizeDegrees;
	if (approxCols * approxRows > maxCells) {
		const scale = Math.sqrt((approxCols * approxRows) / maxCells);
		lngStep *= scale;
		latStep *= scale;
	}
	const cols = Math.max(1, Math.ceil((maxLng - minLng) / lngStep));
	const rows = Math.max(1, Math.ceil((maxLat - minLat) / latStep));
	maxLng = minLng + cols * lngStep;
	maxLat = minLat + rows * latStep;

	const points = [];
	for (const f of geo.features || []) {
		const g = f?.geometry;
		if (!g || g.type !== "Point") continue;
		const [lng, lat] = g.coordinates || [];
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
		points.push([lng, lat, f.properties || {}]);
	}
	const counts = new Array(rows * cols).fill(0);
	const idx = (r, c) => r * cols + c;
	const colForLng = (x) => Math.max(0, Math.min(cols - 1, Math.floor((x - minLng) / lngStep)));
	const rowForLat = (y) => Math.max(0, Math.min(rows - 1, Math.floor((y - minLat) / latStep)));
	for (const [x, y, props] of points) {
		const c = colForLng(x);
		const r = rowForLat(y);
		const w = typeof getWeight === "function" ? Number(getWeight(props)) : 1;
		counts[idx(r, c)] += Number.isFinite(w) ? Math.max(0, w) : 0;
	}
	const minCount = counts.length ? Math.min(...counts) : 0;
	const maxCount = counts.length ? Math.max(...counts) : 1;

	const features = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const west = minLng + c * lngStep;
			const east = west + lngStep;
			const south = minLat + r * latStep;
			const north = south + latStep;
			const count = counts[idx(r, c)];
			const t = maxCount === minCount ? 0 : (count - minCount) / (maxCount - minCount);
			const hunger01 = 1 - t;
			features.push({
				type: "Feature",
				properties: { hunger01 },
				geometry: {
					type: "Polygon",
					coordinates: [[
						[west, south], [east, south], [east, north], [west, north], [west, south]
					]]
				}
			});
		}
	}
	return { type: "FeatureCollection", features };
}

// New: Meter-based grid with pre-binning and feature-state updating
function buildMeterGridPrebinned(restaurantsGeo, {
  cellSizeMeters = 500,
  cellSizeDegrees, // deprecated
  normalization = { type: "minmax", ignoreZeros: true }
} = {}) {
  const geo = coerceGeoJSON(restaurantsGeo);
  if (!geo) return null;
  const bbox = computeBBox(geo);
  if (!bbox) return null;
  const meanLat = (bbox.minLat + bbox.maxLat) / 2;
  const cosLat = Math.max(0.000001, Math.cos((meanLat * Math.PI) / 180));
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * cosLat;
  let latStepDeg, lngStepDeg;
  if (typeof cellSizeMeters === "number" && cellSizeMeters > 0) {
    latStepDeg = cellSizeMeters / metersPerDegLat;
    lngStepDeg = cellSizeMeters / metersPerDegLng;
  } else {
    const deg = typeof cellSizeDegrees === "number" && cellSizeDegrees > 0 ? cellSizeDegrees : 0.01;
    latStepDeg = deg; lngStepDeg = deg;
  }
  // pad one cell
  let minLat = bbox.minLat - latStepDeg;
  let maxLat = bbox.maxLat + latStepDeg;
  let minLng = bbox.minLng - lngStepDeg;
  let maxLng = bbox.maxLng + lngStepDeg;
  // cell limit
  const approxCols = Math.max(1, Math.round((maxLng - minLng) / lngStepDeg));
  const approxRows = Math.max(1, Math.round((maxLat - minLat) / latStepDeg));
  const maxCells = 4000;
  if (approxCols * approxRows > maxCells) {
    const scale = Math.sqrt((approxCols * approxRows) / maxCells);
    lngStepDeg *= scale; latStepDeg *= scale;
  }
  const cols = Math.max(1, Math.ceil((maxLng - minLng) / lngStepDeg));
  const rows = Math.max(1, Math.ceil((maxLat - minLat) / latStepDeg));
  maxLng = minLng + cols * lngStepDeg;
  maxLat = minLat + rows * latStepDeg;

  const points = [];
  for (const f of geo.features || []) {
    const g = f?.geometry; if (!g || g.type !== "Point") continue;
    const [lng, lat] = g.coordinates || []; if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    points.push({ id: f.id ?? f.properties?.id, lng, lat, props: f.properties || {} });
  }
  const colForLng = (x) => Math.max(0, Math.min(cols - 1, Math.floor((x - minLng) / lngStepDeg)));
  const rowForLat = (y) => Math.max(0, Math.min(rows - 1, Math.floor((y - minLat) / latStepDeg)));
  const idxRC = (r, c) => r * cols + c;

  const assignments = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    assignments[i] = idxRC(rowForLat(p.lat), colForLng(p.lng));
  }

  const features = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const west = minLng + c * lngStepDeg;
      const east = west + lngStepDeg;
      const south = minLat + r * latStepDeg;
      const north = south + latStepDeg;
      const id = idxRC(r, c);
      features.push({
        type: "Feature",
        id,
        properties: { id, hunger01: 0 },
        geometry: { type: "Polygon", coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]] }
      });
    }
  }
  const geojson = { type: "FeatureCollection", features };

  const computeCounts = (weightGetter) => {
    const counts = new Array(rows * cols).fill(0);
    for (let i = 0; i < points.length; i++) {
      const w = Number(weightGetter(points[i].props));
      if (!Number.isFinite(w) || w <= 0) continue;
      counts[assignments[i]] += w;
    }
    return counts;
  };
  const normalizeCounts = (counts) => {
    const ignoreZeros = Boolean(normalization?.ignoreZeros);
    let list = counts;
    if (ignoreZeros) list = counts.filter((v) => v > 0);
    let min = 0, max = 1;
    if (normalization?.type === "fixed" && Array.isArray(normalization?.domain) && normalization.domain.length === 2) {
      min = Number(normalization.domain[0]);
      max = Number(normalization.domain[1]);
      if (!Number.isFinite(min)) min = 0;
      if (!Number.isFinite(max) || max <= min) max = min + 1;
    } else if (normalization?.type === "quantile") {
      const sorted = [...list].sort((a, b) => a - b);
      const q05 = sorted.length ? sorted[Math.floor(0.05 * (sorted.length - 1))] : 0;
      const q95 = sorted.length ? sorted[Math.floor(0.95 * (sorted.length - 1))] : 1;
      min = q05; max = q95 > q05 ? q95 : q05 + 1;
    } else {
      min = list.length ? Math.min(...list) : 0;
      max = list.length ? Math.max(...list) : 1;
      if (max <= min) max = min + 1;
    }
    const hunger01 = new Array(counts.length);
    for (let i = 0; i < counts.length; i++) {
      const t = Math.max(0, Math.min(1, (counts[i] - min) / (max - min)));
      hunger01[i] = 1 - t;
    }
    return hunger01;
  };

  return { geojson, points, assignments, dims: { rows, cols, minLat, minLng, latStepDeg, lngStepDeg }, computeCounts, normalizeCounts };
}

export default function hungerIndexMapbox({
	center = [29.7604, -95.3698],
	zoom = 7,
	restaurants,
	size,
	// New options
	cellSizeMeters = 500,
	normalization = { type: "minmax", ignoreZeros: true },
	palette = "YlOrRd",
	showRestaurants = true,
	showHeatmap = true,
	showGrid = true,
	useMask = false,
	throttleMs = 120,
	// Back-compat
	cellSizeDegrees,
	maskGeometry,
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
	let selectedDay = Math.max(0, Math.min(6, new Date().getDay()));
	let selectedHour = Math.max(0, Math.min(23, new Date().getHours()));
	let currentPalette = palette;
	let isPlaying = false;
	let playTimer = null;
	let playIntervalMs = 700;
	let legendEl = null;
	let infoEl = null;

	// UI controls (reuse DOM approach)
	const controls = document.createElement("div");
	controls.style.position = "absolute";
	controls.style.top = "10px";
	controls.style.left = "10px";
	controls.style.zIndex = "1000";
	controls.style.background = "rgba(255,255,255,0.95)";
	controls.style.padding = "8px 10px";
	controls.style.borderRadius = "6px";
	controls.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
	controls.style.font = "14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
	const label = document.createElement("div");
	const daySlider = document.createElement("input");
	const hourSlider = document.createElement("input");
	const uiRow = document.createElement("div");
	uiRow.style.display = "flex";
	uiRow.style.gap = "8px";
	uiRow.style.flexWrap = "wrap";

	// Palette selector
	const paletteLabel = document.createElement("label"); paletteLabel.textContent = "Paleta:"; paletteLabel.style.marginLeft = "8px";
	const paletteSelect = document.createElement("select");
	["YlOrRd","Viridis","Cividis","GoRR"].forEach((p) => { const o = document.createElement("option"); o.value = p; o.textContent = p; if (p.toLowerCase() === String(palette).toLowerCase()) o.selected = true; paletteSelect.appendChild(o); });

	// Toggles
	const mkToggle = (labelText, checked) => {
		const wrap = document.createElement("label"); wrap.style.marginLeft = "8px"; wrap.style.cursor = "pointer";
		const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!checked; cb.style.marginRight = "4px";
		wrap.appendChild(cb); wrap.appendChild(document.createTextNode(labelText));
		return { wrap, cb };
	};
	const tGrid = mkToggle("Grid", showGrid);
	const tHeat = mkToggle("Heatmap", showHeatmap);
	const tPts = mkToggle("Restaurantes", showRestaurants);

	// Animation controls
	const playBtn = document.createElement("button");
	playBtn.textContent = "▶"; playBtn.title = "Play/Pause";
	playBtn.style.marginLeft = "8px"; playBtn.style.padding = "2px 6px"; playBtn.style.border = "1px solid #9ca3af"; playBtn.style.borderRadius = "4px"; playBtn.style.background = "white"; playBtn.style.cursor = "pointer";
	const speedLabel = document.createElement("label"); speedLabel.textContent = "Velocidad:"; speedLabel.style.marginLeft = "8px";
	const speedSelect = document.createElement("select");
	[{t:"Lenta",v:1200},{t:"Media",v:700},{t:"Rápida",v:350}].forEach(({t,v})=>{ const o=document.createElement("option"); o.value=String(v); o.textContent=t; if(v===playIntervalMs) o.selected=true; speedSelect.appendChild(o); });
	daySlider.type = "range"; daySlider.min = "0"; daySlider.max = "6"; daySlider.step = "1"; daySlider.value = String(selectedDay);
	daySlider.style.width = "220px"; daySlider.style.margin = "6px 0";
	hourSlider.type = "range"; hourSlider.min = "0"; hourSlider.max = "23"; hourSlider.step = "1"; hourSlider.value = String(selectedHour);
	hourSlider.style.width = "220px"; hourSlider.style.margin = "6px 0";
	const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
	const updateLabel = () => { const h = selectedHour.toString().padStart(2, "0"); label.textContent = `Día: ${dayNames[selectedDay]} (${selectedDay}) · Hora: ${h}:00`; };
	updateLabel();
	controls.appendChild(label);
	const dayWrap = document.createElement("div"); dayWrap.textContent = "Día (0=Dom … 6=Sáb)"; dayWrap.style.marginTop = "6px";
	controls.appendChild(dayWrap); controls.appendChild(daySlider);
	const hourWrap = document.createElement("div"); hourWrap.textContent = "Hora (0–23)"; hourWrap.style.marginTop = "6px";
	controls.appendChild(hourWrap); controls.appendChild(hourSlider);

	uiRow.appendChild(paletteLabel); uiRow.appendChild(paletteSelect);
	uiRow.appendChild(tGrid.wrap); uiRow.appendChild(tHeat.wrap); uiRow.appendChild(tPts.wrap);
	uiRow.appendChild(playBtn); uiRow.appendChild(speedLabel); uiRow.appendChild(speedSelect);
	controls.appendChild(uiRow);
	container.appendChild(controls);

	// Info panel (counts, cell area, non-empty cells)
	infoEl = document.createElement("div");
	infoEl.style.position = "absolute";
	infoEl.style.left = "10px";
	infoEl.style.bottom = "10px";
	infoEl.style.zIndex = "1000";
	infoEl.style.background = "rgba(255,255,255,0.9)";
	infoEl.style.padding = "8px";
	infoEl.style.borderRadius = "6px";
	infoEl.style.font = "12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
	container.appendChild(infoEl);

	// Export controls (PNG, GeoJSON, CSV)
	const exportRow = document.createElement("div");
	exportRow.style.position = "absolute";
	exportRow.style.right = "10px";
	exportRow.style.top = "90px";
	exportRow.style.zIndex = "1000";
	exportRow.style.background = "rgba(255,255,255,0.9)";
	exportRow.style.padding = "6px";
	exportRow.style.borderRadius = "6px";
	const btnPng = document.createElement("button"); btnPng.textContent = "PNG"; btnPng.style.marginRight = "6px";
	const btnGeo = document.createElement("button"); btnGeo.textContent = "GeoJSON"; btnGeo.style.marginRight = "6px";
	const btnCsv = document.createElement("button"); btnCsv.textContent = "CSV";
	exportRow.appendChild(btnPng); exportRow.appendChild(btnGeo); exportRow.appendChild(btnCsv);
	container.appendChild(exportRow);

	const restaurantsGeo = coerceGeoJSON(restaurants);
	if (!restaurantsGeo) {
		derror("Invalid or missing restaurants GeoJSON; hunger grid cannot be built");
	}

	// Pre-binned, meter-based grid geometry
	const prebinned = buildMeterGridPrebinned(restaurantsGeo, { cellSizeMeters, cellSizeDegrees, normalization });
	const gridGeo = prebinned?.geojson;

	function updateInfoPanel() {
		if (!infoEl) return;
		const timeIndex = selectedDay * 24 + selectedHour;
		const cached = hungerCache.get(timeIndex);
		const hungerArr = cached?.hunger;
		const counts = cached?.counts;
		const nonEmpty = counts ? counts.filter((v) => v > 0).length : 0;
		const totalCells = prebinned?.dims ? (prebinned.dims.rows * prebinned.dims.cols) : 0;
		const areaKm2 = (() => {
			if (!prebinned?.dims) return "";
			const { latStepDeg, lngStepDeg } = prebinned.dims;
			const meanLat = (prebinned.dims.minLat + (prebinned.dims.minLat + prebinned.dims.rows * prebinned.dims.latStepDeg)) / 2;
			const cosLat = Math.max(0.000001, Math.cos((meanLat * Math.PI)/180));
			const metersPerDegLat = 111320;
			const metersPerDegLng = 111320 * cosLat;
			const cellArea = (latStepDeg * metersPerDegLat) * (lngStepDeg * metersPerDegLng) / 1e6;
			return cellArea.toFixed(3) + " km²/celda";
		})();
		const restaurantsCount = restaurantsGeo?.features?.length || 0;
		infoEl.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">Indicadores</div>
			<div>Restaurantes: ${restaurantsCount}</div>
			<div>Celdas: ${totalCells}</div>
			<div>Celdas no vacías: ${nonEmpty}</div>
			<div>Área celda: ${areaKm2}</div>`;
	}

	const weightFromProperties = (props) => {
		try {
			const idx = selectedDay * 24 + selectedHour;
			let occ = props?.occ;
			if (typeof occ === "string") { try { occ = JSON.parse(occ); } catch { /* ignore */ } }
			const v = Array.isArray(occ) && occ.length >= 168 ? Number(occ[idx]) : NaN;
			if (!Number.isFinite(v)) return 0;
			const clamped = Math.max(0, Math.min(100, v));
			return clamped / 100;
		} catch { return 0; }
	};

	function updateRestaurantsFeatureState() {
		if (!restaurantsGeo) return;
		const timeIndex = selectedDay * 24 + selectedHour;
		let weightsForTime = weightsCache.get(timeIndex);
		if (!weightsForTime) { weightsForTime = new Map(); weightsCache.set(timeIndex, weightsForTime); }
		for (const f of restaurantsGeo.features || []) {
			if (!f || !f.properties) continue;
			const id = f.id ?? f.properties.id; if (id == null) continue;
			let occ = f.properties.occ;
			if (typeof occ === "string") { try { occ = JSON.parse(occ); } catch { /* ignore */ } }
			const v = Array.isArray(occ) && occ.length >= 168 ? Number(occ[timeIndex]) : NaN;
			const clamped = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
			const w = clamped / 100;
			if (weightsForTime.get(id) !== w) {
				weightsForTime.set(id, w);
				map.setFeatureState({ source: "restaurants-raw", id }, { w });
			}
		}
	}

	const addGridLayersOnce = () => {
		if (!gridGeo) return;
		if (!map.getSource("hunger-grid")) {
			map.addSource("hunger-grid", { type: "geojson", data: gridGeo, promoteId: "id" });
		}
		// Optional mask: clip the grid to the mask polygon/multipolygon
		if (useMask && maskGeometry && !map.getSource("mask-geom")) {
			const mask = coerceGeoJSON(maskGeometry);
			if (mask) {
				map.addSource("mask-geom", { type: "geojson", data: mask });
				if (!map.getLayer("mask-fill")) {
					map.addLayer({ id: "mask-fill", type: "fill", source: "mask-geom", paint: { "fill-color": "#000", "fill-opacity": 0 }, layout: { visibility: "none" } });
				}
			}
		}
		if (!map.getLayer("hunger-grid-fill")) {
			const fillOpacity = typeof layerStyles?.["Índice de hambre"]?.fillOpacity === "number"
				? layerStyles["Índice de hambre"].fillOpacity : 0.45;
			map.addLayer({
				id: "hunger-grid-fill",
				type: "fill",
				source: "hunger-grid",
				layout: { visibility: showGrid ? "visible" : "none" },
				paint: { "fill-color": gridFillColorExpression(currentPalette), "fill-opacity": fillOpacity }
			});
		}
		if (!map.getLayer("hunger-grid-outline")) {
			map.addLayer({
				id: "hunger-grid-outline",
				type: "line",
				source: "hunger-grid",
				layout: { visibility: showGrid ? "visible" : "none" },
				paint: { "line-color": "#9ca3af", "line-width": 0.2, "line-opacity": 0.25 }
			});
		}
	};

	function addRestaurantsLayersOnce() {
		if (!restaurantsGeo) return;
		if (!map.getSource("restaurants-cluster")) {
			map.addSource("restaurants-cluster", {
				type: "geojson",
				data: restaurantsGeo,
				promoteId: "id",
				cluster: true,
				clusterRadius: 40,
				clusterMaxZoom: 15
			});
		}
		if (!map.getSource("restaurants-raw")) {
			map.addSource("restaurants-raw", { type: "geojson", data: restaurantsGeo, promoteId: "id" });
		}
		if (!map.getLayer("restaurants-heat")) {
			map.addLayer({
				id: "restaurants-heat",
				type: "heatmap",
				source: "restaurants-raw",
				layout: { visibility: showHeatmap ? "visible" : "none" },
				paint: {
					"heatmap-weight": ["coalesce", ["feature-state", "w"], 0],
					"heatmap-intensity": 1.0,
					"heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 18, 14, 28, 16, 40],
					"heatmap-opacity": 0.7
				}
			});
		}
		if (!map.getLayer("clusters")) {
			map.addLayer({
				id: "clusters",
				type: "circle",
				source: "restaurants-cluster",
				filter: ["has", "point_count"],
				layout: { visibility: showRestaurants ? "visible" : "none" },
				paint: {
					"circle-color": [
						"step", ["get", "point_count"],
						"#60a5fa", 20, "#34d399", 50, "#f59e0b", 100, "#ef4444"
					],
					"circle-radius": [
						"step", ["get", "point_count"],
						14, 20, 18, 50, 24, 100, 30
					],
					"circle-opacity": 0.75
				}
			});
		}
		if (!map.getLayer("cluster-count")) {
			map.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "restaurants-cluster",
				filter: ["has", "point_count"],
				layout: {
					visibility: showRestaurants ? "visible" : "none",
					"text-field": ["get", "point_count_abbreviated"],
					"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
					"text-size": 12
				},
				paint: { "text-color": "#111827" }
			});
		}
		if (!map.getLayer("unclustered-point")) {
			map.addLayer({
				id: "unclustered-point",
				type: "circle",
				source: "restaurants-cluster",
				filter: ["!", ["has", "point_count"]],
				layout: { visibility: showRestaurants ? "visible" : "none" },
				paint: {
					"circle-color": "#ef4444",
					"circle-radius": 4,
					"circle-stroke-width": 0.5,
					"circle-stroke-color": "#111827",
					"circle-opacity": 0.9
				}
			});
			map.on("click", "unclustered-point", (e) => {
				const f = e?.features?.[0];
				if (!f) return;
				const coords = f.geometry?.coordinates;
				const p = f.properties || {};
				const title = p.title || p.name || "Restaurante";
				const cat = p.categoryName || p.category || "";
				const reviews = Number(p.reviewsCount) || 0;
				new mapboxgl.Popup({ closeButton: true })
					.setLngLat(coords)
					.setHTML(`<div style=\"font-weight:600;margin-bottom:4px;\">${title}</div>
					  <div style=\"font-size:12px;color:#374151;\">${cat}</div>
					  <div style=\"font-size:12px;color:#374151;\">Reseñas: ${reviews}</div>`)
					.addTo(map);
			});
		}
	}

	const updateGridFeatureState = () => {
		if (!prebinned) return;
		const timeIndex = selectedDay * 24 + selectedHour;
		let cached = hungerCache.get(timeIndex);
		if (!cached) {
			const counts = prebinned.computeCounts(weightFromProperties);
			const hungerArr = prebinned.normalizeCounts(counts);
			cached = { counts, hunger: hungerArr };
			hungerCache.set(timeIndex, cached);
		}
		const hungerArr = cached.hunger;
		for (let i = 0; i < hungerArr.length; i++) {
			map.setFeatureState({ source: "hunger-grid", id: i }, { hunger01: hungerArr[i] });
		}
	};

	const doUpdate = () => {
		updateLabel();
		addGridLayersOnce();
		updateGridFeatureState();
		addRestaurantsLayersOnce();
		updateRestaurantsFeatureState();
		addLegend();
		updateInfoPanel();
	};
	const throttledUpdate = throttle(doUpdate, throttleMs);
	daySlider.addEventListener("input", (e) => { const v = Number(e.target?.value); if (Number.isFinite(v)) { selectedDay = Math.max(0, Math.min(6, Math.round(v))); throttledUpdate(); } });
	hourSlider.addEventListener("input", (e) => { const v = Number(e.target?.value); if (Number.isFinite(v)) { selectedHour = Math.max(0, Math.min(23, Math.round(v))); throttledUpdate(); } });
	paletteSelect.addEventListener("change", () => {
		currentPalette = paletteSelect.value;
		if (map.getLayer("hunger-grid-fill")) {
			map.setPaintProperty("hunger-grid-fill", "fill-color", gridFillColorExpression(currentPalette));
		}
		addLegend();
	});
	tGrid.cb.addEventListener("change", () => { if (map.getLayer("hunger-grid-fill")) map.setLayoutProperty("hunger-grid-fill", "visibility", tGrid.cb.checked ? "visible" : "none"); if (map.getLayer("hunger-grid-outline")) map.setLayoutProperty("hunger-grid-outline", "visibility", tGrid.cb.checked ? "visible" : "none"); });
	tHeat.cb.addEventListener("change", () => { if (map.getLayer("restaurants-heat")) map.setLayoutProperty("restaurants-heat", "visibility", tHeat.cb.checked ? "visible" : "none"); });
	tPts.cb.addEventListener("change", () => { ["clusters","cluster-count","unclustered-point"].forEach((id) => { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", tPts.cb.checked ? "visible" : "none"); }); });
	btnPng.addEventListener("click", async () => {
		try {
			const w = container.clientWidth || 800;
			const h = container.clientHeight || 600;
			const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
			const ctx = canvas.getContext("2d");
			const mapCanvas = map.getCanvas();
			ctx.drawImage(mapCanvas, 0, 0);
			const a = document.createElement("a"); a.download = "hunger_map.png"; a.href = canvas.toDataURL("image/png"); a.click();
		} catch (e) { console.error(e); }
	});
	btnGeo.addEventListener("click", () => {
		try {
			const timeIndex = selectedDay * 24 + selectedHour;
			const cached = hungerCache.get(timeIndex);
			const hungerArr = cached?.hunger;
			const out = { type: "FeatureCollection", features: [] };
			for (const f of (gridGeo?.features || [])) {
				const id = f.id ?? f.properties?.id; if (id == null) continue;
				const hunger01 = hungerArr ? hungerArr[id] : null;
				out.features.push({ type: "Feature", geometry: f.geometry, properties: { id, hunger01 } });
			}
			const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a"); a.href = url; a.download = "hunger_grid.geojson"; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
		} catch (e) { console.error(e); }
	});
	btnCsv.addEventListener("click", () => {
		try {
			const timeIndex = selectedDay * 24 + selectedHour;
			const cached = hungerCache.get(timeIndex);
			const hungerArr = cached?.hunger;
			const lines = ["id,hunger01"];
			for (const f of (gridGeo?.features || [])) {
				const id = f.id ?? f.properties?.id; if (id == null) continue;
				const h = hungerArr ? hungerArr[id] : "";
				lines.push(`${id},${h}`);
			}
			const blob = new Blob([lines.join("\n")], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a"); a.href = url; a.download = "hunger_grid.csv"; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
		} catch (e) { console.error(e); }
	});
	playBtn.addEventListener("click", () => {
		isPlaying = !isPlaying;
		playBtn.textContent = isPlaying ? "⏸" : "▶";
		if (playTimer) { clearInterval(playTimer); playTimer = null; }
		if (isPlaying) {
			playTimer = setInterval(() => {
				selectedHour = (selectedHour + 1) % 24;
				hourSlider.value = String(selectedHour);
				throttledUpdate();
			}, playIntervalMs);
		}
	});
	speedSelect.addEventListener("change", () => {
		const v = Number(speedSelect.value);
		if (Number.isFinite(v) && v > 0) {
			playIntervalMs = v;
			if (isPlaying) {
				clearInterval(playTimer);
				playTimer = setInterval(() => {
					selectedHour = (selectedHour + 1) % 24;
					hourSlider.value = String(selectedHour);
					throttledUpdate();
				}, playIntervalMs);
			}
		}
	});

	// Click on grid cells
	map.on("click", "hunger-grid-fill", (e) => {
		const f = e?.features?.[0]; if (!f) return;
		const id = f.id ?? f.properties?.id; if (id == null) return;
		const state = map.getFeatureState({ source: "hunger-grid", id }) || {};
		const hunger = state.hunger01 != null ? (state.hunger01 * 100).toFixed(0) + "%" : "n/a";
		const center = turf.centerOfMass(f).geometry.coordinates;
		new mapboxgl.Popup({ closeButton: true })
			.setLngLat(center)
			.setHTML(`<div style=\"font-weight:600;\">Celda ${id}</div><div>Índice de hambre: ${hunger}</div>`)
			.addTo(map);
	});

	let lastZoom = zoom;
	map.on("movestart", () => { try { lastZoom = map.getZoom(); } catch { /* ignore */ } });
	map.on("moveend", () => { try { const newZoom = map.getZoom(); dlog("zoom changed", { from: lastZoom, to: newZoom }); lastZoom = newZoom; } catch { /* ignore */ } });

	const addLegend = () => {
		if (!legendEl) {
			legendEl = document.createElement("div");
			legendEl.style.position = "absolute";
			legendEl.style.right = "10px";
			legendEl.style.bottom = "10px";
			legendEl.style.zIndex = "1000";
			legendEl.style.background = "rgba(255,255,255,0.9)";
			legendEl.style.padding = "8px";
			legendEl.style.borderRadius = "6px";
			container.appendChild(legendEl);
		}
		const [low, mid, high] = getPaletteStops(currentPalette);
		const stops = [0, 20, 40, 60, 80, 100];
		legendEl.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">Índice de hambre</div>`
			+ `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">`
			+ `<span style="display:inline-block;width:14px;height:14px;background:${low};border:1px solid #9ca3af"></span>`
			+ `<span style="display:inline-block;width:14px;height:14px;background:${mid};border:1px solid #9ca3af"></span>`
			+ `<span style="display:inline-block;width:14px;height:14px;background:${high};border:1px solid #9ca3af"></span>`
			+ `</div>`
			+ stops.map((s) => `<div style=\"display:flex;align-items:center;margin:2px 0;\">`
				+ `<span style=\"display:inline-block;width:14px;height:14px;background:linear-gradient(90deg, ${low}, ${mid}, ${high});border:1px solid #9ca3af;margin-right:6px;\"></span>`
				+ `<span>${s}%</span>`
			+ `</div>`).join("");
	};

	map.on("load", () => {
		doUpdate();
		addLegend();
		if (restaurantsGeo) {
			try {
				const bounds = new mapboxgl.LngLatBounds();
				for (const f of restaurantsGeo.features || []) {
					const g = f?.geometry; if (!g || g.type !== "Point") continue;
					const [lng, lat] = g.coordinates || []; if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
					bounds.extend([lng, lat]);
				}
				if (!bounds.isEmpty()) { map.fitBounds(bounds, { padding: 16 }); }
			} catch { /* ignore */ }
		}
	});

	waitForContainerSize(container, map, () => { try { map.resize(); } catch { /* ignore */ } });

	return container;
}


