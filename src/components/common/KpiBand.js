// KPI Band component - pure DOM, no JSX

export function createKpiBand({ kpis, i18n }) {
	const band = document.createElement("div");
	band.style.cssText = `
		display: flex;
		gap: 16px;
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		flex-wrap: wrap;
	`;
	band.setAttribute("role", "region");
	band.setAttribute("aria-label", "Key Performance Indicators");
	
	kpis.forEach(({ label, value, sublabel, color = "#2563eb" }) => {
		const kpi = document.createElement("div");
		kpi.style.cssText = `
			flex: 1;
			min-width: 150px;
			padding: 12px 16px;
			background: linear-gradient(135deg, ${color}08 0%, ${color}15 100%);
			border-left: 3px solid ${color};
			border-radius: 6px;
		`;
		
		const labelEl = document.createElement("div");
		labelEl.textContent = label;
		labelEl.style.cssText = "font: 500 12px system-ui; color: #6b7280; margin-bottom: 4px;";
		kpi.appendChild(labelEl);
		
		const valueEl = document.createElement("div");
		valueEl.textContent = value;
		valueEl.style.cssText = `font: 700 24px system-ui; color: ${color}; line-height: 1.2;`;
		kpi.appendChild(valueEl);
		
		if (sublabel) {
			const sublabelEl = document.createElement("div");
			sublabelEl.textContent = sublabel;
			sublabelEl.style.cssText = "font: 400 11px system-ui; color: #9ca3af; margin-top: 2px;";
			kpi.appendChild(sublabelEl);
		}
		
		band.appendChild(kpi);
	});
	
	return band;
}

export function updateKpi(bandElement, kpiIndex, { value, sublabel }) {
	const kpis = bandElement.querySelectorAll("div > div:nth-child(2)");
	if (kpis[kpiIndex]) {
		kpis[kpiIndex].textContent = value;
	}
	
	if (sublabel !== undefined) {
		const sublabels = bandElement.querySelectorAll("div > div:nth-child(3)");
		if (sublabels[kpiIndex]) {
			sublabels[kpiIndex].textContent = sublabel;
		}
	}
}

