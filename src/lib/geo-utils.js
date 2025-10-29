/**
 * Utilidades geoespaciales para procesamiento de GeoJSON
 */

/**
 * Verifica si un objeto es un Feature GeoJSON válido
 * @param {*} obj - Objeto a verificar
 * @returns {boolean} True si es un Feature válido
 */
export function isFeature(obj) {
  return obj && obj.type === "Feature" && obj.geometry != null;
}

/**
 * Verifica si un objeto es una Geometry GeoJSON válida
 * @param {*} obj - Objeto a verificar
 * @returns {boolean} True si es una Geometry válida
 */
export function isGeometry(obj) {
  return obj && (
    obj.type === "Point" || obj.type === "MultiPoint" ||
    obj.type === "LineString" || obj.type === "MultiLineString" ||
    obj.type === "Polygon" || obj.type === "MultiPolygon" ||
    obj.type === "GeometryCollection"
  );
}

/**
 * Verifica si un objeto es GeoJSON válido
 * @param {*} obj - Objeto a verificar
 * @returns {boolean} True si es GeoJSON válido
 */
export function isValidGeoJSON(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (obj.type === "FeatureCollection") return Array.isArray(obj.features);
  if (isFeature(obj)) return true;
  if (isGeometry(obj)) return true;
  return false;
}

/**
 * Convierte varios formatos a GeoJSON válido
 * @param {*} data - Datos a convertir
 * @returns {Object|null} GeoJSON válido o null
 */
export function coerceGeoJSON(data) {
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

/**
 * Reproyecta GeoJSON de EPSG:3857 a EPSG:4326 si es necesario
 * @param {Object} geo - GeoJSON a reproyectar
 * @returns {Object} GeoJSON reproyectado
 */
export function maybeReproject3857To4326(geo) {
  // Heuristic detection
  const isLikelyEPSG3857 = (() => {
    const crsName = geo?.crs?.properties?.name || geo?.crs?.name || "";
    if (typeof crsName === "string" && /(3857|900913)/i.test(crsName)) return true;
    try {
      const getFirstCoord = (geom) => {
        if (!geom) return null;
        const t = geom.type;
        const c = geom.coordinates;
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
    const x = coords[0];
    const y = coords[1];
    const lng = (x / R) * 180 / Math.PI;
    const lat = (2 * Math.atan(Math.exp(y / R)) - (Math.PI / 2)) * 180 / Math.PI;
    return [lng, lat];
  };

  const reprojectGeom = (g) => {
    const t = g.type;
    const c = g.coordinates;
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

/**
 * Normaliza coordenadas center de [lat, lng] a [lng, lat] si es necesario
 * @param {Array} center - Coordenadas [x, y]
 * @returns {Array} Coordenadas normalizadas [lng, lat]
 */
export function normalizeCenter(center) {
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

/**
 * Calcula el bounding box de un GeoJSON
 * @param {Object} geo - GeoJSON FeatureCollection
 * @returns {Array|null} [minLng, minLat, maxLng, maxLat] o null
 */
export function getBoundingBox(geo) {
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
  
  for (const f of (geo.features || [])) {
    const coords = f.geometry?.coordinates;
    if (!coords) continue;
    
    const processCoord = (coord) => {
      if (Array.isArray(coord) && coord.length >= 2) {
        const [lng, lat] = coord;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          if (lat < minLat) minLat = lat;
          if (lng < minLng) minLng = lng;
          if (lat > maxLat) maxLat = lat;
          if (lng > maxLng) maxLng = lng;
        }
      }
    };
    
    const processCoords = (coords, depth = 0) => {
      if (depth === 0 && f.geometry.type === "Point") {
        processCoord(coords);
      } else if (Array.isArray(coords)) {
        coords.forEach(c => {
          if (Array.isArray(c) && Array.isArray(c[0])) {
            processCoords(c, depth + 1);
          } else {
            processCoord(c);
          }
        });
      }
    };
    
    processCoords(coords);
  }
  
  if (!Number.isFinite(minLat)) return null;
  return [minLng, minLat, maxLng, maxLat];
}

