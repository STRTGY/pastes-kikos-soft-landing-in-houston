import {html} from "npm:htl";
import {downloadJSON, downloadCSV} from "../core/exportUtils.js";

export function ExportPanel({exportData, csvContent}) {
  const handleJSONDownload = () => downloadJSON(exportData);
  const handleCSVDownload = () => downloadCSV(csvContent);
  
  return html`<div class="card">
    <h3>Exportar Análisis</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <button onclick=${handleJSONDownload} class="button">📥 Exportar JSON</button>
      <button onclick=${handleCSVDownload} class="button">📊 Exportar CSV</button>
    </div>
    <p style="font-size: 13px; color: var(--theme-foreground-muted); margin-top: 0.5rem;">
      Descarga el snapshot actual de parámetros y KPIs
    </p>
  </div>`;
}

