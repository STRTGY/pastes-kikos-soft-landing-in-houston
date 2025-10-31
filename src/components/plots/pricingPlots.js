import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {html} from "npm:htl";

/**
 * Shared formatting utilities for pricing visualizations
 */

// Currency formatter
export const formatCurrency = d3.format("$,.2f");
export const formatCurrencyCompact = d3.format("$,~f");

// Percent formatter
export const formatPercent = d3.format(".1%");
export const formatPercentWhole = d3.format(".0%");

// Number formatters
export const formatNumber = d3.format(",");
export const formatDecimal = d3.format(".2f");

/**
 * Shared Plot configuration defaults
 */
export const PLOT_DEFAULTS = {
  marginLeft: 80,
  marginRight: 20,
  marginTop: 30,
  marginBottom: 60,
  style: {
    background: "transparent",
    fontSize: "13px",
    fontFamily: "system-ui, sans-serif"
  },
  grid: true
};

/**
 * Shared color palettes
 */
export const COLOR_PALETTES = {
  primary: "#1f77b4",
  secondary: "#ff7f0e",
  menu: "#3498db",
  google: "#e67e22",
  sequential: ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"],
  categorical: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]
};

/**
 * Create histogram with responsive width
 * @param {Array} data - Data array
 * @param {Object} options - Plot configuration
 */
export function createHistogram(data, options = {}) {
  const {
    x = "value",
    y = "count",
    fill = COLOR_PALETTES.primary,
    thresholds = "auto",
    width,
    height = 300,
    xLabel = "Value",
    yLabel = "Frequency",
    xFormat,
    tip = true
  } = options;

  // Guard against empty data
  if (!data || data.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos para mostrar
    </div>`;
  }

  // Dynamic bin count based on data size
  const binCount = thresholds === "auto" 
    ? Math.min(50, Math.max(10, Math.floor(Math.sqrt(data.length))))
    : thresholds;

  return Plot.plot({
    ...PLOT_DEFAULTS,
    width,
    height,
    x: {
      label: xLabel,
      grid: true,
      tickFormat: xFormat
    },
    y: {
      label: yLabel,
      grid: true
    },
    marks: [
      Plot.rectY(data, Plot.binX({y}, {
        x,
        fill,
        thresholds: binCount,
        tip
      })),
      Plot.ruleY([0])
    ]
  });
}

/**
 * Create IQR bar chart (for restaurant/category comparisons)
 * @param {Array} data - Data with p25, median, p75 fields
 * @param {Object} options - Plot configuration
 */
export function createIQRChart(data, options = {}) {
  const {
    y = "name",
    x1 = "p25",
    x2 = "p75",
    median = "median",
    width,
    height = 600,
    marginLeft = 200,
    xLabel = "Price (USD)",
    xFormat = formatCurrency,
    sortBy = "median",
    reverse = true,
    barColor = "#bfdbfe",
    medianColor = "steelblue",
    tip = true
  } = options;

  // Guard against empty data
  if (!data || data.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos para mostrar
    </div>`;
  }

  // Filter data to only include items with required fields
  let validData = data.filter(d => 
    d[x1] != null && d[x2] != null && d[median] != null && d[y] != null
  );

  if (validData.length === 0) {
    // Debug: show what we're looking for
    console.warn("createIQRChart: No valid data. Looking for fields:", {x1, x2, median, y});
    console.warn("Sample of input data (first 3):", data.slice(0, 3));
    
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos válidos para mostrar. Verifica que los campos requeridos existan: ${x1}, ${x2}, ${median}, ${y}
    </div>`;
  }

  // Sort data if sortBy is specified
  if (sortBy) {
    validData = validData.slice().sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return reverse ? bVal - aVal : aVal - bVal;
    });
  }

  // Debug: show what we're plotting
  console.log("createIQRChart: Plotting", validData.length, "items");
  console.log("Fields:", {x1, x2, median, y});
  console.log("Sample data:", validData[0]);

  return Plot.plot({
    ...PLOT_DEFAULTS,
    width,
    height,
    marginLeft,
    x: {
      label: xLabel,
      grid: true,
      tickFormat: xFormat
    },
    y: {
      label: null,
      domain: validData.map(d => d[y])
    },
    marks: [
      // IQR bars
      Plot.barX(validData, {
        x1,
        x2,
        y,
        fill: barColor
      }),
      // Median dots
      Plot.dot(validData, {
        x: median,
        y,
        fill: medianColor,
        r: 4,
        tip
      }),
      Plot.ruleX([0])
    ]
  });
}

/**
 * Create diverging comparison chart (for two sources)
 * @param {Array} data - Data with source field
 * @param {Object} options - Plot configuration
 */
export function createComparisonHistogram(data, options = {}) {
  const {
    x = "value",
    source = "source",
    width,
    height = 300,
    xLabel = "Value",
    yLabel = "Frequency",
    colors = [COLOR_PALETTES.menu, COLOR_PALETTES.google],
    labels = ["Menu", "Google"],
    thresholds = 30,
    xFormat,
    tip = true
  } = options;

  // Guard against empty data
  if (!data || data.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos para mostrar
    </div>`;
  }

  return Plot.plot({
    ...PLOT_DEFAULTS,
    width,
    height,
    x: {
      label: xLabel,
      grid: true,
      tickFormat: xFormat
    },
    y: {
      label: yLabel,
      grid: true
    },
    color: {
      domain: labels,
      range: colors,
      legend: true
    },
    marks: [
      Plot.rectY(data, Plot.binX({y: "count"}, {
        x,
        fill: source,
        thresholds,
        opacity: 0.6,
        tip
      })),
      Plot.ruleY([0])
    ]
  });
}

/**
 * Create sorted bar chart (for product variation, categories, etc.)
 * @param {Array} data - Data array
 * @param {Object} options - Plot configuration
 */
export function createSortedBarChart(data, options = {}) {
  const {
    x = "value",
    y = "name",
    width,
    height = 400,
    marginLeft = 180,
    xLabel = "Value",
    fill = "value",
    colorScheme = "Oranges",
    sortOrder = "-x",
    xFormat,
    tip = true
  } = options;

  // Guard against empty data
  if (!data || data.length === 0) {
    return html`<div class="note" style="padding: 2rem; text-align: center; color: var(--theme-foreground-muted);">
      Sin datos para mostrar
    </div>`;
  }

  return Plot.plot({
    ...PLOT_DEFAULTS,
    width,
    height,
    marginLeft,
    x: {
      label: xLabel,
      grid: true,
      tickFormat: xFormat
    },
    y: {
      label: null
    },
    color: {
      scheme: colorScheme
    },
    marks: [
      Plot.barX(data, {
        x,
        y,
        fill,
        sort: {y: sortOrder},
        tip
      }),
      Plot.ruleX([0])
    ]
  });
}

/**
 * Filter outliers using IQR method
 * @param {Array} data - Data array
 * @param {string} field - Field name to check for outliers
 * @param {number} multiplier - IQR multiplier (default 1.5)
 * @returns {Object} {filtered, bounds: {lower, upper}}
 */
export function filterOutliers(data, field, multiplier = 1.5) {
  if (!data || data.length === 0) {
    return {filtered: [], bounds: {lower: 0, upper: 0}};
  }

  const values = data.map(d => d[field]).filter(v => v != null).sort((a, b) => a - b);
  
  if (values.length === 0) {
    return {filtered: [], bounds: {lower: 0, upper: 0}};
  }

  const q25 = d3.quantileSorted(values, 0.25);
  const q75 = d3.quantileSorted(values, 0.75);
  const iqr = q75 - q25;
  const lower = q25 - multiplier * iqr;
  const upper = q75 + multiplier * iqr;

  const filtered = data.filter(d => {
    const v = d[field];
    return v != null && v >= lower && v <= upper;
  });

  return {
    filtered,
    bounds: {lower, upper},
    removed: data.length - filtered.length
  };
}

/**
 * Safe quantile calculation with sorted array check
 * @param {Array} values - Array of numbers
 * @param {number} p - Quantile (0-1)
 * @returns {number}
 */
export function safeQuantile(values, p) {
  if (!values || values.length === 0) return null;
  
  // Check if sorted
  const isSorted = values.every((v, i) => i === 0 || values[i - 1] <= v);
  
  if (isSorted) {
    return d3.quantileSorted(values, p);
  } else {
    const sorted = [...values].sort((a, b) => a - b);
    return d3.quantileSorted(sorted, p);
  }
}

