// Restaurant List component for drawer - pure DOM, no JSX

export function createRestaurantList({ restaurants, sortBy = "rating", onSort, onExport, onSelect, i18n }) {
	const container = document.createElement("div");
	container.style.cssText = "display: flex; flex-direction: column; height: 100%;";
	
	// Header with sort and export
	const header = document.createElement("div");
	header.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; background: white; position: sticky; top: 0; z-index: 10;";
	
	const title = document.createElement("div");
	title.textContent = `${restaurants.length.toLocaleString()} ${i18n?.drawer?.restaurants || "restaurants"}`;
	title.style.cssText = "font: 600 14px system-ui; color: #111827;";
	header.appendChild(title);
	
	const controls = document.createElement("div");
	controls.style.cssText = "display: flex; gap: 8px;";
	
	// Sort dropdown
	const sortSelect = document.createElement("select");
	sortSelect.style.cssText = "padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font: 500 12px system-ui; cursor: pointer;";
	sortSelect.setAttribute("aria-label", "Sort by");
	
	[
		{ value: "rating", label: i18n?.drawer?.sortRating || "Rating" },
		{ value: "reviews", label: i18n?.drawer?.sortReviews || "Reviews" },
		{ value: "distance", label: i18n?.drawer?.sortDistance || "Distance" },
		{ value: "name", label: i18n?.drawer?.sortName || "Name" }
	].forEach(opt => {
		const option = document.createElement("option");
		option.value = opt.value;
		option.textContent = opt.label;
		if (opt.value === sortBy) option.selected = true;
		sortSelect.appendChild(option);
	});
	sortSelect.addEventListener("change", () => onSort(sortSelect.value));
	controls.appendChild(sortSelect);
	
	// Export button
	const exportBtn = document.createElement("button");
	exportBtn.textContent = "CSV";
	exportBtn.style.cssText = "padding: 4px 12px; border: 1px solid #2563eb; border-radius: 4px; background: #3b82f6; color: white; font: 600 12px system-ui; cursor: pointer;";
	exportBtn.setAttribute("aria-label", "Export to CSV");
	exportBtn.addEventListener("click", onExport);
	controls.appendChild(exportBtn);
	
	header.appendChild(controls);
	container.appendChild(header);
	
	// List container with virtualization placeholder
	const listContainer = document.createElement("div");
	listContainer.style.cssText = "flex: 1; overflow-y: auto; background: #f9fafb;";
	
	// Render items (simple version, no virtualization yet)
	restaurants.forEach((restaurant, idx) => {
		const item = document.createElement("div");
		item.style.cssText = `
			padding: 12px;
			background: white;
			border-bottom: 1px solid #e5e7eb;
			cursor: pointer;
			transition: background 0.15s;
		`;
		item.setAttribute("role", "button");
		item.setAttribute("tabindex", "0");
		
		const name = document.createElement("div");
		name.textContent = restaurant.name || restaurant.title || "Unnamed";
		name.style.cssText = "font: 600 14px system-ui; color: #111827; margin-bottom: 4px;";
		item.appendChild(name);
		
		const meta = document.createElement("div");
		meta.style.cssText = "font: 400 12px system-ui; color: #6b7280; display: flex; gap: 12px; flex-wrap: wrap;";
		
		if (restaurant.category) {
			const cat = document.createElement("span");
			cat.textContent = restaurant.category;
			meta.appendChild(cat);
		}
		
		if (restaurant.priceRange || restaurant.price) {
			const price = document.createElement("span");
			price.textContent = restaurant.priceRange || restaurant.price;
			price.style.color = "#10b981";
			meta.appendChild(price);
		}
		
		if (restaurant.ratingNumeric != null) {
			const rating = document.createElement("span");
			rating.textContent = `⭐ ${restaurant.ratingNumeric.toFixed(1)}`;
			rating.style.color = "#f59e0b";
			meta.appendChild(rating);
		}
		
		if (restaurant.reviewCount != null) {
			const reviews = document.createElement("span");
			reviews.textContent = `(${restaurant.reviewCount} ${i18n?.drawer?.reviews || "reviews"})`;
			meta.appendChild(reviews);
		}
		
		item.appendChild(meta);
		
		// Click handler
		item.addEventListener("click", () => onSelect(restaurant, idx));
		item.addEventListener("mouseenter", () => {
			item.style.background = "#eff6ff";
		});
		item.addEventListener("mouseleave", () => {
			item.style.background = "white";
		});
		
		listContainer.appendChild(item);
	});
	
	container.appendChild(listContainer);
	
	return container;
}

export function createDrawer({ restaurants, sortBy, onClose, onSort, onExport, onSelect, i18n }) {
	const overlay = document.createElement("div");
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.3);
		z-index: 9998;
		animation: fadeIn 0.2s;
	`;
	overlay.addEventListener("click", onClose);
	
	const drawer = document.createElement("div");
	drawer.style.cssText = `
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 400px;
		max-width: 90vw;
		background: white;
		box-shadow: -2px 0 8px rgba(0,0,0,0.15);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		animation: slideInRight 0.3s;
	`;
	drawer.addEventListener("click", (e) => e.stopPropagation());
	
	// Header
	const header = document.createElement("div");
	header.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;";
	
	const title = document.createElement("h3");
	title.textContent = i18n?.drawer?.title || "Restaurant List";
	title.style.cssText = "font: 700 18px system-ui; color: #111827; margin: 0;";
	header.appendChild(title);
	
	const closeBtn = document.createElement("button");
	closeBtn.textContent = "✕";
	closeBtn.style.cssText = "border: none; background: transparent; font-size: 24px; cursor: pointer; color: #6b7280; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;";
	closeBtn.setAttribute("aria-label", "Close");
	closeBtn.addEventListener("click", onClose);
	closeBtn.addEventListener("mouseenter", () => {
		closeBtn.style.background = "#e5e7eb";
	});
	closeBtn.addEventListener("mouseleave", () => {
		closeBtn.style.background = "transparent";
	});
	header.appendChild(closeBtn);
	
	drawer.appendChild(header);
	
	// List
	const list = createRestaurantList({
		restaurants,
		sortBy,
		onSort,
		onExport,
		onSelect,
		i18n
	});
	drawer.appendChild(list);
	
	// Add CSS animations
	const style = document.createElement("style");
	style.textContent = `
		@keyframes fadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}
		@keyframes slideInRight {
			from { transform: translateX(100%); }
			to { transform: translateX(0); }
		}
	`;
	document.head.appendChild(style);
	
	// Mount
	const container = document.createElement("div");
	container.appendChild(overlay);
	container.appendChild(drawer);
	
	return container;
}

