// Empty state note component for when no data is available
// Pure presentation component - returns DOM or null

import {html} from "npm:htl";

export function createEmptyStateNote(isEmpty) {
  if (!isEmpty) return null;

  return html`<div class="note" style="
  padding: 1.5rem;
  margin: 2rem 0;
  background: var(--theme-background-alt);
  border-left: 4px solid #fbbf24;
  border-radius: 4px;
  color: var(--theme-foreground-muted);
">
  ⚠️ <strong>Sin datos para los filtros actuales.</strong> Intenta ajustar la categoría o el umbral mínimo de restaurantes.
</div>`;
}

