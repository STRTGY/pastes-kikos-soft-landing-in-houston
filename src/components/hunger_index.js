import * as L from "npm:leaflet";

// Ensure Leaflet CSS is loaded once
if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
  const leafletCssLink = document.createElement("link");
  leafletCssLink.id = "leaflet-css";
  leafletCssLink.rel = "stylesheet";
  leafletCssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(leafletCssLink);
}

// Ensure the global L points to the same instance we're using so plugins can attach properly
if (typeof window !== "undefined") {
  if (!window.L || !Object.isExtensible(window.L)) {
    try {
      // Create a mutable alias that inherits from the imported (non-extensible) module namespace
      window.L = Object.create(L);
    } catch {
      window.L = {};
    }
  }
}

// Ensure Leaflet Heat plugin is loaded once (UMD build attaches to global L)
if (typeof document !== "undefined" && !document.getElementById("leaflet-heat-js")) {
  const heatScript = document.createElement("script");
  heatScript.id = "leaflet-heat-js";
  heatScript.async = true;
  heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js";
  document.head.appendChild(heatScript);
}

// Debug utilities
const DEBUG_HUNGER = typeof window !== "undefined" ? (window.DEBUG_HUNGER_INDEX ?? true) : true;
const debugPrefix = "[HungerIndex]";
const dlog = (...args) => { if (DEBUG_HUNGER) console.log(debugPrefix, ...args); };
const dwarn = (...args) => console.warn(debugPrefix, ...args);
const derror = (...args) => console.error(debugPrefix, ...args);

/**
 * Render a "Hunger Index" map derived from restaurant point data.
 * The index is an inverse density metric computed on a grid: areas with fewer
 * restaurants are colored with higher index values.
 *
 * @param {Object} options
 * @param {[number, number]} [options.center=[29.7604, -95.3698]] - Map center [lat, lon].
 * @param {number} [options.zoom=7] - Initial zoom level.
 * @param {Object|string} [options.restaurants] - Restaurants GeoJSON (FeatureCollection of Points) or JSON string.
 * @param {Object} [options.size] - Optional size {width, height} in px for the container.
 * @param {number} [options.cellSizeDegrees=0.01] - Grid cell size in degrees (~1km near Houston).
 * @param {Object} [options.layerStyles] - Optional style overrides for overlays.
 * @returns {HTMLElement} container element with the Leaflet map.
 */
export function hungerIndexMap({
  center = [29.7604, -95.3698],
  zoom = 7,
  restaurants,
  size,
  cellSizeDegrees = 0.01,
  layerStyles = {}
} = {}) {
  dlog("init", { center, zoom, hasRestaurants: Boolean(restaurants), cellSizeDegrees, size });
  // Basic GeoJSON helpers
  const isFeature = (obj) => obj && obj.type === "Feature" && obj.geometry != null;
  const isGeometry = (obj) => obj && (
    obj.type === "Point" || obj.type === "MultiPoint" ||
    obj.type === "LineString" || obj.type === "MultiLineString" ||
    obj.type === "Polygon" || obj.type === "MultiPolygon" ||
    obj.type === "GeometryCollection"
  );
  const isValidGeoJSON = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    if (obj.type === "FeatureCollection") return Array.isArray(obj.features);
    if (isFeature(obj)) return true;
    if (isGeometry(obj)) return true;
    return false;
  };
  const coerceGeoJSON = (data) => {
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
  };

  const container = document.createElement("div");
  container.style.width = size?.width ? `${size.width}px` : "100%";
  container.style.height = size?.height ? `${size.height}px` : "640px";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  container.style.position = "relative";

  const mapOptions = { center, zoom, preferCanvas: true };
  dlog("Creating Leaflet map with options", mapOptions);
  const map = L.map(container, mapOptions);
  dlog("Leaflet map created", { center: map.getCenter(), zoom: map.getZoom() });

  // Single base layer: OSM Light (no base-layer toggle)
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileOptions = { attribution: "© OpenStreetMap contributors" };
  dlog("Adding base layer", { tileUrl, tileOptions });
  L.tileLayer(
    tileUrl,
    tileOptions
  ).addTo(map);
  dlog("Base layer added");

  let lastZoom = map.getZoom();
  map.on("zoomstart", () => { lastZoom = map.getZoom(); });
  map.on("zoomend", () => {
    const newZoom = map.getZoom();
    dlog("zoom changed", { from: lastZoom, to: newZoom });
    lastZoom = newZoom;
  });

  // UI controls for day/hour selection (occ indexing)
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const now = new Date();
  let selectedDay = Math.max(0, Math.min(6, now.getDay()));
  let selectedHour = Math.max(0, Math.min(23, now.getHours()));

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
  daySlider.type = "range";
  daySlider.min = "0";
  daySlider.max = "6";
  daySlider.step = "1";
  daySlider.value = String(selectedDay);
  daySlider.style.width = "220px";
  daySlider.style.margin = "6px 0";
  hourSlider.type = "range";
  hourSlider.min = "0";
  hourSlider.max = "23";
  hourSlider.step = "1";
  hourSlider.value = String(selectedHour);
  hourSlider.style.width = "220px";
  hourSlider.style.margin = "6px 0";

  const updateLabel = () => {
    const hour = selectedHour.toString().padStart(2, "0");
    label.textContent = `Día: ${dayNames[selectedDay]} (${selectedDay}) · Hora: ${hour}:00`;
  };
  updateLabel();
  dlog("Initial sliders", { selectedDay, selectedHour });

  controls.appendChild(label);
  const dayWrap = document.createElement("div");
  dayWrap.textContent = "Día (0=Dom … 6=Sáb)";
  dayWrap.style.marginTop = "6px";
  controls.appendChild(dayWrap);
  controls.appendChild(daySlider);
  const hourWrap = document.createElement("div");
  hourWrap.textContent = "Hora (0–23)";
  hourWrap.style.marginTop = "6px";
  controls.appendChild(hourWrap);
  controls.appendChild(hourSlider);
  container.appendChild(controls);

  // Utilities for grid generation
  const computeRestaurantsBBox = (geo) => {
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
    dlog("computed bbox", { minLat, minLng, maxLat, maxLng });
    return { minLat, minLng, maxLat, maxLng };
  };

  const buildHeatLayer = (restaurantsGeo, getWeight) => {
    const geo = coerceGeoJSON(restaurantsGeo);
    if (!geo) return null;

    const bbox = computeRestaurantsBBox(geo);
    if (!bbox) {
      dwarn("No valid points to compute bbox; aborting heat layer");
      return null;
    }

    const pad = cellSizeDegrees; // pad one cell around
    let minLat = bbox.minLat - pad;
    let maxLat = bbox.maxLat + pad;
    let minLng = bbox.minLng - pad;
    let maxLng = bbox.maxLng + pad;

    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const mixHex = (a, b, t) => {
      const hex = (n) => (n.toString(16).padStart(2, "0"));
      const pa = a.replace("#", "");
      const pb = b.replace("#", "");
      const ar = parseInt(pa.slice(0,2),16), ag = parseInt(pa.slice(2,4),16), ab = parseInt(pa.slice(4,6),16);
      const br = parseInt(pb.slice(0,2),16), bg = parseInt(pb.slice(2,4),16), bb = parseInt(pb.slice(4,6),16);
      const r = Math.round(ar + (br - ar) * t);
      const g = Math.round(ag + (bg - ag) * t);
      const b2 = Math.round(ab + (bb - ab) * t);
      return `#${hex(r)}${hex(g)}${hex(b2)}`;
    };

    // Ensure the grid is not excessively large
    const approxCols = Math.max(1, Math.round((maxLng - minLng) / cellSizeDegrees));
    const approxRows = Math.max(1, Math.round((maxLat - minLat) / cellSizeDegrees));
    const maxCells = 2500; // safety cap
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
    dlog("grid sizing", { approxCols, approxRows, cols, rows, lngStep, latStep });

    // Pre-extract restaurant coordinates
    const points = [];
    for (const f of geo.features || []) {
      const g = f?.geometry;
      if (!g || g.type !== "Point") continue;
      const [lng, lat] = g.coordinates || [];
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      points.push([lng, lat, f.properties || {}]);
    }
    dlog("points extracted", { count: points.length });

    // Count restaurants per cell (weighted by occ via getWeight)
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
    dlog("counts summary", { minCount, maxCount });

    // Build heat points at cell centers, intensity by hunger01 and store cell bounds for fallback
    const heatCfg = layerStyles?.["Índice de hambre"]?.heat || {};
    const heatPoints = [];
    const cellInfos = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const west = minLng + c * lngStep;
        const east = west + lngStep;
        const south = minLat + r * latStep;
        const north = south + latStep;
        const count = counts[idx(r, c)];
        const t = maxCount === minCount ? 0 : (count - minCount) / (maxCount - minCount);
        const hunger01 = 1 - t; // inverse density
        const centerLat = (south + north) / 2;
        const centerLng = (west + east) / 2;
        heatPoints.push([centerLat, centerLng, hunger01]);
        cellInfos.push({ west, east, south, north, hunger01 });
      }
    }

    const fallbackLayer = L.layerGroup();
    const fallbackRects = [];
    let layerGroup = L.layerGroup([fallbackLayer]);
    let heatLayer = null;
    const fallbackOpacity = typeof layerStyles?.["Índice de hambre"]?.fillOpacity === "number" ? layerStyles["Índice de hambre"].fillOpacity : 0.45;
    // Render immediate fallback rectangles so users see something even if the plugin isn't ready
    for (const info of cellInfos) {
      const bounds = [[info.south, info.west], [info.north, info.east]];
      const color = mixHex("#22c55e", "#dc2626", info.hunger01);
      const rect = L.rectangle(bounds, { weight: 0, fillOpacity: fallbackOpacity, color: color, fillColor: color });
      fallbackRects.push(rect);
      fallbackLayer.addLayer(rect);
    }
    dlog("fallback rectangles rendered", { cells: cellInfos.length });
    
    const getHeatFactory = () => (typeof window !== "undefined" && window.L && window.L.heatLayer) ? window.L.heatLayer : null;
    const createHeat = () => {
      const Heat = getHeatFactory();
      if (!Heat) return;
      const options = {
        radius: typeof heatCfg.radius === "number" ? heatCfg.radius : 28,
        blur: typeof heatCfg.blur === "number" ? heatCfg.blur : 22,
        maxZoom: typeof heatCfg.maxZoom === "number" ? heatCfg.maxZoom : 17,
        minOpacity: typeof heatCfg.minOpacity === "number" ? heatCfg.minOpacity : 0.2,
        gradient: heatCfg.gradient || { 0.0: "#22c55e", 0.5: "#f59e0b", 1.0: "#dc2626" }
      };
      heatLayer = Heat(heatPoints, options);
      layerGroup.addLayer(heatLayer);
      // Remove fallback once heat layer is available
      layerGroup.removeLayer(fallbackLayer);
      dlog("heat layer created", { points: heatPoints.length, options });
    };
    if (getHeatFactory()) {
      createHeat();
    } else {
      // Try to wait for the plugin script to load
      const scriptEl = document.getElementById("leaflet-heat-js");
      if (scriptEl) {
        scriptEl.addEventListener("load", () => {
          if (!heatLayer) createHeat();
          dlog("leaflet-heat script load event fired; heat factory present:", Boolean(getHeatFactory()));
        }, { once: true });
        scriptEl.addEventListener("error", () => {
          derror("Failed to load leaflet-heat plugin script");
        }, { once: true });
      }
      // Fallback retry in case load already fired
      setTimeout(() => {
        if (!heatLayer && getHeatFactory()) createHeat();
      }, 0);
      // Poll for up to 10s in case the script loads late or attaches slowly
      const pollStart = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      const pollInterval = setInterval(() => {
        if (!heatLayer && getHeatFactory()) {
          createHeat();
          clearInterval(pollInterval);
          dlog("heat layer created via polling after plugin became available");
        }
        const nowTs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        if (nowTs - pollStart > 10000) {
          clearInterval(pollInterval);
          dwarn("Timeout waiting for leaflet-heat plugin (10s)");
        }
      }, 250);
      if (!getHeatFactory()) {
        dwarn("Heat layer factory is not yet available; showing fallback rectangles until plugin loads");
      }
    }

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "rgba(255,255,255,0.9)";
      div.style.padding = "8px";
      div.style.borderRadius = "6px";
      const rows = [];
      const stops = [0, 20, 40, 60, 80, 100];
      for (const s of stops) {
        // Map to legend gradient from green to red
        const t = clamp01(s / 100);
        const swatch = mixHex("#22c55e", "#dc2626", t);
        rows.push(`<div style="display:flex;align-items:center;margin:2px 0;">
          <span style="display:inline-block;width:14px;height:14px;background:${swatch};border:1px solid #9ca3af;margin-right:6px;"></span>
          <span>${s}%</span>
        </div>`);
      }
      div.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">Índice de hambre</div>` + rows.join("");
      return div;
    };
    layerGroup.on("add", () => legend.addTo(map));
    layerGroup.on("remove", () => map.removeControl(legend));

    // Updater to recompute intensities for a new getWeight function
    const update = (getWeightNext) => {
      dlog("update invoked");
      const newCounts = new Array(rows * cols).fill(0);
      for (const [x, y, props] of points) {
        const c = colForLng(x);
        const r = rowForLat(y);
        const w = typeof getWeightNext === "function" ? Number(getWeightNext(props)) : 1;
        newCounts[idx(r, c)] += Number.isFinite(w) ? Math.max(0, w) : 0;
      }
      const newMin = newCounts.length ? Math.min(...newCounts) : 0;
      const newMax = newCounts.length ? Math.max(...newCounts) : 1;
      dlog("update counts summary", { newMin, newMax });
      const newHeatPoints = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const west = minLng + c * lngStep;
          const east = west + lngStep;
          const south = minLat + r * latStep;
          const north = south + latStep;
          const count = newCounts[idx(r, c)];
          const t = newMax === newMin ? 0 : (count - newMin) / (newMax - newMin);
          const hunger01 = 1 - t;
          const centerLat = (south + north) / 2;
          const centerLng = (west + east) / 2;
          newHeatPoints.push([centerLat, centerLng, hunger01]);
          // Update fallback rect color if needed
          if (!heatLayer) {
            const i = r * cols + c;
            const color = mixHex("#22c55e", "#dc2626", hunger01);
            const rect = fallbackRects[i];
            if (rect) rect.setStyle({ color, fillColor: color });
          }
        }
      }
      if (heatLayer && typeof heatLayer.setLatLngs === "function") {
        heatLayer.setLatLngs(newHeatPoints);
        dlog("heat layer updated", { points: newHeatPoints.length });
      } else {
        const Heat = getHeatFactory();
        if (Heat) {
        // Create now if it wasn't ready before
        const options = {
          radius: typeof heatCfg.radius === "number" ? heatCfg.radius : 28,
          blur: typeof heatCfg.blur === "number" ? heatCfg.blur : 22,
          maxZoom: typeof heatCfg.maxZoom === "number" ? heatCfg.maxZoom : 17,
          minOpacity: typeof heatCfg.minOpacity === "number" ? heatCfg.minOpacity : 0.2,
          gradient: heatCfg.gradient || { 0.0: "#22c55e", 0.5: "#f59e0b", 1.0: "#dc2626" }
        };
        heatLayer = Heat(newHeatPoints, options);
        layerGroup.clearLayers();
        layerGroup.addLayer(heatLayer);
        // Remove fallback when heat layer becomes available
        layerGroup.removeLayer(fallbackLayer);
        dlog("heat layer created during update", { points: newHeatPoints.length, options });
        } else {
        dwarn("heat layer still unavailable during update; using fallback rectangles");
        }
      }
    };

    return { layer: layerGroup, update };
  };

  // Build heat layer from restaurants and add to map
  const restaurantsGeo = coerceGeoJSON(restaurants);
  if (!restaurantsGeo) {
    derror("Invalid or missing restaurants GeoJSON; heatmap cannot be built", { restaurantsType: typeof restaurants });
  } else {
    const total = Array.isArray(restaurantsGeo.features) ? restaurantsGeo.features.length : 0;
    const pointCount = total ? restaurantsGeo.features.filter(f => f?.geometry?.type === "Point").length : 0;
    dlog("restaurants GeoJSON parsed", { totalFeatures: total, pointFeatures: pointCount });
  }
  // Helper to compute weight from properties.occ for selected day/hour
  const weightFromProperties = (props) => {
    try {
      const idx = selectedDay * 24 + selectedHour;
      let occ = props?.occ;
      if (typeof occ === "string") {
        try { occ = JSON.parse(occ); } catch { /* ignore */ }
      }
      const v = Array.isArray(occ) && occ.length >= 168 ? Number(occ[idx]) : NaN;
      if (!Number.isFinite(v)) return 0;
      const clamped = Math.max(0, Math.min(100, v));
      if (DEBUG_HUNGER && Math.random() < 0.002) dlog("sample weight", { idx, v, clamped, normalized: clamped / 100 });
      return clamped / 100;
    } catch { return 0; }
  };

  let hungerHeat = null;

  // Defer initial heat creation and fitBounds until container has non-zero size
  let initialBuildDone = false;
  const initializeHeatAndFit = () => {
    if (initialBuildDone) return;
    initialBuildDone = true;
    if (restaurantsGeo) {
      console.time(`${debugPrefix} buildHeatLayer`);
      hungerHeat = buildHeatLayer(restaurantsGeo, weightFromProperties);
      console.timeEnd(`${debugPrefix} buildHeatLayer`);
      if (hungerHeat?.layer) {
        hungerHeat.layer.addTo(map); // always on
        dlog("heat layer group added to map");
      }
    }
    // Fit to restaurants extent if available
    try {
      if (restaurantsGeo && restaurantsGeo.features && restaurantsGeo.features.length) {
        const latlngs = [];
        for (const f of restaurantsGeo.features) {
          const g = f?.geometry;
          if (!g || g.type !== "Point") continue;
          const [lng, lat] = g.coordinates || [];
          if (Number.isFinite(lat) && Number.isFinite(lng)) latlngs.push([lat, lng]);
        }
        if (latlngs.length) {
          const fitPadding = [16, 16];
          dlog("fitBounds", { points: latlngs.length, currentZoom: map.getZoom(), padding: fitPadding });
          map.fitBounds(L.latLngBounds(latlngs), { padding: fitPadding });
        } else {
          dwarn("No valid Point features to fit bounds");
        }
      }
    } catch { /* ignore */ }
  };
  const waitForNonZeroSize = () => {
    try { map.invalidateSize(); } catch { /* ignore */ }
    const start = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const maxMs = 10000;
    const tick = () => {
      const w = container.clientWidth || 0;
      const h = container.clientHeight || 0;
      const size = map.getSize ? map.getSize() : { x: 0, y: 0 };
      if ((w > 0 && h > 0) && size.x > 0 && size.y > 0 && !initialBuildDone) {
        dlog("map container ready", { width: w, height: h, size });
        try { map.invalidateSize(); } catch { /* ignore */ }
        initializeHeatAndFit();
        return;
      }
      const nowTs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      if (nowTs - start > maxMs) {
        dwarn("Timeout waiting for non-zero map size; proceeding anyway", { w, h, size });
        initializeHeatAndFit();
        return;
      }
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(tick); else setTimeout(tick, 50);
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(tick); else setTimeout(tick, 0);
  };

  // Wire slider events to update hunger grid
  const triggerUpdate = () => {
    updateLabel();
    if (hungerHeat) {
      dlog("triggerUpdate", { selectedDay, selectedHour });
      hungerHeat.update(weightFromProperties);
    }
  };
  daySlider.addEventListener("input", (e) => {
    const v = Number(e.target?.value);
    if (Number.isFinite(v)) {
      selectedDay = Math.max(0, Math.min(6, Math.round(v)));
      dlog("day changed", { selectedDay });
      triggerUpdate();
    }
  });
  hourSlider.addEventListener("input", (e) => {
    const v = Number(e.target?.value);
    if (Number.isFinite(v)) {
      selectedHour = Math.max(0, Math.min(23, Math.round(v)));
      dlog("hour changed", { selectedHour });
      triggerUpdate();
    }
  });

  // Kick off readiness wait (will initialize heat and fit once sized)
  waitForNonZeroSize();

  // Invalidate size after mount to ensure proper initial render
  setTimeout(() => { dlog("invalidateSize"); map.invalidateSize(); }, 0);

  return container;
}



export default hungerIndexMap;