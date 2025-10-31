import {html} from "npm:htl";

export function Alert({type = "warning", title, message, fullWidth = true}) {
  const styles = {
    warning: {
      background: "#fef3c7",
      borderColor: "#f59e0b"
    },
    danger: {
      background: "#fee2e2",
      borderColor: "#ef4444"
    },
    success: {
      background: "#d1fae5",
      borderColor: "#10b981"
    },
    info: {
      background: "#dbeafe",
      borderColor: "#3b82f6"
    }
  };
  
  const style = styles[type] || styles.warning;
  const widthStyle = fullWidth ? "width: 100%; max-width: 100%;" : "";
  
  return html`<div class="note" style="${widthStyle} background: ${style.background}; border-left: 3px solid ${style.borderColor};">
    ${title ? html`<strong>${title}</strong> ` : ""}${message}
  </div>`;
}

