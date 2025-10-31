import {html} from "npm:htl";

export function KpiCard({title, value, suffix = "", explanation = ""}) {
  const formatted = typeof value === "number" 
    ? value.toLocaleString("es-MX", {maximumFractionDigits: 2}) 
    : value;
  
  return html`<div class="card">
    <h2>${title} ${explanation ? html`<span class="tooltip" title="${explanation}">ℹ️</span>` : ""}</h2>
    <span class="big">${formatted}${suffix ? ` ${suffix}` : ""}</span>
  </div>`;
}

