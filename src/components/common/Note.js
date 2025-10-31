import {html} from "npm:htl";

export function Note({children, style = {}}) {
  const inlineStyle = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
  
  return html`<div class="note" style="${inlineStyle}">
    ${children}
  </div>`;
}

