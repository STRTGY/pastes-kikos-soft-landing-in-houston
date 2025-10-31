// Filter Chips component - pure DOM, no JSX

export function createFilterChips({ filters, onRemove, onClearAll, i18n }) {
	const container = document.createElement("div");
	container.style.cssText = `
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 8px 16px;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		min-height: 44px;
		align-items: center;
	`;
	
	const chips = [];
	
	// Category chips
	if (filters.categories?.length) {
		filters.categories.forEach(cat => {
			chips.push({
				type: "category",
				value: cat,
				label: i18n?.categories?.[cat] || cat,
				color: "#f59e0b"
			});
		});
	}
	
	// Price chips
	if (filters.prices?.length) {
		filters.prices.forEach(price => {
			chips.push({
				type: "price",
				value: price,
				label: price,
				color: "#3b82f6"
			});
		});
	}
	
	// Rating chip
	if (filters.minRating != null) {
		chips.push({
			type: "rating",
			value: filters.minRating,
			label: `${i18n?.filters?.rating || "Rating"}: ${filters.minRating}+`,
			color: "#8b5cf6"
		});
	}
	
	// Reviews chip
	if (filters.minReviews != null) {
		chips.push({
			type: "reviews",
			value: filters.minReviews,
			label: `${i18n?.filters?.reviews || "Reviews"}: ${filters.minReviews}+`,
			color: "#10b981"
		});
	}
	
	// Drive-thru chip
	if (filters.driveThruOnly) {
		chips.push({
			type: "driveThru",
			value: true,
			label: i18n?.filters?.driveThru || "Drive-Thru",
			color: "#ef4444"
		});
	}
	
	// Open now chip
	if (filters.openNow) {
		chips.push({
			type: "openNow",
			value: true,
			label: i18n?.filters?.openNow || "Open Now",
			color: "#06b6d4"
		});
	}
	
	if (chips.length === 0) {
		const empty = document.createElement("span");
		empty.textContent = i18n?.filters?.noActiveFilters || "No active filters";
		empty.style.cssText = "font: 400 13px system-ui; color: #9ca3af; font-style: italic;";
		container.appendChild(empty);
		return container;
	}
	
	// Render chips
	chips.forEach(({ type, value, label, color }) => {
		const chip = document.createElement("div");
		chip.style.cssText = `
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 4px 8px 4px 10px;
			background: ${color}20;
			color: ${color};
			border: 1px solid ${color}40;
			border-radius: 16px;
			font: 500 12px system-ui;
			cursor: default;
			transition: all 0.15s;
		`;
		
		const labelEl = document.createElement("span");
		labelEl.textContent = label;
		chip.appendChild(labelEl);
		
		const removeBtn = document.createElement("button");
		removeBtn.textContent = "×";
		removeBtn.setAttribute("aria-label", `Remove ${label}`);
		removeBtn.style.cssText = `
			border: none;
			background: ${color}30;
			color: ${color};
			border-radius: 50%;
			width: 18px;
			height: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			font-size: 14px;
			font-weight: 700;
			padding: 0;
			transition: all 0.15s;
		`;
		
		removeBtn.addEventListener("click", () => onRemove(type, value));
		removeBtn.addEventListener("mouseenter", () => {
			removeBtn.style.background = color;
			removeBtn.style.color = "white";
		});
		removeBtn.addEventListener("mouseleave", () => {
			removeBtn.style.background = `${color}30`;
			removeBtn.style.color = color;
		});
		
		chip.appendChild(removeBtn);
		container.appendChild(chip);
	});
	
	// Clear all button
	if (chips.length > 1) {
		const clearBtn = document.createElement("button");
		clearBtn.textContent = i18n?.filters?.clearAll || "Clear All";
		clearBtn.setAttribute("aria-label", "Clear all filters");
		clearBtn.style.cssText = `
			padding: 4px 12px;
			background: white;
			border: 1px solid #d1d5db;
			border-radius: 16px;
			font: 600 12px system-ui;
			color: #6b7280;
			cursor: pointer;
			transition: all 0.15s;
			margin-left: 8px;
		`;
		
		clearBtn.addEventListener("click", onClearAll);
		clearBtn.addEventListener("mouseenter", () => {
			clearBtn.style.background = "#fee2e2";
			clearBtn.style.borderColor = "#ef4444";
			clearBtn.style.color = "#ef4444";
		});
		clearBtn.addEventListener("mouseleave", () => {
			clearBtn.style.background = "white";
			clearBtn.style.borderColor = "#d1d5db";
			clearBtn.style.color = "#6b7280";
		});
		
		container.appendChild(clearBtn);
	}
	
	return container;
}

