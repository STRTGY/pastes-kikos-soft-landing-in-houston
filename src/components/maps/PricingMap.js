import mapboxgl from "npm:mapbox-gl@3";
import * as d3 from "npm:d3";

/**
 * Create a simplified Mapbox map for pricing visualization
 * @param {HTMLElement} container - DOM container for the map
 * @param {Object} options - Configuration options
 * @returns {mapboxgl.Map} Map instance
 */
export function createPricingMap(container, options) {
  const {
    mapboxToken,
    mapboxStyle,
    data,
    metric,
    weight,
    scale,
    aggregationView
  } = options;

  mapboxgl.accessToken = mapboxToken;
  
  const map = new mapboxgl.Map({
    container,
    style: mapboxStyle,
    center: [-95.3698, 29.7604],
    zoom: 9.5
  });

  let legend = null;
  let popup = null;

  // Color palette
  const colorPalette = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];

  /**
   * Calculate color breaks based on scale type
   */
  function calculateColorBreaks(values, scaleType, numBreaks = 5) {
    const sorted = values.filter(v => v != null).sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    
    if (sorted.length === 1) {
      // Single value - create minimal range
      return [sorted[0], sorted[0]];
    }

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // If all values are the same
    if (max - min < 0.01) {
      return [min, min + 0.01];
    }
    
    if (scaleType === "quantile") {
      const breaks = [];
      for (let i = 0; i <= numBreaks; i++) {
        const idx = Math.floor((i / numBreaks) * (sorted.length - 1));
        breaks.push(sorted[idx]);
      }
      return breaks;
    } else if (scaleType === "equal") {
      const step = (max - min) / numBreaks;
      return Array.from({length: numBreaks + 1}, (_, i) => min + i * step);
    } else if (scaleType === "stdev") {
      const mean = d3.mean(sorted);
      const std = d3.deviation(sorted);
      return [
        mean - 2 * std,
        mean - std,
        mean,
        mean + std,
        mean + 2 * std
      ].filter(v => v >= min && v <= max);
    }
    return [min, max];
  }

  /**
   * Build Mapbox color expression from breaks
   */
  function buildColorExpression(breaks) {
    if (breaks.length < 2) {
      return colorPalette[2]; // Middle color as default
    }

    const colorExpression = ["case"];
    const numColors = Math.min(breaks.length - 1, colorPalette.length);
    
    for (let i = 0; i < numColors; i++) {
      colorExpression.push(
        ["all",
          [">=", ["get", "mixed_value"], breaks[i]],
          ["<", ["get", "mixed_value"], breaks[i + 1]]
        ],
        colorPalette[i]
      );
    }
    colorExpression.push(colorPalette[numColors - 1] || colorPalette[colorPalette.length - 1]);
    
    return colorExpression;
  }

  /**
   * Create or update legend
   */
  function updateLegend(breaks) {
    if (!legend) {
      legend = document.createElement("div");
      legend.style.cssText = `
        position: absolute;
        bottom: 30px;
        right: 10px;
        background: white;
        padding: 10px 12px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font: 11px/1.5 system-ui;
        z-index: 1;
      `;
      container.appendChild(legend);
    }

    if (breaks.length < 2) {
      legend.innerHTML = `<div style="font-weight: 600;">Sin datos suficientes</div>`;
      return;
    }

    legend.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 6px;">Precio (USD)</div>
      ${breaks.slice(0, -1).map((val, i) => `
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="width: 20px; height: 14px; background: ${colorPalette[i] || colorPalette[colorPalette.length - 1]}; margin-right: 6px; border: 1px solid #ddd;"></div>
          <span>$${val.toFixed(2)} – $${breaks[i + 1].toFixed(2)}</span>
        </div>
      `).join("")}
    `;
  }

  /**
   * Calculate mixed value
   */
  function mixedValue(props, metric, weight) {
    const w = weight / 100;
    const mMenu = props[`${metric}_menu`];
    const mGoogle = props[`${metric}_google`];
    
    if (mMenu == null && mGoogle == null) return null;
    if (mMenu == null) return mGoogle;
    if (mGoogle == null) return mMenu;
    
    return w * mMenu + (1 - w) * mGoogle;
  }

  /**
   * Setup popup
   */
  function setupPopup() {
    if (!popup) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
    }

    map.on("mousemove", "pricing-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      
      if (!e.features || !e.features[0]) return;
      
      const props = e.features[0].properties;
      const nGoogle = props.n_google || 0;
      const nMenu = props.n_menu || 0;
      const priceGoogle = props.price_mean_google;
      const priceMenu = props.price_mean_menu;
      const priceMixed = props.mixed_value;
      
      const topRestsMenu = (props.top_restaurants_menu || "").split(";;").filter(r => r).slice(0, 3);
      const cellLabel = aggregationView === "H3 Hexágonos" ? "Hexágono" : "Tract";
      
      const htmlContent = `
        <div style="font: 13px/1.4 system-ui; max-width: 320px;">
          <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #111827;">
            ${cellLabel} ${props.hex_id || props.GEOID || ""}
          </div>
          <div style="margin-bottom: 8px; padding: 6px; background: #f3f4f6; border-radius: 3px;">
            <strong>Precio mezclado (${weight}% menú):</strong> $${priceMixed ? priceMixed.toFixed(2) : "N/A"}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div style="padding: 6px; background: #fef3c7; border-radius: 3px;">
              <div style="font-weight: 600; color: #e67e22;">Google (${nGoogle})</div>
              <div>$${priceGoogle ? priceGoogle.toFixed(2) : "N/A"}</div>
            </div>
            <div style="padding: 6px; background: #dbeafe; border-radius: 3px;">
              <div style="font-weight: 600; color: #3498db;">Menú (${nMenu})</div>
              <div>$${priceMenu ? priceMenu.toFixed(2) : "N/A"}</div>
            </div>
          </div>
          ${topRestsMenu.length > 0 ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="font-weight: 600; margin-bottom: 4px; font-size: 11px;">Top 3 (menú):</div>
              <ul style="margin: 0; padding-left: 18px; font-size: 10px;">
                ${topRestsMenu.map(r => {
                  const [name, price] = r.split("|");
                  return `<li style="margin: 2px 0;">${name || "N/A"} (${price || "N/A"})</li>`;
                }).join("")}
              </ul>
            </div>
          ` : ""}
        </div>
      `;
      
      popup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
    });
    
    map.on("mouseleave", "pricing-fill", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  }

  /**
   * Initialize map on load
   */
  map.on("load", () => {
    // Ensure map size is correct
    map.resize();
    
    // Calculate mixed values
    const enrichedData = {
      ...data,
      features: data.features.map(f => ({
        ...f,
        properties: {
          ...f.properties,
          mixed_value: mixedValue(f.properties || {}, metric, weight)
        }
      }))
    };
    
    // Add source
    map.addSource("pricing-data", {
      type: "geojson",
      data: enrichedData
    });
    
    // Calculate color breaks
    const values = enrichedData.features.map(f => f.properties?.mixed_value).filter(v => v != null);
    const colorBreaks = calculateColorBreaks(values, scale, 5);
    const colorExpression = buildColorExpression(colorBreaks);
    
    // Add fill layer
    map.addLayer({
      id: "pricing-fill",
      type: "fill",
      source: "pricing-data",
      paint: {
        "fill-color": colorExpression,
        "fill-opacity": 0.7
      }
    });
    
    // Add outline layer
    map.addLayer({
      id: "pricing-outline",
      type: "line",
      source: "pricing-data",
      paint: {
        "line-color": "#374151",
        "line-width": 0.5,
        "line-opacity": 0.8
      }
    });
    
    // Create legend
    updateLegend(colorBreaks);
    
    // Setup popup
    setupPopup();
  });

  return map;
}

