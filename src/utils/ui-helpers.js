/**
 * UI helper utilities for loading states, skeletons, and error handling
 */

/**
 * Creates a skeleton/loading placeholder element
 * @param {Object} options - Options for the skeleton
 * @param {number} options.width - Width in pixels or "100%"
 * @param {number} options.height - Height in pixels
 * @param {string} options.borderRadius - Border radius
 * @returns {HTMLElement} Skeleton element
 */
export function createSkeleton({ width = "100%", height = 200, borderRadius = "8px" } = {}) {
	const skeleton = document.createElement("div");
	skeleton.className = "skeleton-loader";
	skeleton.style.cssText = `
		width: ${typeof width === "number" ? `${width}px` : width};
		height: ${height}px;
		background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
		background-size: 200% 100%;
		animation: skeleton-shimmer 1.5s ease-in-out infinite;
		border-radius: ${borderRadius};
	`;
	
	return skeleton;
}

/**
 * Creates an empty state message
 * @param {Object} options - Options for empty state
 * @param {string} options.title - Title text
 * @param {string} options.message - Message text
 * @param {string} options.actionText - Optional action button text
 * @param {Function} options.onAction - Optional action callback
 * @returns {HTMLElement} Empty state element
 */
export function createEmptyState({ 
	title = "No Data", 
	message = "No data available for the current selection.", 
	actionText = null,
	onAction = null 
} = {}) {
	const container = document.createElement("div");
	container.style.cssText = `
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		color: #6b7280;
		min-height: 200px;
	`;
	
	const titleEl = document.createElement("h3");
	titleEl.textContent = title;
	titleEl.style.cssText = `
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	`;
	container.appendChild(titleEl);
	
	const messageEl = document.createElement("p");
	messageEl.textContent = message;
	messageEl.style.cssText = `
		margin: 0 0 16px 0;
		font-size: 14px;
		max-width: 400px;
		line-height: 1.5;
	`;
	container.appendChild(messageEl);
	
	if (actionText && onAction) {
		const actionBtn = document.createElement("button");
		actionBtn.textContent = actionText;
		actionBtn.style.cssText = `
			padding: 8px 16px;
			border: 1px solid #d1d5db;
			border-radius: 6px;
			background: white;
			color: #374151;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.2s;
		`;
		actionBtn.addEventListener("click", onAction);
		actionBtn.addEventListener("mouseenter", () => {
			actionBtn.style.background = "#f9fafb";
		});
		actionBtn.addEventListener("mouseleave", () => {
			actionBtn.style.background = "white";
		});
		container.appendChild(actionBtn);
	}
	
	return container;
}

/**
 * Creates an error state message
 * @param {Object} options - Options for error state
 * @param {string} options.title - Error title
 * @param {string} options.message - Error message
 * @param {Error} options.error - Optional error object for details
 * @param {boolean} options.showDetails - Whether to show error details
 * @returns {HTMLElement} Error state element
 */
export function createErrorState({ 
	title = "Error", 
	message = "An error occurred while loading data.", 
	error = null,
	showDetails = false 
} = {}) {
	const container = document.createElement("div");
	container.style.cssText = `
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		color: #dc2626;
		min-height: 200px;
		background: #fef2f2;
		border-radius: 8px;
		border: 1px solid #fecaca;
	`;
	
	const iconEl = document.createElement("div");
	iconEl.textContent = "⚠️";
	iconEl.style.cssText = `
		font-size: 32px;
		margin-bottom: 12px;
	`;
	container.appendChild(iconEl);
	
	const titleEl = document.createElement("h3");
	titleEl.textContent = title;
	titleEl.style.cssText = `
		margin: 0 0 8px 0;
		font-size: 18px;
		font-weight: 600;
		color: #991b1b;
	`;
	container.appendChild(titleEl);
	
	const messageEl = document.createElement("p");
	messageEl.textContent = message;
	messageEl.style.cssText = `
		margin: 0;
		font-size: 14px;
		max-width: 400px;
		line-height: 1.5;
		color: #991b1b;
	`;
	container.appendChild(messageEl);
	
	if (showDetails && error) {
		const detailsEl = document.createElement("details");
		detailsEl.style.cssText = `
			margin-top: 16px;
			font-size: 12px;
			text-align: left;
			max-width: 500px;
		`;
		
		const summaryEl = document.createElement("summary");
		summaryEl.textContent = "Show technical details";
		summaryEl.style.cssText = `
			cursor: pointer;
			color: #7f1d1d;
			font-weight: 500;
		`;
		detailsEl.appendChild(summaryEl);
		
		const codeEl = document.createElement("pre");
		codeEl.textContent = error.stack || error.message || String(error);
		codeEl.style.cssText = `
			margin-top: 8px;
			padding: 12px;
			background: white;
			border: 1px solid #fecaca;
			border-radius: 4px;
			overflow: auto;
			max-height: 200px;
			font-size: 11px;
			color: #7f1d1d;
		`;
		detailsEl.appendChild(codeEl);
		
		container.appendChild(detailsEl);
	}
	
	return container;
}

/**
 * Creates a loading spinner
 * @param {Object} options - Options for spinner
 * @param {number} options.size - Size in pixels
 * @param {string} options.color - Color
 * @returns {HTMLElement} Spinner element
 */
export function createLoadingSpinner({ size = 32, color = "#3b82f6" } = {}) {
	const spinner = document.createElement("div");
	spinner.style.cssText = `
		width: ${size}px;
		height: ${size}px;
		border: 3px solid #f3f4f6;
		border-top-color: ${color};
		border-radius: 50%;
		animation: spinner-rotate 0.8s linear infinite;
	`;
	
	return spinner;
}

/**
 * Wraps content with a loading state
 * @param {HTMLElement} container - Container element
 * @param {Promise} promise - Promise to wait for
 * @param {Object} options - Options
 * @returns {Promise} The original promise
 */
export async function withLoadingState(container, promise, options = {}) {
	const { showSkeleton = true, skeletonHeight = 200 } = options;
	
	const placeholder = showSkeleton 
		? createSkeleton({ height: skeletonHeight })
		: createLoadingSpinner();
	
	const wrapper = document.createElement("div");
	wrapper.style.cssText = "display: flex; justify-content: center; align-items: center; min-height: 200px;";
	wrapper.appendChild(placeholder);
	
	container.replaceChildren(wrapper);
	
	try {
		const result = await promise;
		return result;
	} catch (error) {
		container.replaceChildren(createErrorState({
			title: "Loading Failed",
			message: "Failed to load data. Please try again.",
			error,
			showDetails: true
		}));
		throw error;
	}
}

/**
 * Injects required CSS animations
 */
export function injectSkeletonStyles() {
	if (document.getElementById("skeleton-styles")) return;
	
	const style = document.createElement("style");
	style.id = "skeleton-styles";
	style.textContent = `
		@keyframes skeleton-shimmer {
			0% { background-position: -200% 0; }
			100% { background-position: 200% 0; }
		}
		
		@keyframes spinner-rotate {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	`;
	
	document.head.appendChild(style);
}

// Auto-inject styles
if (typeof document !== "undefined") {
	injectSkeletonStyles();
}

