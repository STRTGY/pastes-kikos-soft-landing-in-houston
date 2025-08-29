import mapboxgl, { ensureMapboxAccessToken, createMapboxMap, waitForContainerSize } from "./mapbox_utils.js";
import * as Plot from "npm:@observablehq/plot";
import booleanPointInPolygon from "npm:@turf/boolean-point-in-polygon";

const DEFAULT_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";

function randomNormal(mean, sd) {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateMockRestaurants({ center = [-95.3698, 29.7604], n = 240 }) {
	const categories = ["Mexicana","Hamburguesas","Café","Pizza","Asiática","Tacos","BBQ","Postres"];
	const priceBuckets = ["$","$$","$$$"];
	const data = [];
	for (let i = 0; i < n; i++) {
		const lng = center[0] + (Math.random() - 0.5) * 0.6;
		const lat = center[1] + (Math.random() - 0.5) * 0.5;
		const categoryName = categories[Math.floor(Math.random() * categories.length)];
		const priceRange = priceBuckets[Math.floor(Math.random() * priceBuckets.length)];
		const reviewsStars = Math.max(1, Math.min(5, Math.round(randomNormal(3.9, 0.8))));
		const hasDriveThru = Math.random() < 0.42;
		const occ = new Array(168).fill(0).map((_, k) => {
			const day = Math.floor(k / 24);
			const hour = k % 24;
			let base = 20 + 60 * Math.exp(-Math.pow((hour - 13) / 4.5, 2));
			if (hour >= 18 && hour <= 21) base += 25;
			if (day === 5 || day === 6) base += 10; // fin de semana
			base += (Math.random() - 0.5) * 15;
			return Math.max(0, Math.min(100, Math.round(base)));
		});
		data.push({ id: i + 1, title: `Rest ${i + 1}`, categoryName, priceRange, reviewsStars, hasDriveThru, occ, coordinates: [lng, lat] });
	}
	return {
		type: "FeatureCollection",
		features: data.map((r) => ({
			type: "Feature",
			id: r.id,
			properties: { id: r.id, title: r.title, categoryName: r.categoryName, priceRange: r.priceRange, reviewsStars: r.reviewsStars, hasDriveThru: r.hasDriveThru, occ: r.occ },
			geometry: { type: "Point", coordinates: r.coordinates }
		}))
	};
}

function generateMockTrafficLines({ center = [-95.3698, 29.7604], n = 30 }) {
	const lines = [];
	for (let i = 0; i < n; i++) {
		const x0 = center[0] + (Math.random() - 0.5) * 0.7;
		const y0 = center[1] + (Math.random() - 0.5) * 0.6;
		const x1 = x0 + (Math.random() - 0.5) * 0.15;
		const y1 = y0 + (Math.random() - 0.5) * 0.12;
		const flow = Math.max(10, Math.round(200 * Math.random()));
		lines.push({ type: "Feature", properties: { flow }, geometry: { type: "LineString", coordinates: [[x0, y0],[x1, y1]] } });
	}
	return { type: "FeatureCollection", features: lines };
}

function buildGrid(restaurantsGeo, cellSizeDeg = 0.02) {
	let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
	for (const f of restaurantsGeo.features || []) {
		const [lng, lat] = f.geometry.coordinates;
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
		if (lat < minLat) minLat = lat;
		if (lng < minLng) minLng = lng;
		if (lat > maxLat) maxLat = lat;
		if (lng > maxLng) maxLng = lng;
	}
	if (!Number.isFinite(minLat)) return null;
	minLat -= cellSizeDeg; maxLat += cellSizeDeg; minLng -= cellSizeDeg; maxLng += cellSizeDeg;
	const cols = Math.max(1, Math.ceil((maxLng - minLng) / cellSizeDeg));
	const rows = Math.max(1, Math.ceil((maxLat - minLat) / cellSizeDeg));
	const features = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const west = minLng + c * cellSizeDeg;
			const east = west + cellSizeDeg;
			const south = minLat + r * cellSizeDeg;
			const north = south + cellSizeDeg;
			const id = r * cols + c;
			features.push({ type: "Feature", id, properties: { id, west, east, south, north, ratio01: 0 }, geometry: { type: "Polygon", coordinates: [[[west, south],[east, south],[east, north],[west, north],[west, south]]] } });
		}
	}
	return { type: "FeatureCollection", features, dims: { rows, cols, minLat, minLng, cellSizeDeg } };
}

function computeDriveThruRatio(restaurantsGeo, grid) {
	if (!grid) return new Array(0);
	const { rows, cols, minLat, minLng, cellSizeDeg } = grid.dims;
	const colForLng = (x) => Math.max(0, Math.min(cols - 1, Math.floor((x - minLng) / cellSizeDeg)));
	const rowForLat = (y) => Math.max(0, Math.min(rows - 1, Math.floor((y - minLat) / cellSizeDeg)));
	const idx = (r, c) => r * cols + c;
	const total = new Array(rows * cols).fill(0);
	const drive = new Array(rows * cols).fill(0);
	for (const f of restaurantsGeo.features || []) {
		const [lng, lat] = f.geometry.coordinates;
		const r = rowForLat(lat); const c = colForLng(lng);
		total[idx(r, c)] += 1;
		if (f.properties?.hasDriveThru) drive[idx(r, c)] += 1;
	}
	const out = new Array(rows * cols).fill(0);
	for (let i = 0; i < out.length; i++) {
		out[i] = total[i] > 0 ? (drive[i] / total[i]) : 0;
	}
	return out;
}

function asFeatureCollection(obj) {
	if (!obj) return null;
	if (obj.type === "FeatureCollection") return obj;
	if (Array.isArray(obj.features)) return { type: "FeatureCollection", features: obj.features };
	return null;
}

function toFeatureCollectionFromList(list, propertiesMapper) {
	const features = [];
	for (const item of list || []) {
		const g = item.geometry;
		if (g && typeof g === "object") {
			features.push({ type: "Feature", properties: propertiesMapper ? propertiesMapper(item) : { ...item, geometry: undefined }, geometry: g });
		}
	}
	return { type: "FeatureCollection", features };
}

function aggregateSelection(restaurantsGeo, selection) {
	if (!restaurantsGeo) return [];
	const inBox = (lng, lat) => {
		if (!selection) return true;
		const { west, south, east, north } = selection;
		return lng >= west && lng <= east && lat >= south && lat <= north;
	};
	const rows = [];
	for (const f of restaurantsGeo.features || []) {
		const [lng, lat] = f.geometry.coordinates;
		if (!inBox(lng, lat)) continue;
		const p = f.properties || {};
		rows.push({ category: p.categoryName, price: p.priceRange, stars: Number(p.reviewsStars) || 0, hasDriveThru: !!p.hasDriveThru, occ: p.occ });
	}
	return rows;
}

function renderCategoryDonut(el, rows) {
	const counts = new Map();
	for (const r of rows) counts.set(r.category, (counts.get(r.category) || 0) + 1);
	const data = Array.from(counts, ([name, value]) => ({ name, value }));
	el.replaceChildren();
	el.appendChild(Plot.plot({
		width: 420,
		height: 320,
		margin: 30,
		color: { scheme: "category10" },
		marks: [
			Plot.arc(data, { x: 0, y: 0, r: 140, innerRadius: 70, fill: "name", theta: "value", tip: true }),
			Plot.text(data, { text: (d) => d.name, x: 0, y: 0, dy: -140, frameAnchor: "top", fill: "#111827", fontSize: 10 })
		]
	}));
}

function renderPricesHistogram(el, rows) {
	const order = ["$","$$","$$$","$$$$"]; 
	const counts = order.map((b) => ({ bucket: b, count: rows.filter((r) => r.price === b).length }));
	let running = 0;
	const total = counts.reduce((a, b) => a + b.count, 0) || 1;
	const cum = counts.map((d) => { running += d.count; return { bucket: d.bucket, pct: running / total }; });
	el.replaceChildren();
	el.appendChild(Plot.plot({
		width: 600,
		height: 280,
		marginLeft: 50,
		x: { domain: order },
		y: { grid: true },
		marks: [
			Plot.barY(counts, { x: "bucket", y: "count", fill: "#60a5fa" }),
			Plot.line(cum, { x: "bucket", y: (d) => d.pct * Math.max(...counts.map((c)=>c.count)) , stroke: "#ef4444", strokeWidth: 2 }),
			Plot.ruleY([0])
		]
	}));
}

function renderReviewsBars(el, rows, { categoryFilter = "Todas", priceFilter = "Todas", ratioFilter = "Todas" } = {}) {
	let filtered = rows;
	if (categoryFilter !== "Todas") filtered = filtered.filter((r) => r.category === categoryFilter);
	if (priceFilter !== "Todas") filtered = filtered.filter((r) => r.price === priceFilter);
	if (ratioFilter === ">= 50% DT") filtered = filtered.filter((r) => r.hasDriveThru);
	if (ratioFilter === "< 50% DT") filtered = filtered.filter((r) => !r.hasDriveThru);
	const stars = [1,2,3,4,5];
	const data = stars.map((s) => ({ stars: s, count: filtered.filter((r) => r.stars === s).length }));
	el.replaceChildren();
	el.appendChild(Plot.plot({
		width: 600,
		height: 280,
		marginLeft: 50,
		x: { domain: stars },
		y: { grid: true },
		marks: [
			Plot.barY(data, { x: "stars", y: "count", fill: "#a78bfa" }),
			Plot.ruleY([0])
		]
	}));
}

function renderHoursHeatmap(el, rows) {
	const W = 24, H = 7;
	const agg = new Array(H * W).fill(0);
	const idx = (d, h) => d * W + h;
	for (const r of rows) {
		const occ = Array.isArray(r.occ) ? r.occ : [];
		for (let d = 0; d < H; d++) {
			for (let h = 0; h < W; h++) {
				const v = Number(occ[d * 24 + h]) || 0;
				agg[idx(d, h)] += v;
			}
		}
	}
	const max = agg.reduce((a, b) => Math.max(a, b), 1);
	const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
	el.replaceChildren();
	const table = document.createElement("table");
	table.style.borderCollapse = "collapse";
	const thead = document.createElement("thead");
	const trh = document.createElement("tr");
	trh.appendChild(document.createElement("th"));
	for (let h = 0; h < W; h++) { const th = document.createElement("th"); th.textContent = String(h).padStart(2, "0"); th.style.padding = "2px 4px"; th.style.fontSize = "11px"; trh.appendChild(th); }
	thead.appendChild(trh);
	table.appendChild(thead);
	const tbody = document.createElement("tbody");
	for (let d = 0; d < H; d++) {
		const tr = document.createElement("tr");
		const th = document.createElement("th"); th.textContent = days[d]; th.style.padding = "2px 6px"; th.style.fontSize = "11px"; tr.appendChild(th);
		for (let h = 0; h < W; h++) {
			const v = agg[idx(d, h)];
			const t = Math.max(0, Math.min(1, v / max));
			const td = document.createElement("td");
			td.title = `${days[d]} ${String(h).padStart(2,"0")}:00 — ${Math.round(v)}`;
			td.style.width = "18px"; td.style.height = "16px"; td.style.textAlign = "center"; td.style.cursor = "default";
			td.style.background = `rgba(59,130,246,${0.15 + 0.75 * t})`;
			td.style.border = "1px solid #e5e7eb";
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	el.appendChild(table);
}

function summarizeCategoriesFromRestaurants(restaurantsGeo) {
	const rows = [];
	for (const f of (restaurantsGeo?.features || [])) {
		const p = f.properties || {};
		rows.push({ category: p.category || p.categoryName || "Other" });
	}
	const counts = new Map();
	for (const r of rows) counts.set(r.category, (counts.get(r.category) || 0) + 1);
	return Array.from(counts, ([name, value]) => ({ name, value }));
}

function summarizePricesFromRestaurants(restaurantsGeo) {
	const order = ["$","$$","$$$","$$$$","Other"];
	const counts = new Map(order.map((b) => [b, 0]));
	for (const f of (restaurantsGeo?.features || [])) {
		const p = f.properties || {};
		const bucket = order.includes(p.priceRange) ? p.priceRange : "Other";
		counts.set(bucket, (counts.get(bucket) || 0) + 1);
	}
	const bars = order.map((b) => ({ priceRange: b, establishmentCount: counts.get(b) || 0 }));
	let running = 0; const total = bars.reduce((a,b)=>a+b.establishmentCount,0) || 1;
	const trendline = bars.map((d,i)=>{ running += d.establishmentCount; return { x: i+1, y: running }; });
	return { bars, trendline };
}

function summarizeReviewsFromRestaurants(restaurantsGeo) {
	const byStar = new Map([[1,0],[2,0],[3,0],[4,0],[5,0]]);
	for (const f of (restaurantsGeo?.features || [])) {
		const p = f.properties || {};
		const s = Math.max(1, Math.min(5, Math.round(Number(p.rating) || 0)));
		const w = Number(p.reviewCount) || 1;
		byStar.set(s, (byStar.get(s) || 0) + w);
	}
	return Array.from(byStar, ([starRating, count]) => ({ starRating, count }));
}

export default function industryEvaluationDashboard({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	mapboxToken,
	mapboxStyle = DEFAULT_STYLE,
	data
} = {}) {
	ensureMapboxAccessToken(mapboxToken);
	const container = document.createElement("div");
	container.style.width = size?.width ? `${size.width}px` : "100%";
	container.style.height = size?.height ? `${size.height}px` : "860px";
	container.style.position = "relative";
	container.style.display = "grid";
	container.style.gridTemplateColumns = "2fr 1fr";
	container.style.gridTemplateRows = "480px 360px";
	container.style.gap = "10px";

	const mapWrap = document.createElement("div"); mapWrap.style.position = "relative";
	const mapTitle = document.createElement("div"); mapTitle.textContent = "Houston Industry Evaluation"; mapTitle.style.position = "absolute"; mapTitle.style.left = "10px"; mapTitle.style.top = "10px"; mapTitle.style.zIndex = "1000"; mapTitle.style.background = "rgba(255,255,255,0.9)"; mapTitle.style.padding = "6px 8px"; mapTitle.style.borderRadius = "6px"; mapTitle.style.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
	mapWrap.appendChild(mapTitle);

	const mapEl = document.createElement("div"); mapEl.style.width = "100%"; mapEl.style.height = "100%"; mapWrap.appendChild(mapEl);
	container.appendChild(mapWrap);

	const catWrap = document.createElement("div");
	const catHeader = document.createElement("div"); catHeader.textContent = "Categorías de restaurantes"; catHeader.style.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; catHeader.style.margin = "4px 0 2px 0";
	const catChart = document.createElement("div");
	catWrap.appendChild(catHeader); catWrap.appendChild(catChart);
	container.appendChild(catWrap);

	const priceWrap = document.createElement("div");
	const priceHeader = document.createElement("div"); priceHeader.textContent = "Distribución de precios"; priceHeader.style.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; priceHeader.style.margin = "4px 0 2px 0";
	const priceChart = document.createElement("div");
	priceWrap.appendChild(priceHeader); priceWrap.appendChild(priceChart);
	container.appendChild(priceWrap);

	const reviewsWrap = document.createElement("div");
	const reviewsHeader = document.createElement("div"); reviewsHeader.textContent = "Distribución de Estrellas (Reviews)"; reviewsHeader.style.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; reviewsHeader.style.margin = "4px 0 6px 0";
	const filterRow = document.createElement("div"); filterRow.style.display = "flex"; filterRow.style.gap = "8px"; filterRow.style.flexWrap = "wrap"; filterRow.style.marginBottom = "6px";
	const selCat = document.createElement("select"); const selPrice = document.createElement("select"); const selRatio = document.createElement("select");
	["Todas","Mexicana","Hamburguesas","Café","Pizza","Asiática","Tacos","BBQ","Postres"].forEach((v) => { const o=document.createElement("option"); o.value=v; o.textContent=`Categoría: ${v}`; selCat.appendChild(o); });
	["Todas","$","$$","$$$"].forEach((v) => { const o=document.createElement("option"); o.value=v; o.textContent=`Precio: ${v}`; selPrice.appendChild(o); });
	["Todas","< 50% DT",">= 50% DT"].forEach((v) => { const o=document.createElement("option"); o.value=v; o.textContent=`Ratio: ${v}`; selRatio.appendChild(o); });
	filterRow.appendChild(selCat); filterRow.appendChild(selPrice); filterRow.appendChild(selRatio);
	const reviewsChart = document.createElement("div");
	reviewsWrap.appendChild(reviewsHeader); reviewsWrap.appendChild(filterRow); reviewsWrap.appendChild(reviewsChart);
	container.appendChild(reviewsWrap);

	// Hours heatmap below map area (overlayed footer within map area)
	const hoursPanel = document.createElement("div");
	hoursPanel.style.position = "absolute"; hoursPanel.style.left = "10px"; hoursPanel.style.bottom = "10px"; hoursPanel.style.zIndex = "1000";
	hoursPanel.style.background = "rgba(255,255,255,0.95)"; hoursPanel.style.padding = "6px"; hoursPanel.style.borderRadius = "6px";
	const hoursTitle = document.createElement("div"); hoursTitle.textContent = "Horarios (mapa de calor)"; hoursTitle.style.font = "600 12px system-ui"; hoursTitle.style.marginBottom = "4px";
	hoursPanel.appendChild(hoursTitle);
	const hoursEl = document.createElement("div"); hoursPanel.appendChild(hoursEl);
	mapWrap.appendChild(hoursPanel);

	// Build map and layers
	const map = createMapboxMap(mapEl, { style: mapboxStyle, center, zoom });

	const restaurantsGeo = asFeatureCollection(data?.visualizations?.map?.layers?.restaurants?.data) || { type: "FeatureCollection", features: [] };
	const driveThruHeatFC = toFeatureCollectionFromList(data?.visualizations?.map?.layers?.driveThruHeatmap?.data, (d) => ({ zipCode: d.zipCode, value: Number(d.value) })) || { type: "FeatureCollection", features: [] };
	const trafficFC = toFeatureCollectionFromList(data?.visualizations?.map?.layers?.traffic?.data, (d) => ({ congestion: d.congestion, segmentId: d.segmentId })) || { type: "FeatureCollection", features: [] };

	let currentSelectionPolygon = null;

	function updateCharts() {
		const rows = aggregateSelection(restaurantsGeo, currentSelectionPolygon);
		// Categorías
		if (currentSelectionPolygon && rows.length > 0) {
			renderCategoryDonut(catChart, rows);
		} else {
			const catDataAgg = data?.visualizations?.productCategories?.data || [];
			if (Array.isArray(catDataAgg) && catDataAgg.length > 0) {
				const el = document.createElement("div");
				el.appendChild(Plot.plot({
					width: 420,
					height: 320,
					margin: 30,
					color: { scheme: "category10" },
					marks: [Plot.arc(catDataAgg, { x: 0, y: 0, r: 140, innerRadius: 70, fill: "category", theta: (d) => d.percentage, tip: true })]
				}));
				catChart.replaceChildren(el);
			} else {
				const computed = summarizeCategoriesFromRestaurants(restaurantsGeo);
				const el = document.createElement("div");
				el.appendChild(Plot.plot({
					width: 420,
					height: 320,
					margin: 30,
					color: { scheme: "category10" },
					marks: [Plot.arc(computed, { x: 0, y: 0, r: 140, innerRadius: 70, fill: "name", theta: "value", tip: true })]
				}));
				catChart.replaceChildren(el);
			}
		}
		// Precios
		if (currentSelectionPolygon && rows.length > 0) {
			renderPricesHistogram(priceChart, rows);
		} else {
			const barsAgg = data?.visualizations?.priceDistribution?.data?.bars || [];
			const trendAgg = data?.visualizations?.priceDistribution?.data?.trendline || [];
			const useAgg = (Array.isArray(barsAgg) && barsAgg.length > 0);
			const { bars, trendline } = useAgg ? { bars: barsAgg, trendline: trendAgg } : summarizePricesFromRestaurants(restaurantsGeo);
			priceChart.replaceChildren();
			priceChart.appendChild(Plot.plot({
				width: 600,
				height: 280,
				marginLeft: 50,
				x: { domain: ["$","$$","$$$","$$$$","Other"] },
				y: { grid: true },
				marks: [
					Plot.barY(bars, { x: "priceRange", y: "establishmentCount", fill: "#60a5fa" }),
					Plot.line(trendline, { x: "x", y: "y", stroke: "#ef4444", strokeWidth: 2 }),
					Plot.ruleY([0])
				]
			}));
		}
		// Reviews
		if (currentSelectionPolygon && rows.length > 0) {
			const byStar = new Map([[1,0],[2,0],[3,0],[4,0],[5,0]]);
			for (const r of rows) { const s = Math.max(1, Math.min(5, Number(r.stars) || 0)); byStar.set(s, (byStar.get(s) || 0) + (Number(r.reviews) || 1)); }
			const starRows = Array.from(byStar, ([starRating, count]) => ({ starRating, count }));
			reviewsChart.replaceChildren();
			reviewsChart.appendChild(Plot.plot({ width: 600, height: 280, marginLeft: 50, x: { domain: [1,2,3,4,5] }, y: { grid: true }, marks: [Plot.barY(starRows, { x: "starRating", y: "count", fill: "#a78bfa" }), Plot.ruleY([0])] }));
		} else {
			const agg = data?.visualizations?.reviews?.data || [];
			const rowsUse = (Array.isArray(agg) && agg.length > 0) ? agg : summarizeReviewsFromRestaurants(restaurantsGeo);
			reviewsChart.replaceChildren();
			reviewsChart.appendChild(Plot.plot({ width: 600, height: 280, marginLeft: 50, x: { domain: [1,2,3,4,5] }, y: { grid: true }, marks: [Plot.barY(rowsUse, { x: "starRating", y: "count", fill: "#a78bfa" }), Plot.ruleY([0])] }));
		}
		// Horarios
		const hoursList = data?.visualizations?.openingHours?.data || [];
		if (Array.isArray(hoursList)) {
			let selectedIds = null;
			if (currentSelectionPolygon) { const selected = aggregateSelection(restaurantsGeo, currentSelectionPolygon); selectedIds = new Set(selected.map((r) => r.id)); }
			const agg = new Array(7 * 24).fill(0);
			const dayIndex = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };
			for (const item of hoursList) {
				if (selectedIds && !selectedIds.has(item.restaurantId)) continue;
				const h = item.hours || {};
				for (const [dName, arr] of Object.entries(h)) {
					const di = dayIndex[dName.toLowerCase?.() || dName] ?? null;
					if (di == null) continue;
					for (let hour = 0; hour < Math.min(24, arr.length); hour++) { agg[di * 24 + hour] += Number(arr[hour]) || 0; }
				}
			}
			renderHoursHeatmap(hoursEl, [{ occ: agg }]);
		}
	}

	selCat.addEventListener("change", updateCharts);
	selPrice.addEventListener("change", updateCharts);
	selRatio.addEventListener("change", updateCharts);

	map.on("load", () => {
		// Sources
		map.addSource("restaurants", { type: "geojson", data: restaurantsGeo, promoteId: "id" });
		map.addSource("traffic", { type: "geojson", data: trafficFC });
		map.addSource("dt-heat", { type: "geojson", data: driveThruHeatFC });

		// Drive-thru heat polygons
		map.addLayer({ id: "dt-heat-fill", type: "fill", source: "dt-heat", paint: { "fill-color": ["interpolate", ["linear"], ["to-number", ["get","value"]], 0, "#f3f4f6", 0.5, "#fb7185", 1, "#be123c"], "fill-opacity": 0.45 } });
		map.addLayer({ id: "dt-heat-line", type: "line", source: "dt-heat", paint: { "line-color": "#9ca3af", "line-width": 0.2, "line-opacity": 0.25 } });

		// Restaurants points (all)
		map.addLayer({ id: "restaurants-all", type: "circle", source: "restaurants", paint: { "circle-radius": 3, "circle-color": ["match", ["coalesce", ["get","category"], ["get","categoryName"]], "Fast Food", "#f59e0b", "Burgers", "#ef4444", "Café", "#6b7280", "Fine Dining", "#a78bfa", "Steakhouse", "#b91c1c", "Casual Dining", "#10b981", "#38bdf8"], "circle-opacity": 0.85, "circle-stroke-color": "#111827", "circle-stroke-width": 0.3 } });

		// Drive-thru only
		map.addLayer({ id: "restaurants-dt", type: "circle", source: "restaurants", filter: ["==", ["get","hasDriveThru"], true], paint: { "circle-radius": 5, "circle-color": "#ef4444", "circle-stroke-color": "#111827", "circle-stroke-width": 0.6, "circle-opacity": 0.9 } });

		// Heatmap option for drive-thru intensity (points)
		map.addLayer({ id: "restaurants-heat", type: "heatmap", source: "restaurants", paint: { "heatmap-weight": ["case", ["==", ["get","hasDriveThru"], true], 1, 0], "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 18, 14, 26, 16, 38], "heatmap-opacity": 0.6 } });

		// Traffic flow
		map.addLayer({ id: "traffic-flow", type: "line", source: "traffic", paint: { "line-color": ["match", ["get","congestion"], "high", "#b91c1c", "medium", "#f59e0b", "low", "#10b981", "#60a5fa"], "line-width": ["match", ["get","congestion"], "high", 5, "medium", 3, "low", 2, 2], "line-opacity": 0.7 } });

		// Hover selection over polygons
		map.on("mousemove", (e) => {
			const f = map.queryRenderedFeatures(e.point, { layers: ["dt-heat-fill"] })?.[0];
			currentSelectionPolygon = f ? { type: "Feature", geometry: f.geometry } : null;
			updateCharts();
		});

		// Initial fit
		try {
			const bounds = new mapboxgl.LngLatBounds();
			for (const f of restaurantsGeo.features) bounds.extend(f.geometry.coordinates);
			if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 18 });
		} catch {}

		updateCharts();
	});

	waitForContainerSize(container, map, () => { try { map.resize(); } catch {} });

	return container;
}


