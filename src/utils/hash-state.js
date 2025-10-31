// URL hash state synchronization utility
// Manages tab, filters, and view state in URL hash

export function encodeStateToHash(state) {
	const params = new URLSearchParams();
	
	// Tab
	if (state.tab) params.set("tab", state.tab);
	
	// Filters
	if (state.categories?.length) params.set("cat", state.categories.join(","));
	if (state.prices?.length) params.set("price", state.prices.join(","));
	if (state.minRating) params.set("rating", state.minRating);
	if (state.minReviews) params.set("reviews", state.minReviews);
	if (state.driveThruOnly) params.set("dt", "1");
	if (state.openNow) params.set("open", "1");
	
	return params.toString();
}

export function decodeStateFromHash(hash) {
	const params = new URLSearchParams(hash.replace(/^#/, ""));
	return {
		tab: params.get("tab") || "overview",
		categories: params.get("cat")?.split(",").filter(Boolean) || [],
		prices: params.get("price")?.split(",").filter(Boolean) || [],
		minRating: params.get("rating") ? Number(params.get("rating")) : null,
		minReviews: params.get("reviews") ? Number(params.get("reviews")) : null,
		driveThruOnly: params.get("dt") === "1",
		openNow: params.get("open") === "1"
	};
}

export function syncHashToState(state, onStateChange) {
	const decoded = decodeStateFromHash(window.location.hash);
	Object.assign(state, decoded);
	if (onStateChange) onStateChange();
}

export function syncStateToHash(state) {
	const hash = encodeStateToHash(state);
	window.history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname);
}

export function watchHashChanges(onHashChange) {
	window.addEventListener("hashchange", onHashChange);
	return () => window.removeEventListener("hashchange", onHashChange);
}

