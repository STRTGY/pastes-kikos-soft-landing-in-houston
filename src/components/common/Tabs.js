// Tabs component - pure DOM, no JSX

export function createTabs({ tabs, activeTab, onChange, i18n }) {
	const container = document.createElement("div");
	container.style.cssText = "display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; padding: 0 16px; background: white;";
	container.setAttribute("role", "tablist");
	
	tabs.forEach(({ id, label, icon }) => {
		const tab = document.createElement("button");
		tab.setAttribute("role", "tab");
		tab.setAttribute("aria-selected", id === activeTab ? "true" : "false");
		tab.setAttribute("aria-controls", `panel-${id}`);
		tab.id = `tab-${id}`;
		
		const isActive = id === activeTab;
		tab.style.cssText = `
			padding: 12px 20px;
			border: none;
			background: ${isActive ? "white" : "transparent"};
			color: ${isActive ? "#2563eb" : "#6b7280"};
			font: 600 14px system-ui;
			cursor: pointer;
			border-bottom: 3px solid ${isActive ? "#2563eb" : "transparent"};
			transition: all 0.15s;
			position: relative;
			top: 2px;
		`;
		
		if (icon) {
			const iconEl = document.createElement("span");
			iconEl.textContent = icon;
			iconEl.style.marginRight = "6px";
			tab.appendChild(iconEl);
		}
		
		tab.appendChild(document.createTextNode(label));
		
		tab.addEventListener("click", () => onChange(id));
		tab.addEventListener("mouseenter", () => {
			if (id !== activeTab) {
				tab.style.color = "#374151";
				tab.style.background = "#f9fafb";
			}
		});
		tab.addEventListener("mouseleave", () => {
			if (id !== activeTab) {
				tab.style.color = "#6b7280";
				tab.style.background = "transparent";
			}
		});
		
		container.appendChild(tab);
	});
	
	return container;
}

export function createTabPanel({ id, activeTab, children }) {
	const panel = document.createElement("div");
	panel.id = `panel-${id}`;
	panel.setAttribute("role", "tabpanel");
	panel.setAttribute("aria-labelledby", `tab-${id}`);
	panel.style.display = id === activeTab ? "block" : "none";
	
	if (Array.isArray(children)) {
		children.forEach(child => panel.appendChild(child));
	} else if (children) {
		panel.appendChild(children);
	}
	
	return panel;
}

