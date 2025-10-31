import mapboxgl, { ensureMapboxAccessToken, createMapboxMap, waitForContainerSize } from "../core/mapbox-utils.js";
import * as Plot from "npm:@observablehq/plot";
import { isOpenNow, aggregateHours } from "../../utils/hours.js";
import { createEmptyState, createErrorState } from "../../utils/ui-helpers.js";
import { trackEvent, trackPerformance, startTimer, trackInteraction, trackError } from "../../utils/telemetry.js";
import { createTabs, createTabPanel } from "../common/Tabs.js";
import { createKpiBand, updateKpi } from "../common/KpiBand.js";
import { createFilterChips } from "../common/FilterChips.js";
import { createDrawer } from "../common/RestaurantList.js";
import { encodeStateToHash, decodeStateFromHash, syncStateToHash } from "../../utils/hash-state.js";
import { observeResize, debounceResize } from "../../utils/resize.js";

const DEFAULT_STYLE = "mapbox://styles/feipower/cmcxpeo3v017i01s0dl5cf8re";

// Category color mapping
const CATEGORY_COLORS = {
	"Mexicana": "#f59e0b",
	"Mexican": "#f59e0b",
	"Hamburguesas": "#ef4444",
	"Burgers": "#ef4444",
	"Café": "#6b7280",
	"Pizza": "#8b5cf6",
	"Asiática": "#10b981",
	"Asian": "#10b981",
	"Tacos": "#f97316",
	"BBQ": "#b91c1c",
	"Postres": "#ec4899",
	"Desserts": "#ec4899",
	"Fast Food": "#f59e0b",
	"Fine Dining": "#a78bfa",
	"Steakhouse": "#b91c1c",
	"Casual Dining": "#10b981",
	"Other": "#64748b"
};

// ============================================================================
// Utility functions
// ============================================================================

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
			features.push({ 
				type: "Feature", 
				properties: propertiesMapper ? propertiesMapper(item) : { ...item, geometry: undefined }, 
				geometry: g 
			});
		}
	}
	return { type: "FeatureCollection", features };
}

function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// ============================================================================
// Data processing & memoization
// ============================================================================

// Simple memoization cache
const filterCache = new Map();
const MAX_CACHE_SIZE = 50;

function getCacheKey(filters) {
	return JSON.stringify({
		cat: filters.categories?.sort() || [],
		pr: filters.prices?.sort() || [],
		rat: filters.minRating || null,
		rev: filters.minReviews || null,
		dt: filters.driveThruOnly || false,
		op: filters.openNow || false,
		sel: filters.selectionBounds ? Object.values(filters.selectionBounds).join(",") : null
	});
}

function enrichRestaurantFeatures(restaurantsGeo) {
	if (!restaurantsGeo?.features) return restaurantsGeo;
	
	const enriched = { ...restaurantsGeo };
	enriched.features = restaurantsGeo.features.map(f => {
		const props = f.properties || {};
		const priceMap = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
		
		return {
			...f,
			properties: {
				...props,
				// Derive numeric fields
				priceNumeric: priceMap[props.priceRange] || priceMap[props.price] || 0,
				ratingNumeric: Number(props.rating || props.reviewsStars) || 0,
				reviewCount: Number(props.reviewCount || props.reviews) || 0,
				// Compute isOpenNow if hours available
				isOpenNow: isOpenNow(props.occ || props.hours),
				// Normalize category
				category: props.category || props.categoryName || "Other"
			}
		};
	});
	
	return enriched;
}

function extractUniqueValues(restaurantsGeo, field) {
	const values = new Set();
	for (const f of restaurantsGeo?.features || []) {
		const val = f.properties?.[field];
		if (val != null && val !== "") values.add(val);
	}
	return Array.from(values).sort();
}

function filterRestaurants(restaurantsGeo, filters) {
	if (!restaurantsGeo?.features) return restaurantsGeo;
	
	// Check cache
	const cacheKey = getCacheKey(filters);
	if (filterCache.has(cacheKey)) {
		return filterCache.get(cacheKey);
	}
	
	const filtered = restaurantsGeo.features.filter(f => {
		const props = f.properties || {};
		
		// Category filter
		if (filters.categories?.length > 0 && !filters.categories.includes(props.category)) {
			return false;
		}
		
		// Price filter
		if (filters.prices?.length > 0 && !filters.prices.includes(props.priceRange || props.price)) {
			return false;
		}
		
		// Rating filter
		if (filters.minRating != null && props.ratingNumeric < filters.minRating) {
			return false;
		}
		
		// Review count filter
		if (filters.minReviews != null && props.reviewCount < filters.minReviews) {
			return false;
		}
		
		// Drive-thru filter
		if (filters.driveThruOnly && !props.hasDriveThru) {
			return false;
		}
		
		// Open now filter
		if (filters.openNow && props.isOpenNow !== true) {
			return false;
		}
		
		// Selection polygon filter
		if (filters.selectionBounds) {
			const [lng, lat] = f.geometry.coordinates;
			const { west, south, east, north } = filters.selectionBounds;
			if (lng < west || lng > east || lat < south || lat > north) {
				return false;
			}
		}
		
		return true;
	});
	
	const result = { type: "FeatureCollection", features: filtered };
	
	// Cache result (with size limit)
	if (filterCache.size >= MAX_CACHE_SIZE) {
		const firstKey = filterCache.keys().next().value;
		filterCache.delete(firstKey);
	}
	filterCache.set(cacheKey, result);
	
	return result;
}

// URL state management moved to utils/hash-state.js

// ============================================================================
// Chart rendering
// ============================================================================

function renderCategoryChart(container, features, i18n, onBarClick) {
	const timer = startTimer("chart_render_category");
	
	try {
		const counts = new Map();
		for (const f of features) {
			const cat = f.properties?.category || "Other";
			counts.set(cat, (counts.get(cat) || 0) + 1);
		}
		
		// Sort and take top 10
		const data = Array.from(counts, ([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 10);
		
		if (data.length === 0) {
			container.replaceChildren(createEmptyState({
				title: i18n?.charts?.noData || "No Data",
				message: i18n?.charts?.selectAreaPrompt || "Adjust filters to see data"
			}));
			timer.end({ success: false, reason: "empty" });
			return;
		}
		
		// Add subtitle showing it's top 10
		const subtitle = document.createElement("div");
		subtitle.textContent = `Top ${data.length} categorías (click para filtrar)`;
		subtitle.style.cssText = "font: 400 12px system-ui; color: #6b7280; margin-bottom: 8px;";
		container.replaceChildren(subtitle);
		
		const plot = Plot.plot({
			width: Math.min(500, container.parentElement?.offsetWidth - 40 || 500),
			height: 450,
			marginLeft: 120,
			marginBottom: 60,
			marginTop: 20,
			x: { label: null, tickRotate: -45 },
			y: { grid: true, label: "Cantidad" },
			color: { 
				domain: data.map(d => d.name),
				range: data.map(d => CATEGORY_COLORS[d.name] || CATEGORY_COLORS.Other)
			},
			marks: [
				Plot.barY(data, { 
					x: "name", 
					y: "value", 
					fill: "name",
					tip: true
				}),
				Plot.ruleY([0])
			]
		});
		
		// Add click handlers to bars
		if (onBarClick) {
			const bars = plot.querySelectorAll("rect[fill]");
			bars.forEach((bar, idx) => {
				if (idx < data.length) {
					bar.style.cursor = "pointer";
					bar.addEventListener("click", () => {
						const category = data[idx].name;
						const filtered = features.filter(f => f.properties?.category === category);
						onBarClick(filtered, { category });
					});
				}
			});
		}
		
		container.appendChild(plot);
		
		timer.end({ success: true, dataPoints: data.length });
	} catch (error) {
		container.replaceChildren(createErrorState({
			title: "Chart Error",
			message: "Failed to render category chart",
			error,
			showDetails: true
		}));
		trackError(error, { component: "renderCategoryChart" });
		timer.end({ success: false, reason: "error" });
	}
}

function renderPriceChart(container, features, i18n) {
	const timer = startTimer("chart_render_price");
	
	try {
		if (features.length === 0) {
			container.replaceChildren(createEmptyState({
				title: i18n?.charts?.noData || "No Data",
				message: i18n?.charts?.selectAreaPrompt || "Adjust filters to see data"
			}));
			timer.end({ success: false, reason: "empty" });
			return;
		}
		
		const order = ["$", "$$", "$$$", "$$$$"];
		const counts = order.map(b => ({ 
			bucket: b, 
			count: features.filter(f => (f.properties?.priceRange || f.properties?.price) === b).length 
		}));
		
		const total = counts.reduce((sum, d) => sum + d.count, 0);
		let cumulative = 0;
		const cumulativeLine = counts.map((d, i) => {
			cumulative += d.count;
			return { x: i, y: cumulative, pct: cumulative / (total || 1) };
		});
		
		container.replaceChildren();
		container.appendChild(Plot.plot({
			width: Math.min(500, container.parentElement?.offsetWidth - 40 || 500),
			height: 300,
			marginLeft: 50,
			marginBottom: 40,
			x: { domain: order, label: "Rango de Precio" },
			y: { grid: true, label: "Cantidad" },
			marks: [
				Plot.barY(counts, { x: "bucket", y: "count", fill: "#60a5fa", tip: true }),
				Plot.line(cumulativeLine, { 
					x: (d, i) => order[i], 
					y: "y", 
					stroke: "#ef4444", 
					strokeWidth: 2,
					marker: "circle"
				}),
				Plot.ruleY([0])
			]
		}));
	
	timer.end({ success: true, dataPoints: features.length });
	} catch (error) {
		container.replaceChildren(createErrorState({
			title: "Chart Error",
			message: "Failed to render price chart",
			error,
			showDetails: true
		}));
		trackError(error, { component: "renderPriceChart" });
		timer.end({ success: false, reason: "error" });
	}
}

function renderReviewsChart(container, features, i18n) {
	const timer = startTimer("chart_render_reviews");
	
	try {
		if (features.length === 0) {
			container.replaceChildren(createEmptyState({
				title: i18n?.charts?.noData || "No Data",
				message: i18n?.charts?.selectAreaPrompt || "Adjust filters to see data"
			}));
			timer.end({ success: false, reason: "empty" });
			return;
		}
		
		const stars = [1, 2, 3, 4, 5];
		const data = stars.map(s => ({
			stars: s,
			count: features.filter(f => Math.round(f.properties?.ratingNumeric || 0) === s).length
		}));
		
		container.replaceChildren();
		container.appendChild(Plot.plot({
			width: Math.min(500, container.parentElement?.offsetWidth - 40 || 500),
			height: 300,
			marginLeft: 50,
			marginBottom: 40,
			x: { domain: stars, label: "Estrellas" },
			y: { grid: true, label: "Cantidad" },
			marks: [
				Plot.barY(data, { x: "stars", y: "count", fill: "#a78bfa", tip: true }),
				Plot.ruleY([0])
			]
		}));
	
	timer.end({ success: true, dataPoints: features.length });
	} catch (error) {
		container.replaceChildren(createErrorState({
			title: "Chart Error",
			message: "Failed to render reviews chart",
			error,
			showDetails: true
		}));
		trackError(error, { component: "renderReviewsChart" });
		timer.end({ success: false, reason: "error" });
	}
}

function renderHoursHeatmap(container, features, hoursData, i18n) {
	const timer = startTimer("chart_render_hours");
	
	try {
		if (features.length === 0) {
			container.replaceChildren(createEmptyState({
				title: i18n?.charts?.noData || "No Data",
				message: i18n?.charts?.selectAreaPrompt || "Adjust filters to see data"
			}));
			timer.end({ success: false, reason: "empty" });
			return;
		}
		
		const W = 24, H = 7;
		const agg = new Array(H * W).fill(0);
		let hasData = false;
		let count = 0;
		
		// Map of day names to indices
		const dayMap = {
			sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
			thursday: 4, friday: 5, saturday: 6
		};
		
		// IMPORTANT: Always show ALL hours data available, don't filter by features
		// The features are the restaurants visible on the map (7k+)
		// The hoursData contains actual hours information (1k+)
		// We aggregate ALL hours data to show overall patterns
		
		// Aggregate hours data from the separate hours dataset
		if (Array.isArray(hoursData) && hoursData.length > 0) {
			for (const entry of hoursData) {
				const hours = entry.hours;
				if (hours && typeof hours === "object") {
					hasData = true;
					count++;
					
					// Iterate through each day
					for (const [dayName, hourArray] of Object.entries(hours)) {
						const dayIndex = dayMap[dayName.toLowerCase()];
						if (dayIndex !== undefined && Array.isArray(hourArray)) {
							// Aggregate each hour of the day
							for (let h = 0; h < Math.min(24, hourArray.length); h++) {
								const value = Number(hourArray[h]) || 0;
								agg[dayIndex * W + h] += value;
							}
						}
					}
				}
			}
		}
		
		// If no hours data available, show message
		if (!hasData || count === 0) {
			container.replaceChildren(createEmptyState({
				title: "Datos no disponibles",
				message: "Los datos de horarios no están disponibles en el dataset actual."
			}));
			timer.end({ success: false, reason: "no_hours_data" });
			return;
		}
		
		const max = Math.max(...agg, 1);
		const days = i18n?.days?.short || ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
		
		container.replaceChildren();
		
		// Add description with count
		const desc = document.createElement("div");
		desc.innerHTML = `<strong>Patrones agregados de ${count.toLocaleString()} restaurantes en Houston</strong><br/>
		<span style="font-size: 10px;">Intensidad de ocupación por día y hora (0=cerrado, 100=máxima actividad)</span>`;
		desc.style.cssText = "font: 400 11px system-ui; color: #374151; margin-bottom: 10px; line-height: 1.5;";
		container.appendChild(desc);
		
		const wrapper = document.createElement("div");
		wrapper.style.cssText = "overflow-x: auto; overflow-y: auto; max-height: 280px;";
		
		const table = document.createElement("table");
		table.style.borderCollapse = "collapse";
		table.style.fontSize = "10px";
		table.style.width = "100%";
		
		// Header row
		const thead = document.createElement("thead");
		const trh = document.createElement("tr");
		const thEmpty = document.createElement("th");
		thEmpty.style.cssText = "position: sticky; left: 0; background: white; z-index: 2; padding: 4px; border: 1px solid #e5e7eb;";
		trh.appendChild(thEmpty);
		for (let h = 0; h < W; h++) {
			const th = document.createElement("th");
			th.textContent = String(h).padStart(2, "0");
			th.style.cssText = "padding: 4px; font-size: 9px; text-align: center; border: 1px solid #e5e7eb; background: #f9fafb;";
			trh.appendChild(th);
		}
		thead.appendChild(trh);
		table.appendChild(thead);
		
		// Body rows
		const tbody = document.createElement("tbody");
		for (let d = 0; d < H; d++) {
			const tr = document.createElement("tr");
			const th = document.createElement("th");
			th.textContent = days[d];
			th.style.cssText = "position: sticky; left: 0; background: white; z-index: 1; padding: 4px 8px; font-size: 10px; font-weight: 600; text-align: right; border: 1px solid #e5e7eb;";
			tr.appendChild(th);
			
			for (let h = 0; h < W; h++) {
				const v = agg[d * W + h];
				const t = v > 0 ? Math.max(0, Math.min(1, v / max)) : 0;
				const td = document.createElement("td");
				td.title = `${days[d]} ${String(h).padStart(2, "0")}:00\nIntensidad: ${Math.round(v)}`;
				td.style.cssText = `
					min-width: 18px; 
					height: 18px; 
					text-align: center; 
					cursor: default;
					background: ${v > 0 ? `rgba(59,130,246,${0.2 + 0.8 * t})` : '#f9fafb'};
					border: 1px solid #e5e7eb;
				`;
				tr.appendChild(td);
			}
			
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		wrapper.appendChild(table);
		container.appendChild(wrapper);
		
		// Add legend
		const legend = document.createElement("div");
		legend.style.cssText = "display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; font-size: 10px; color: #6b7280;";
		legend.innerHTML = `
			<div style="display: flex; align-items: center; gap: 4px;">
				<div style="width: 16px; height: 12px; background: #f9fafb; border: 1px solid #e5e7eb;"></div>
				<span>Bajo</span>
			</div>
			<div style="display: flex; align-items: center; gap: 4px;">
				<div style="width: 16px; height: 12px; background: rgba(59,130,246,0.5); border: 1px solid #e5e7eb;"></div>
				<span>Medio</span>
			</div>
			<div style="display: flex; align-items: center; gap: 4px;">
				<div style="width: 16px; height: 12px; background: rgba(59,130,246,1); border: 1px solid #e5e7eb;"></div>
				<span>Alto</span>
			</div>
		`;
		container.appendChild(legend);
	
	timer.end({ success: true, dataPoints: features.length, hasHoursData: hasData, restaurantCount: count });
	} catch (error) {
		container.replaceChildren(createErrorState({
			title: "Error en Gráfica",
			message: "No se pudo renderizar el mapa de horarios",
			error,
			showDetails: true
		}));
		trackError(error, { component: "renderHoursHeatmap" });
		timer.end({ success: false, reason: "error" });
	}
}

// ============================================================================
// UI Components
// ============================================================================

function createFilterPanel(container, state, callbacks, i18n) {
	const panel = document.createElement("div");
	panel.style.cssText = "position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.98); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 300px; font: 13px system-ui, sans-serif; transition: all 0.3s;";
	panel.setAttribute("role", "region");
	panel.setAttribute("aria-label", i18n?.filters?.title || "Filters");
	
	// Collapsible state
	let isCollapsed = false;
	
	// Header with collapse button
	const header = document.createElement("div");
	header.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer;";
	
	const title = document.createElement("div");
	title.textContent = i18n?.filters?.title || "Filters";
	title.style.cssText = "font-weight: 600; font-size: 14px;";
	header.appendChild(title);
	
	const collapseBtn = document.createElement("button");
	collapseBtn.textContent = "▼";
	collapseBtn.setAttribute("aria-label", i18n?.filters?.collapse || "Collapse");
	collapseBtn.style.cssText = "border: none; background: transparent; font-size: 12px; cursor: pointer; color: #6b7280; transition: transform 0.3s;";
	header.appendChild(collapseBtn);
	
	panel.appendChild(header);
	
	// Content container
	const content = document.createElement("div");
	content.style.cssText = "padding: 12px; max-height: calc(100vh - 200px); overflow-y: auto; transition: all 0.3s;";
	
	// Toggle collapse
	header.addEventListener("click", () => {
		isCollapsed = !isCollapsed;
		if (isCollapsed) {
			content.style.maxHeight = "0";
			content.style.padding = "0 12px";
			content.style.opacity = "0";
			collapseBtn.style.transform = "rotate(-90deg)";
			collapseBtn.setAttribute("aria-label", i18n?.filters?.expand || "Expand");
		} else {
			content.style.maxHeight = "calc(100vh - 200px)";
			content.style.padding = "12px";
			content.style.opacity = "1";
			collapseBtn.style.transform = "rotate(0deg)";
			collapseBtn.setAttribute("aria-label", i18n?.filters?.collapse || "Collapse");
		}
		trackInteraction("toggle", "filter_panel_collapse", { collapsed: isCollapsed });
	});
	
	// Category search + multi-select
	const catLabel = document.createElement("label");
	catLabel.textContent = i18n?.filters?.category || "Category";
	catLabel.style.cssText = "display: block; margin-top: 8px; font-weight: 500; font-size: 12px;";
	content.appendChild(catLabel);
	
	const catSearch = document.createElement("input");
	catSearch.type = "text";
	catSearch.placeholder = i18n?.filters?.search || "Search...";
	catSearch.style.cssText = "width: 100%; margin-top: 4px; margin-bottom: 4px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px;";
	content.appendChild(catSearch);
	
	const catSelect = document.createElement("select");
	catSelect.multiple = true;
	catSelect.size = 5;
	catSelect.style.cssText = "width: 100%; margin-top: 4px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;";
	catSelect.setAttribute("aria-label", i18n?.filters?.category || "Category");
	
	const categories = extractUniqueValues(state.restaurantsGeoEnriched, "category");
	const allCategories = categories.slice();
	
	// Populate categories
	const populateCategories = (filter = "") => {
		catSelect.innerHTML = "";
		const filtered = allCategories.filter(cat => 
			cat.toLowerCase().includes(filter.toLowerCase())
		);
		for (const cat of filtered) {
			const opt = document.createElement("option");
			opt.value = cat;
			opt.textContent = i18n?.categories?.[cat] || cat;
			if (state.filters.categories?.includes(cat)) {
				opt.selected = true;
			}
			catSelect.appendChild(opt);
		}
	};
	
	populateCategories();
	catSearch.addEventListener("input", () => populateCategories(catSearch.value));
	content.appendChild(catSelect);
	
	// Price multi-select
	const priceLabel = document.createElement("label");
	priceLabel.textContent = i18n?.filters?.price || "Price";
	priceLabel.style.cssText = "display: block; margin-top: 8px; font-weight: 500; font-size: 12px;";
	content.appendChild(priceLabel);
	
	const priceSelect = document.createElement("select");
	priceSelect.multiple = true;
	priceSelect.size = 4;
	priceSelect.style.cssText = "width: 100%; margin-top: 4px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;";
	priceSelect.setAttribute("aria-label", i18n?.filters?.price || "Price");
	
	["$", "$$", "$$$", "$$$$"].forEach(p => {
		const opt = document.createElement("option");
		opt.value = p;
		opt.textContent = p;
		priceSelect.appendChild(opt);
	});
	content.appendChild(priceSelect);
	
	// Min rating
	const ratingLabel = document.createElement("label");
	ratingLabel.textContent = i18n?.filters?.rating || "Min. Rating";
	ratingLabel.style.cssText = "display: block; margin-top: 8px; font-weight: 500; font-size: 12px;";
	content.appendChild(ratingLabel);
	
	const ratingInput = document.createElement("input");
	ratingInput.type = "number";
	ratingInput.min = "0";
	ratingInput.max = "5";
	ratingInput.step = "0.5";
	ratingInput.placeholder = "0";
	ratingInput.style.cssText = "width: 100%; margin-top: 4px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;";
	ratingInput.setAttribute("aria-label", i18n?.filters?.rating || "Min. Rating");
	content.appendChild(ratingInput);
	
	// Min reviews
	const reviewsLabel = document.createElement("label");
	reviewsLabel.textContent = i18n?.filters?.reviews || "Min. Reviews";
	reviewsLabel.style.cssText = "display: block; margin-top: 8px; font-weight: 500; font-size: 12px;";
	content.appendChild(reviewsLabel);
	
	const reviewsInput = document.createElement("input");
	reviewsInput.type = "number";
	reviewsInput.min = "0";
	reviewsInput.placeholder = "0";
	reviewsInput.style.cssText = "width: 100%; margin-top: 4px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;";
	reviewsInput.setAttribute("aria-label", i18n?.filters?.reviews || "Min. Reviews");
	content.appendChild(reviewsInput);
	
	// Drive-thru toggle
	const dtDiv = document.createElement("div");
	dtDiv.style.cssText = "margin-top: 10px; display: flex; align-items: center; gap: 6px;";
	const dtCheck = document.createElement("input");
	dtCheck.type = "checkbox";
	dtCheck.id = "filter-dt";
	dtCheck.setAttribute("aria-label", i18n?.filters?.driveThru || "Drive-Thru Only");
	const dtLabel = document.createElement("label");
	dtLabel.htmlFor = "filter-dt";
	dtLabel.textContent = i18n?.filters?.driveThru || "Drive-Thru Only";
	dtLabel.style.cursor = "pointer";
	dtDiv.appendChild(dtCheck);
	dtDiv.appendChild(dtLabel);
	content.appendChild(dtDiv);
	
	// Open now toggle
	const openDiv = document.createElement("div");
	openDiv.style.cssText = "margin-top: 6px; display: flex; align-items: center; gap: 6px;";
	const openCheck = document.createElement("input");
	openCheck.type = "checkbox";
	openCheck.id = "filter-open";
	openCheck.setAttribute("aria-label", i18n?.filters?.openNow || "Open Now");
	const openLabel = document.createElement("label");
	openLabel.htmlFor = "filter-open";
	openLabel.textContent = i18n?.filters?.openNow || "Open Now";
	openLabel.style.cursor = "pointer";
	openDiv.appendChild(openCheck);
	openDiv.appendChild(openLabel);
	content.appendChild(openDiv);
	
	// Action buttons
	const btnRow = document.createElement("div");
	btnRow.style.cssText = "margin-top: 12px; display: flex; gap: 6px;";
	
	const resetBtn = document.createElement("button");
	resetBtn.textContent = i18n?.filters?.reset || "Reset";
	resetBtn.style.cssText = "flex: 1; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;";
	resetBtn.setAttribute("aria-label", i18n?.filters?.reset || "Reset Filters");
	btnRow.appendChild(resetBtn);
	
	const shareBtn = document.createElement("button");
	shareBtn.textContent = i18n?.filters?.share || "Share";
	shareBtn.style.cssText = "flex: 1; padding: 6px; border: 1px solid #2563eb; border-radius: 4px; background: #3b82f6; color: white; cursor: pointer; font-size: 12px;";
	shareBtn.setAttribute("aria-label", i18n?.filters?.share || "Share Link");
	btnRow.appendChild(shareBtn);
	
	content.appendChild(btnRow);
	
	// Event listeners
	const collectFilters = () => {
		return {
			categories: Array.from(catSelect.selectedOptions).map(o => o.value),
			prices: Array.from(priceSelect.selectedOptions).map(o => o.value),
			minRating: ratingInput.value ? Number(ratingInput.value) : null,
			minReviews: reviewsInput.value ? Number(reviewsInput.value) : null,
			driveThruOnly: dtCheck.checked,
			openNow: openCheck.checked
		};
	};
	
	const updateUI = () => {
		catSelect.value = state.filters.categories || [];
		priceSelect.value = state.filters.prices || [];
		ratingInput.value = state.filters.minRating || "";
		reviewsInput.value = state.filters.minReviews || "";
		dtCheck.checked = state.filters.driveThruOnly || false;
		openCheck.checked = state.filters.openNow || false;
	};
	
	catSelect.addEventListener("change", () => {
		trackInteraction("change", "filter_category", { values: collectFilters().categories });
		callbacks.onFilterChange(collectFilters());
	});
	priceSelect.addEventListener("change", () => {
		trackInteraction("change", "filter_price", { values: collectFilters().prices });
		callbacks.onFilterChange(collectFilters());
	});
	ratingInput.addEventListener("input", debounce(() => {
		trackInteraction("input", "filter_rating", { value: ratingInput.value });
		callbacks.onFilterChange(collectFilters());
	}, 300));
	reviewsInput.addEventListener("input", debounce(() => {
		trackInteraction("input", "filter_reviews", { value: reviewsInput.value });
		callbacks.onFilterChange(collectFilters());
	}, 300));
	dtCheck.addEventListener("change", () => {
		trackInteraction("toggle", "filter_drive_thru", { checked: dtCheck.checked });
		callbacks.onFilterChange(collectFilters());
	});
	openCheck.addEventListener("change", () => {
		trackInteraction("toggle", "filter_open_now", { checked: openCheck.checked });
		callbacks.onFilterChange(collectFilters());
	});
	
	resetBtn.addEventListener("click", () => {
		trackInteraction("click", "reset_filters");
		callbacks.onFilterChange({
			categories: [],
			prices: [],
			minRating: null,
			minReviews: null,
			driveThruOnly: false,
			openNow: false,
			selectionBounds: null
		});
	});
	
	shareBtn.addEventListener("click", () => {
		trackInteraction("click", "share_link");
		const hash = encodeStateToHash({ ...state.filters, tab: state.activeTab });
		const url = `${window.location.origin}${window.location.pathname}#${hash}`;
		navigator.clipboard.writeText(url).then(() => {
			shareBtn.textContent = "✓ Copied!";
			setTimeout(() => {
				shareBtn.textContent = i18n?.filters?.share || "Share";
			}, 2000);
		});
	});
	
	// Append content to panel
	panel.appendChild(content);
	
	// Initialize UI from state
	updateUI();
	
	container.appendChild(panel);
	
	return { updateUI, populateCategories };
}

function createMapControls(container, map, state, callbacks, i18n) {
	const controls = document.createElement("div");
	controls.style.cssText = "position: absolute; top: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 6px;";
	
	const createButton = (text, ariaLabel, onClick) => {
		const btn = document.createElement("button");
		btn.textContent = text;
		btn.style.cssText = "padding: 8px 12px; background: rgba(255,255,255,0.98); border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font: 600 12px system-ui; box-shadow: 0 2px 4px rgba(0,0,0,0.1);";
		btn.setAttribute("aria-label", ariaLabel);
		btn.addEventListener("click", onClick);
		return btn;
	};
	
	const resetBtn = createButton(
		"⟲",
		i18n?.map?.resetView || "Reset View",
		() => {
			trackInteraction("click", "reset_map_view");
			try {
				const bounds = new mapboxgl.LngLatBounds();
				for (const f of state.restaurantsGeoEnriched.features) {
					bounds.extend(f.geometry.coordinates);
				}
				if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 40 });
			} catch (err) {
				console.warn("Failed to reset view:", err);
				trackError(err, { action: "reset_map_view" });
			}
		}
	);
	controls.appendChild(resetBtn);
	
	const clusterBtn = createButton(
		"⬡",
		i18n?.map?.toggleClusters || "Toggle Clusters",
		() => {
			trackInteraction("click", "toggle_clusters");
			callbacks.onToggleClusters();
		}
	);
	controls.appendChild(clusterBtn);
	
	const densityBtn = createButton(
		"▦",
		i18n?.map?.toggleDensity || "Toggle Density",
		() => {
			trackInteraction("click", "toggle_density");
			callbacks.onToggleDensity();
		}
	);
	controls.appendChild(densityBtn);
	
	container.appendChild(controls);
}

// ============================================================================
// Main dashboard
// ============================================================================

export default function industryEvaluationDashboard({
	center = [29.7604, -95.3698],
	zoom = 10,
	size,
	mapboxToken,
	mapboxStyle = DEFAULT_STYLE,
	data,
	i18n = {}
} = {}) {
	const dashboardTimer = startTimer("dashboard_init");
	
	try {
		ensureMapboxAccessToken(mapboxToken);
		
		// Extract and enrich data
		const restaurantsGeo = asFeatureCollection(data?.visualizations?.map?.layers?.restaurants?.data) || { type: "FeatureCollection", features: [] };
		const driveThruHeatFC = toFeatureCollectionFromList(data?.visualizations?.map?.layers?.driveThruHeatmap?.data, (d) => ({ zipCode: d.zipCode, value: Number(d.value) })) || { type: "FeatureCollection", features: [] };
		
		const restaurantsGeoEnriched = enrichRestaurantFeatures(restaurantsGeo);
		
		// Extract hours data once at initialization
		const hoursData = data?.visualizations?.openingHours?.data || [];
		
		console.log("🔍 Dashboard data loaded:", {
			restaurants: restaurantsGeoEnriched.features.length,
			hoursDataEntries: hoursData.length,
			heatmapCells: driveThruHeatFC.features.length
		});
		
		trackEvent("dashboard", "data_loaded", {
			restaurantCount: restaurantsGeoEnriched.features.length,
			heatmapCells: driveThruHeatFC.features.length,
			hoursEntries: hoursData.length
		});
	
	// State - decode from URL hash
	const hashState = decodeStateFromHash(window.location.hash);
	const state = {
		restaurantsGeoEnriched,
		driveThruHeatFC,
		hoursData,
		activeTab: hashState.tab || "overview",
		filters: {
			categories: hashState.categories || [],
			prices: hashState.prices || [],
			minRating: hashState.minRating,
			minReviews: hashState.minReviews,
			driveThruOnly: hashState.driveThruOnly || false,
			openNow: hashState.openNow || false,
			selectionBounds: null
		},
		clustersEnabled: zoom < 12,
		densityEnabled: true
	};
	
	// Main container with tabs + KPIs + chips + content
	const container = document.createElement("div");
	container.style.width = size?.width ? `${size.width}px` : "100%";
	container.style.height = size?.height ? `${size.height}px` : "auto";
	container.style.minHeight = "900px";
	container.style.display = "flex";
	container.style.flexDirection = "column";
	container.style.background = "#f9fafb";
	
	// Tabs
	const tabsContainer = document.createElement("div");
	const tabs = createTabs({
		tabs: [
			{ id: "overview", label: i18n?.tabs?.overview || "Overview" },
			{ id: "categories", label: i18n?.tabs?.categories || "Categories" },
			{ id: "prices", label: i18n?.tabs?.prices || "Prices" },
			{ id: "reviews", label: i18n?.tabs?.reviews || "Reviews" },
			{ id: "hours", label: i18n?.tabs?.hours || "Hours" }
		],
		activeTab: state.activeTab,
		onChange: (tabId) => {
			state.activeTab = tabId;
			syncStateToHash({ ...state.filters, tab: tabId });
			updateTabVisibility();
			trackInteraction("click", "tab_change", { tab: tabId });
		},
		i18n
	});
	container.appendChild(tabs);
	
	// KPI Band
	let kpiBand;
	const renderKpiBand = () => {
		const filtered = filterRestaurants(restaurantsGeoEnriched, state.filters);
		const avgRating = filtered.features.reduce((sum, f) => sum + (f.properties.ratingNumeric || 0), 0) / (filtered.features.length || 1);
		
		const kpis = [
			{ 
				label: i18n?.kpis?.totalRestaurants || "Total Restaurants", 
				value: restaurantsGeoEnriched.features.length.toLocaleString(), 
				color: "#3b82f6" 
			},
			{ 
				label: i18n?.kpis?.selectedArea || "In Selection", 
				value: filtered.features.length.toLocaleString(), 
				sublabel: `${((filtered.features.length / restaurantsGeoEnriched.features.length) * 100).toFixed(1)}%`,
				color: "#10b981" 
			},
			{ 
				label: i18n?.kpis?.hoursCoverage || "Hours Coverage", 
				value: `${hoursData.length.toLocaleString()}`, 
				sublabel: `${((hoursData.length / restaurantsGeoEnriched.features.length) * 100).toFixed(0)}% with hours`,
				color: "#f59e0b" 
			},
			{ 
				label: i18n?.kpis?.avgRating || "Avg Rating", 
				value: avgRating.toFixed(2), 
				sublabel: `from ${filtered.features.length.toLocaleString()} restaurants`,
				color: "#8b5cf6" 
			}
		];
		
		if (kpiBand) {
			kpiBand.replaceWith(createKpiBand({ kpis, i18n }));
		}
		kpiBand = createKpiBand({ kpis, i18n });
		return kpiBand;
	};
	container.appendChild(renderKpiBand());
	
	// Filter Chips
	let filterChipsContainer;
	const renderFilterChips = () => {
		const chips = createFilterChips({
			filters: state.filters,
			onRemove: (type, value) => {
				if (type === "category") {
					state.filters.categories = state.filters.categories.filter(c => c !== value);
				} else if (type === "price") {
					state.filters.prices = state.filters.prices.filter(p => p !== value);
				} else if (type === "rating") {
					state.filters.minRating = null;
				} else if (type === "reviews") {
					state.filters.minReviews = null;
				} else if (type === "driveThru") {
					state.filters.driveThruOnly = false;
				} else if (type === "openNow") {
					state.filters.openNow = false;
				}
				syncStateToHash({ ...state.filters, tab: state.activeTab });
				updateCharts();
				renderFilterChips();
				if (filterPanelAPI) filterPanelAPI.updateUI();
				trackInteraction("click", "chip_remove", { type, value });
			},
			onClearAll: () => {
				state.filters = {
					categories: [],
					prices: [],
					minRating: null,
					minReviews: null,
					driveThruOnly: false,
					openNow: false,
					selectionBounds: null
				};
				syncStateToHash({ ...state.filters, tab: state.activeTab });
				updateCharts();
				renderFilterChips();
				if (filterPanelAPI) filterPanelAPI.updateUI();
				trackInteraction("click", "chips_clear_all");
			},
			i18n
		});
		
		if (filterChipsContainer) {
			filterChipsContainer.replaceWith(chips);
		}
		filterChipsContainer = chips;
		return filterChipsContainer;
	};
	container.appendChild(renderFilterChips());
	
	// Content area with map + charts (grid layout)
	const contentArea = document.createElement("div");
	contentArea.style.cssText = `
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 600px 380px 380px 280px;
		gap: 16px;
		padding: 16px;
		position: relative;
		overflow: auto;
	`;
	
	// Map container - spans first two rows
	const mapWrap = document.createElement("div");
	mapWrap.style.position = "relative";
	mapWrap.style.gridColumn = "1 / 2";
	mapWrap.style.gridRow = "1 / 3";
	mapWrap.style.border = "1px solid #e5e7eb";
	mapWrap.style.borderRadius = "8px";
	mapWrap.style.overflow = "hidden";
	mapWrap.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
	const mapEl = document.createElement("div");
	mapEl.style.width = "100%";
	mapEl.style.height = "100%";
	mapWrap.appendChild(mapEl);
	contentArea.appendChild(mapWrap);
	
	// Charts containers - right column
	const catWrap = document.createElement("div");
	catWrap.style.gridColumn = "2 / 3";
	catWrap.style.gridRow = "1 / 2";
	catWrap.style.padding = "16px";
	catWrap.style.border = "1px solid #e5e7eb";
	catWrap.style.borderRadius = "8px";
	catWrap.style.backgroundColor = "white";
	catWrap.style.overflow = "auto";
	const catHeader = document.createElement("div");
	catHeader.textContent = i18n?.charts?.categories || "Restaurant Categories";
	catHeader.style.cssText = "font: 600 16px system-ui; margin: 0 0 12px 0; color: #111827;";
	const catChart = document.createElement("div");
	catWrap.appendChild(catHeader);
	catWrap.appendChild(catChart);
	contentArea.appendChild(catWrap);
	
	const priceWrap = document.createElement("div");
	priceWrap.style.gridColumn = "2 / 3";
	priceWrap.style.gridRow = "2 / 3";
	priceWrap.style.padding = "16px";
	priceWrap.style.border = "1px solid #e5e7eb";
	priceWrap.style.borderRadius = "8px";
	priceWrap.style.backgroundColor = "white";
	priceWrap.style.overflow = "auto";
	const priceHeader = document.createElement("div");
	priceHeader.textContent = i18n?.charts?.priceDistribution || "Price Distribution";
	priceHeader.style.cssText = "font: 600 16px system-ui; margin: 0 0 12px 0; color: #111827;";
	const priceChart = document.createElement("div");
	priceWrap.appendChild(priceHeader);
	priceWrap.appendChild(priceChart);
	contentArea.appendChild(priceWrap);
	
	const reviewsWrap = document.createElement("div");
	reviewsWrap.style.gridColumn = "1 / 2";
	reviewsWrap.style.gridRow = "3 / 4";
	reviewsWrap.style.padding = "16px";
	reviewsWrap.style.border = "1px solid #e5e7eb";
	reviewsWrap.style.borderRadius = "8px";
	reviewsWrap.style.backgroundColor = "white";
	reviewsWrap.style.overflow = "auto";
	const reviewsHeader = document.createElement("div");
	reviewsHeader.textContent = i18n?.charts?.reviews || "Star Distribution";
	reviewsHeader.style.cssText = "font: 600 16px system-ui; margin: 0 0 12px 0; color: #111827;";
	const reviewsChart = document.createElement("div");
	reviewsWrap.appendChild(reviewsHeader);
	reviewsWrap.appendChild(reviewsChart);
	contentArea.appendChild(reviewsWrap);
	
	const hoursWrap = document.createElement("div");
	hoursWrap.style.gridColumn = "2 / 3";
	hoursWrap.style.gridRow = "3 / 4";
	hoursWrap.style.padding = "16px";
	hoursWrap.style.border = "1px solid #e5e7eb";
	hoursWrap.style.borderRadius = "8px";
	hoursWrap.style.backgroundColor = "white";
	hoursWrap.style.overflow = "auto";
	const hoursHeader = document.createElement("div");
	hoursHeader.textContent = i18n?.charts?.hours || "Opening Hours";
	hoursHeader.style.cssText = "font: 600 16px system-ui; margin: 0 0 12px 0; color: #111827;";
	const hoursChart = document.createElement("div");
	hoursWrap.appendChild(hoursHeader);
	hoursWrap.appendChild(hoursChart);
	contentArea.appendChild(hoursWrap);
	
	// Append content area to container
	container.appendChild(contentArea);
	
	// Add resize observers to chart containers for responsiveness
	const chartContainers = [catWrap, priceWrap, reviewsWrap, hoursWrap];
	const resizeCleanups = [];
	
	chartContainers.forEach(wrap => {
		const cleanup = observeResize(wrap, debounceResize((width, height) => {
			// Trigger chart re-render when container resizes
			updateCharts();
		}, 300));
		resizeCleanups.push(cleanup);
	});
	
	// Create map
	const map = createMapboxMap(mapEl, { style: mapboxStyle, center, zoom });
	
	// Filter panel API reference (will be set later)
	let filterPanelAPI = null;
	
	// Drawer state
	let drawerContainer = null;
	let drawerSortBy = "rating";
	
	// Tab visibility - show/hide chart containers based on active tab
	const updateTabVisibility = () => {
		const tab = state.activeTab;
		
		// Map is always visible
		mapWrap.style.display = "block";
		
		if (tab === "overview") {
			// Show all charts
			catWrap.style.display = "block";
			priceWrap.style.display = "block";
			reviewsWrap.style.display = "block";
			hoursWrap.style.display = "block";
			
			// Reset heights
			catWrap.style.height = "auto";
			priceWrap.style.height = "auto";
			reviewsWrap.style.height = "auto";
			hoursWrap.style.height = "auto";
			
			// Restore grid layout
			contentArea.style.gridTemplateColumns = "1fr 1fr";
			contentArea.style.gridTemplateRows = "600px 380px 380px 280px";
			mapWrap.style.gridColumn = "1 / 2";
			mapWrap.style.gridRow = "1 / 3";
			catWrap.style.gridColumn = "2 / 3";
			catWrap.style.gridRow = "1 / 2";
			priceWrap.style.gridColumn = "2 / 3";
			priceWrap.style.gridRow = "2 / 3";
			reviewsWrap.style.gridColumn = "1 / 2";
			reviewsWrap.style.gridRow = "3 / 4";
			hoursWrap.style.gridColumn = "2 / 3";
			hoursWrap.style.gridRow = "3 / 4";
		} else if (tab === "categories") {
			// Show only category chart (larger)
			catWrap.style.display = "block";
			priceWrap.style.display = "none";
			reviewsWrap.style.display = "none";
			hoursWrap.style.display = "none";
			
			// Adjust grid for focused view
			contentArea.style.gridTemplateColumns = "1fr 1fr";
			contentArea.style.gridTemplateRows = "auto";
			mapWrap.style.gridColumn = "1 / 2";
			mapWrap.style.gridRow = "1 / 2";
			catWrap.style.gridColumn = "2 / 3";
			catWrap.style.gridRow = "1 / 2";
			catWrap.style.height = "800px";
		} else if (tab === "prices") {
			// Show only price chart
			catWrap.style.display = "none";
			priceWrap.style.display = "block";
			reviewsWrap.style.display = "none";
			hoursWrap.style.display = "none";
			
			contentArea.style.gridTemplateColumns = "1fr 1fr";
			contentArea.style.gridTemplateRows = "auto";
			mapWrap.style.gridColumn = "1 / 2";
			mapWrap.style.gridRow = "1 / 2";
			priceWrap.style.gridColumn = "2 / 3";
			priceWrap.style.gridRow = "1 / 2";
			priceWrap.style.height = "800px";
		} else if (tab === "reviews") {
			// Show only reviews chart
			catWrap.style.display = "none";
			priceWrap.style.display = "none";
			reviewsWrap.style.display = "block";
			hoursWrap.style.display = "none";
			
			contentArea.style.gridTemplateColumns = "1fr 1fr";
			contentArea.style.gridTemplateRows = "auto";
			mapWrap.style.gridColumn = "1 / 2";
			mapWrap.style.gridRow = "1 / 2";
			reviewsWrap.style.gridColumn = "2 / 3";
			reviewsWrap.style.gridRow = "1 / 2";
			reviewsWrap.style.height = "800px";
		} else if (tab === "hours") {
			// Show only hours chart
			catWrap.style.display = "none";
			priceWrap.style.display = "none";
			reviewsWrap.style.display = "none";
			hoursWrap.style.display = "block";
			
			contentArea.style.gridTemplateColumns = "1fr 1fr";
			contentArea.style.gridTemplateRows = "auto";
			mapWrap.style.gridColumn = "1 / 2";
			mapWrap.style.gridRow = "1 / 2";
			hoursWrap.style.gridColumn = "2 / 3";
			hoursWrap.style.gridRow = "1 / 2";
			hoursWrap.style.height = "800px";
		}
		
		// Trigger chart re-render after layout change
		setTimeout(() => {
			if (map) map.resize();
		}, 100);
		
		trackEvent("tab", "view", { tab: state.activeTab });
	};
	
	// Drawer helpers
	const sortRestaurants = (restaurants, sortBy) => {
		const sorted = [...restaurants];
		if (sortBy === "rating") {
			sorted.sort((a, b) => (b.ratingNumeric || 0) - (a.ratingNumeric || 0));
		} else if (sortBy === "reviews") {
			sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
		} else if (sortBy === "name") {
			sorted.sort((a, b) => (a.name || a.title || "").localeCompare(b.name || b.title || ""));
		}
		// distance would require calculating from center or user location
		return sorted;
	};
	
	const exportToCSV = (restaurants) => {
		const headers = ["Name", "Category", "Price", "Rating", "Reviews"];
		const rows = restaurants.map(r => [
			r.name || r.title || "",
			r.category || "",
			r.priceRange || r.price || "",
			r.ratingNumeric || "",
			r.reviewCount || ""
		]);
		
		const csv = [headers, ...rows].map(row => 
			row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
		).join("\n");
		
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `restaurants_${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(link.href);
		
		trackInteraction("click", "export_csv", { count: restaurants.length });
	};
	
	const openDrawer = (restaurants) => {
		if (drawerContainer) {
			drawerContainer.remove();
		}
		
		const sorted = sortRestaurants(restaurants, drawerSortBy);
		
		drawerContainer = createDrawer({
			restaurants: sorted,
			sortBy: drawerSortBy,
			onClose: () => {
				if (drawerContainer) {
					drawerContainer.remove();
					drawerContainer = null;
				}
				trackInteraction("click", "drawer_close");
			},
			onSort: (newSortBy) => {
				drawerSortBy = newSortBy;
				openDrawer(restaurants);
				trackInteraction("change", "drawer_sort", { sortBy: newSortBy });
			},
			onExport: () => exportToCSV(sorted),
			onSelect: (restaurant, idx) => {
				// Zoom map to restaurant location
				if (restaurant.geometry?.coordinates) {
					map.flyTo({
						center: restaurant.geometry.coordinates,
						zoom: 16,
						duration: 1000
					});
				}
				trackInteraction("click", "drawer_select_restaurant", { idx });
			},
			i18n
		});
		
		document.body.appendChild(drawerContainer);
		trackEvent("drawer", "open", { count: restaurants.length, sortBy: drawerSortBy });
	};
	
	// Chart click handler - opens drawer with filtered restaurants
	const handleChartClick = (filteredFeatures, context) => {
		const restaurants = filteredFeatures.map(f => ({
			...f.properties,
			geometry: f.geometry
		}));
		openDrawer(restaurants);
		trackInteraction("click", "chart_bar", context);
	};
	
	// Update function
	const updateCharts = () => {
		const filtered = filterRestaurants(restaurantsGeoEnriched, state.filters);
		
		// Update charts with click handlers
		renderCategoryChart(catChart, filtered.features, i18n, handleChartClick);
		renderPriceChart(priceChart, filtered.features, i18n);
		renderReviewsChart(reviewsChart, filtered.features, i18n);
		renderHoursHeatmap(hoursChart, filtered.features, state.hoursData, i18n);
		
		// Update KPI band
		renderKpiBand();
		
		// Update filter chips
		renderFilterChips();
		
		// Update map source
		if (map.getSource("restaurants")) {
			map.getSource("restaurants").setData(filtered);
		}
	};
	
	const debouncedUpdateCharts = debounce(updateCharts, 100);
	
	// Callbacks
	const callbacks = {
		onFilterChange: (newFilters) => {
			state.filters = { ...state.filters, ...newFilters };
			syncStateToHash({ ...state.filters, tab: state.activeTab });
			updateCharts();
		},
		onToggleClusters: () => {
			state.clustersEnabled = !state.clustersEnabled;
			const visibility = state.clustersEnabled ? "visible" : "none";
			if (map.getLayer("restaurants-clusters")) map.setLayoutProperty("restaurants-clusters", "visibility", visibility);
			if (map.getLayer("restaurants-cluster-count")) map.setLayoutProperty("restaurants-cluster-count", "visibility", visibility);
			if (map.getLayer("restaurants-unclustered")) map.setLayoutProperty("restaurants-unclustered", "visibility", state.clustersEnabled ? "none" : "visible");
		},
		onToggleDensity: () => {
			state.densityEnabled = !state.densityEnabled;
			const visibility = state.densityEnabled ? "visible" : "none";
			if (map.getLayer("dt-heat-fill")) map.setLayoutProperty("dt-heat-fill", "visibility", visibility);
		}
	};
	
	// Create UI
	filterPanelAPI = createFilterPanel(mapWrap, state, callbacks, i18n);
	createMapControls(mapWrap, map, state, callbacks, i18n);
	
	// Map setup
	map.on("load", () => {
		// Add sources
		map.addSource("restaurants", {
			type: "geojson",
			data: restaurantsGeoEnriched,
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50
		});
		
		map.addSource("dt-heat", {
			type: "geojson",
			data: driveThruHeatFC
		});
		
		// Density layer
		if (driveThruHeatFC.features.length > 0) {
			map.addLayer({
				id: "dt-heat-fill",
				type: "fill",
				source: "dt-heat",
				paint: {
					"fill-color": [
						"interpolate",
						["linear"],
						["to-number", ["get", "value"], 0],
						0, "#f3f4f6",
						0.5, "#fb7185",
						1, "#be123c"
					],
					"fill-opacity": 0.4
				}
			});
		}
		
		// Clusters
		map.addLayer({
			id: "restaurants-clusters",
			type: "circle",
			source: "restaurants",
			filter: ["has", "point_count"],
			paint: {
				"circle-color": [
					"step",
					["get", "point_count"],
					"#93c5fd",
					10, "#60a5fa",
					30, "#3b82f6",
					100, "#2563eb"
				],
				"circle-radius": [
					"step",
					["get", "point_count"],
					15,
					10, 20,
					30, 25,
					100, 30
				],
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff"
			}
		});
		
		map.addLayer({
			id: "restaurants-cluster-count",
			type: "symbol",
			source: "restaurants",
			filter: ["has", "point_count"],
			layout: {
				"text-field": "{point_count_abbreviated}",
				"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
				"text-size": 12
			},
			paint: {
				"text-color": "#ffffff"
			}
		});
		
		// Unclustered points
		map.addLayer({
			id: "restaurants-unclustered",
			type: "circle",
			source: "restaurants",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-radius": [
					"interpolate",
					["linear"],
					["zoom"],
					10, 3,
					14, 6,
					18, 10
				],
				"circle-color": [
					"match",
					["get", "category"],
					...Object.entries(CATEGORY_COLORS).flat(),
					CATEGORY_COLORS.Other
				],
				"circle-stroke-width": 1,
				"circle-stroke-color": "#fff",
				"circle-opacity": 0.9
			}
		});
		
		// Tooltips
		const popup = new mapboxgl.Popup({
			closeButton: false,
			closeOnClick: false,
			offset: 10
		});
		
		map.on("mouseenter", "restaurants-unclustered", (e) => {
			map.getCanvas().style.cursor = "pointer";
			const props = e.features[0].properties;
			const html = `
				<div style="font: 12px system-ui; padding: 4px;">
					<strong>${props.title || props.name || "Restaurant"}</strong><br/>
					${props.category || ""} • ${props.priceRange || props.price || ""}<br/>
					⭐ ${props.ratingNumeric?.toFixed(1) || "N/A"} (${props.reviewCount || 0} reviews)
				</div>
			`;
			popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
		});
		
		map.on("mouseleave", "restaurants-unclustered", () => {
			map.getCanvas().style.cursor = "";
			popup.remove();
		});
		
		// Cluster click to zoom
		map.on("click", "restaurants-clusters", (e) => {
			const features = map.queryRenderedFeatures(e.point, { layers: ["restaurants-clusters"] });
			const clusterId = features[0].properties.cluster_id;
			map.getSource("restaurants").getClusterExpansionZoom(clusterId, (err, zoom) => {
				if (err) return;
				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom
				});
			});
		});
		
		// Initial fit
		try {
			const bounds = new mapboxgl.LngLatBounds();
			for (const f of restaurantsGeoEnriched.features) {
				bounds.extend(f.geometry.coordinates);
			}
			if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 40 });
		} catch (err) {
			console.warn("Failed to fit bounds:", err);
		}
		
		// Initialize tab visibility
		updateTabVisibility();
		
		updateCharts();
		dashboardTimer.end({ success: true });
	});
	
	waitForContainerSize(container, map, () => {
		try {
			map.resize();
		} catch (err) {
			console.warn("Failed to resize map:", err);
			trackError(err, { action: "map_resize" });
		}
	});
	
	return container;
	
	} catch (error) {
		trackError(error, { component: "industryEvaluationDashboard" });
		dashboardTimer.end({ success: false, reason: "error" });
		
		const errorContainer = document.createElement("div");
		errorContainer.style.width = size?.width ? `${size.width}px` : "100%";
		errorContainer.style.height = size?.height ? `${size.height}px` : "900px";
		errorContainer.style.display = "flex";
		errorContainer.style.alignItems = "center";
		errorContainer.style.justifyContent = "center";
		
		errorContainer.appendChild(createErrorState({
			title: "Dashboard Error",
			message: "Failed to initialize the industry evaluation dashboard. Please refresh the page.",
			error,
			showDetails: true
		}));
		
		return errorContainer;
	}
}
