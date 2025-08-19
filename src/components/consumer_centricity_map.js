import * as L from "npm:leaflet";

// Ensure Leaflet CSS is loaded (avoid dynamic CSS module import issues)
if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
  const leafletCssLink = document.createElement("link");
  leafletCssLink.id = "leaflet-css";
  leafletCssLink.rel = "stylesheet";
  leafletCssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(leafletCssLink);
}

/**
 * Render an interactive Leaflet map with toggleable overlay layers.
 *
 * @param {Object} options
 * @param {[number, number]} [options.center=[29.7604, -95.3698]] - Map center [lat, lon].
 * @param {number} [options.zoom=10] - Initial zoom level.
 * @param {Object|null} [options.roads=null] - GeoJSON for road network; styled by FC_DESC/F_SYSTEM if present.
 * @param {Object|null} [options.demographics=null] - GeoJSON for line layer (not polygons).
 * @param {string} [options.demographicProperty] - Property to style lines by (must be numeric).
 * @param {Object} [options.pointsLayers={}] - Dictionary of name -> GeoJSON for point or mixed geometry layers.
 * @param {Object} [options.size] - Optional size {width, height}.
 */
export function consumerCentricityMap({
  center = [29.7604, -95.3698],
  zoom = 10,
  roads = null,
  demographics = null,
  demographicProperty,
  choropleths = [],
  pointsLayers = {},
  size
} = {}) {
  // Helpers to validate/coerce incoming data to valid GeoJSON
  const isFeature = (obj) => obj && obj.type === "Feature" && obj.geometry != null;
  const isGeometry = (obj) =>
    obj && (obj.type === "Point" || obj.type === "MultiPoint" || obj.type === "LineString" ||
    obj.type === "MultiLineString" || obj.type === "Polygon" || obj.type === "MultiPolygon" ||
    obj.type === "GeometryCollection");
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
      // FeatureCollection without type
      if (obj && Array.isArray(obj.features) && !obj.type) {
        return { type: "FeatureCollection", features: obj.features };
      }
      // Array of features
      if (Array.isArray(obj) && obj.every((f) => isFeature(f))) {
        return { type: "FeatureCollection", features: obj };
      }
      // Single geometry
      if (isGeometry(obj)) {
        return { type: "Feature", geometry: obj, properties: {} };
      }
    } catch (err) {
      // fallthrough
    }
    return null;
  };
  // Debug: log input options
  if (typeof window !== "undefined" && window.console && window.console.debug) {
    window.console.debug("[consumerCentricityMap] options:", {
      center,
      zoom,
      roads,
      demographics,
      demographicProperty,
      pointsLayers,
      size
    });
  }

  const container = document.createElement("div");
  container.style.width = size?.width ? `${size.width}px` : "100%";
  container.style.height = size?.height ? `${size.height}px` : "640px";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";

  const map = L.map(container, {
    center,
    zoom,
    preferCanvas: true
  });

  const baseLayers = {
    "OSM Light": L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors" }
    ),
    "Toner Lite": L.tileLayer(
      "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
      { attribution: "Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap" }
    )
  };
  baseLayers["OSM Light"].addTo(map);

  const overlays = {};

  // Default distinctive styles per overlay name
  const namedLayerStyles = {
    "POIs relevantes": { color: "#0f766e", fillColor: "#14b8a6", weight: 1, fillOpacity: 0.6 },
    "Restaurantes": { color: "#f97316", fillColor: "#fb923c", weight: 1, fillOpacity: 0.6 },
    "Competencia": { color: "#ef4444", fillColor: "#f87171", weight: 1, fillOpacity: 0.6 },
    "Pastes Kikos": { color: "#a855f7", fillColor: "#c084fc", weight: 1, fillOpacity: 0.7 },
    "Estaciones permanentes": { color: "#2563eb", fillColor: "#60a5fa", weight: 2, fillOpacity: 0.7 },
    "Estaciones de servicio": { color: "#f59e0b", fillColor: "#fbbf24", weight: 1.5, fillOpacity: 0.6 },
    "Centros educativos": { color: "#6366f1", fillColor: "#818cf8", weight: 1, fillOpacity: 0.6 },
    "Congestión futura": { color: "#a16207", fillColor: "#fde68a", weight: 2.5, fillOpacity: 0.3 }
  };
  const getNamedStyle = (name) => namedLayerStyles[name] || { color: "#0ea5e9", fillColor: "#38bdf8", weight: 1, fillOpacity: 0.5 };

  // Roads layer (hierarchy styling by FC_DESC/F_SYSTEM)
  if (roads) {
    if (typeof window !== "undefined" && window.console && window.console.debug) {
      window.console.debug("[consumerCentricityMap] Adding roads layer", roads);
    }
    const roadsGeo = coerceGeoJSON(roads);
    if (!roadsGeo) {
      if (typeof window !== "undefined" && window.console && window.console.error) {
        window.console.error("[consumerCentricityMap] Invalid GeoJSON for roads; skipping layer");
      }
    } else {
      const byFSystem = {
        1: { label: "Interstate", color: "#e41a1c", weight: 3.5 },
        2: { label: "Principal Arterial (Fwy/Exp)", color: "#377eb8", weight: 3 },
        3: { label: "Principal Arterial (Other)", color: "#4daf4a", weight: 2.5 },
        4: { label: "Minor Arterial", color: "#984ea3", weight: 2 },
        5: { label: "Major Collector", color: "#ff7f00", weight: 1.75 },
        6: { label: "Minor Collector", color: "#a65628", weight: 1.5 }
      };
      const roadStyle = (feature) => {
        const code = feature?.properties?.F_SYSTEM;
        if (typeof code === "number" && byFSystem[code]) {
          const s = byFSystem[code];
          return { color: s.color, weight: s.weight };
        }
        return { color: "#6b7280", weight: 1.25 };
      };

      try {
        const roadsLayer = L.geoJSON(roadsGeo, { style: roadStyle });
        overlays["Jerarquía vial"] = roadsLayer;
        // Legend for F_SYSTEM
        const legend = L.control({ position: "bottomright" });
        legend.onAdd = function () {
          const div = L.DomUtil.create("div", "info legend");
          const entries = Object.entries(byFSystem);
          div.style.background = "rgba(255,255,255,0.9)";
          div.style.padding = "8px";
          div.style.borderRadius = "6px";
          div.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">F_SYSTEM</div>` + entries.map(([code, s]) => {
            return `<div style="display:flex;align-items:center;margin:2px 0;">
              <span style="display:inline-block;width:14px;height:3px;background:${s.color};margin-right:6px;"></span>
              <span>${code} — ${s.label}</span>
            </div>`;
          }).join("");
          return div;
        };
        legend.addTo(map);
      } catch (e) {
        if (typeof window !== "undefined" && window.console && window.console.error) {
          window.console.error("[consumerCentricityMap] Failed to add roads layer:", e);
        }
      }
    }
  }

  // Helper to create a line layer styled by a property (not a polygon choropleth)
  const createLinePropertyLayer = ({ data, property, name, colors }) => {
    const geo = coerceGeoJSON(data);
    if (!geo) return null;
    const values = [];
    try {
      for (const f of geo.features || []) {
        const v = f?.properties?.[property];
        if (typeof v === "number" && Number.isFinite(v)) values.push(v);
      }
    } catch (err) {
      // ignore
    }
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 1;
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
    const colorFor = (v) => {
      if (v == null || !Number.isFinite(v) || max === min) return "#e5e7eb";
      const t = clamp01((v - min) / (max - min));
      if (Array.isArray(colors) && colors.length === 2) {
        return mixHex(colors[0], colors[1], t);
      }
      const hue = 240 - t * 240; // default blue→red
      return `hsl(${hue}, 85%, 45%)`;
    };
    const style = (feature) => {
      const v = feature?.properties?.[property];
      return {
        color: colorFor(typeof v === "number" ? v : NaN),
        weight: 4,
        opacity: 0.85
      };
    };
    const onEachFeature = (feature, layer) => {
      const v = feature?.properties?.[property];
      const val = typeof v === "number" ? v : "N/A";
      const title = feature?.properties?.NAME || feature?.properties?.GEOID || "Segmento";
      layer.bindPopup(`<strong>${title}</strong><br>${property}: ${val}`);
    };
    try {
      return { layer: L.geoJSON(geo, { style, onEachFeature }), name: name || `Líneas: ${property}` };
    } catch {
      return null;
    }
  };

  // Helper to create future congestion categorical line layer by FUT_CONG
  const createFutureCongestionLayer = (data) => {
    const geo = coerceGeoJSON(data);
    if (!geo) return null;
    const colorByStatus = {
      "Uncongested": "#16a34a",
      "Moderately Congested": "#f59e0b",
      "Congested": "#dc2626",
      "Severely Congested": "#991b1b",
      "Heavily Congested": "#7f1d1d"
    };
    const presentStatuses = new Set();
    try {
      for (const f of geo.features || []) {
        const s = f?.properties?.FUT_CONG;
        if (typeof s === "string" && s.length) presentStatuses.add(s);
      }
    } catch (err) {
      // ignore
    }
    const style = (feature) => {
      const s = feature?.properties?.FUT_CONG;
      const color = colorByStatus[s] || "#6b7280";
      return { color, weight: 3, opacity: 0.9 };
    };
    const onEachFeature = (feature, layer) => {
      const p = feature?.properties || {};
      const rte = p.RTE_NM || p.NAME || "Segmento";
      const status = p.FUT_CONG || "N/A";
      const year = p.DESGN_YEAR ? ` (${p.DESGN_YEAR})` : "";
      layer.bindPopup(`<strong>${rte}</strong><div>${status}${year}</div>`);
    };
    const layer = L.geoJSON(geo, { style, onEachFeature });
    // Legend control
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "rgba(255,255,255,0.9)";
      div.style.padding = "8px";
      div.style.borderRadius = "6px";
      div.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">Congestión Futura</div>` + Array.from(presentStatuses).map((s) => {
        const color = colorByStatus[s] || "#6b7280";
        return `<div style="display:flex;align-items:center;margin:2px 0;">
          <span style="display:inline-block;width:14px;height:3px;background:${color};margin-right:6px;"></span>
          <span>${s}</span>
        </div>`;
      }).join("");
      return div;
    };
    legend.addTo(map);
    return layer;
  };

  // Legacy single demographics to line property layer list
  if (demographics && demographicProperty) {
    choropleths = [
      ...choropleths,
      { data: demographics, property: demographicProperty, name: `Líneas: ${demographicProperty}` }
    ];
  }

  // Add all line property layers (previously choropleths)
  for (const entry of choropleths) {
    if (!entry || !entry.data || !entry.property) continue;
    const result = createLinePropertyLayer(entry);
    if (result && result.layer) {
      overlays[result.name] = result.layer;
    }
  }

  // Points or mixed-geometry layers
  for (const [name, data] of Object.entries(pointsLayers)) {
    if (!data) continue;
    if (typeof window !== "undefined" && window.console && window.console.debug) {
      window.console.debug(`[consumerCentricityMap] Adding points layer: ${name}`, data);
    }
    const geo = coerceGeoJSON(data);
    if (!geo) {
      if (typeof window !== "undefined" && window.console && window.console.error) {
        window.console.error(`[consumerCentricityMap] Invalid GeoJSON for points layer: ${name}; skipping`);
      }
      continue;
    }
    let layer;
    try {
      const namedStyle = getNamedStyle(name);
      // Special styling for future congestion lines by FUT_CONG categories
      if (name === "Congestión futura") {
        const futLayer = createFutureCongestionLayer(geo);
        if (futLayer) {
          overlays[name] = futLayer;
          continue;
        }
      }
      layer = L.geoJSON(geo, {
        pointToLayer: (feature, latlng) => {
          const score = feature?.properties?.totalScore;
          const base = 6;
          const radius = Number.isFinite(score) ? base + Math.max(0, Math.min(10, score)) : base;
          return L.circleMarker(latlng, {
            radius,
            color: namedStyle.color,
            weight: namedStyle.weight ?? 1,
            fillColor: namedStyle.fillColor,
            fillOpacity: 0.8
          });
        },
        style: {
          color: namedStyle.color,
          weight: namedStyle.weight ?? 1,
          fillColor: namedStyle.fillColor,
          fillOpacity: namedStyle.fillOpacity ?? 0.5
        },
        onEachFeature: (feature, layer) => {
          const p = feature?.properties || {};
          const title = p.title || p.name || p.categoryName || "Elemento";
          const cat = p.category || p.categoryName || "";
          const addr = p.address || p.street || "";
          const score = p.totalScore != null ? `Score: ${p.totalScore}` : "";
          const content = [
            `<strong>${title}</strong>`,
            cat ? `<div>${cat}</div>` : "",
            addr ? `<div>${addr}</div>` : "",
            score
          ].join("");
          layer.bindPopup(content);
        }
      });
      overlays[name] = layer;
    } catch (e) {
      if (typeof window !== "undefined" && window.console && window.console.error) {
        window.console.error(`[consumerCentricityMap] Failed to add points layer: ${name}:`, e);
      }
    }
  }

  // Add selected overlays and control
  const added = [];
  for (const [name, layer] of Object.entries(overlays)) {
    layer.addTo(map);
    added.push(name);
  }

  if (typeof window !== "undefined" && window.console && window.console.debug) {
    window.console.debug("[consumerCentricityMap] Overlays added:", added);
  }

  L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

  // Invalidate size after mount to ensure proper initial render in responsive containers
  setTimeout(() => map.invalidateSize(), 0);

  if (typeof window !== "undefined" && window.console && window.console.debug) {
    window.console.debug("[consumerCentricityMap] Map initialized and returned container");
  }

  return container;
}
