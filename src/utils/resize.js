// ResizeObserver helper for responsive Plot charts

export function observeResize(element, callback) {
	if (!element || typeof ResizeObserver === "undefined") {
		console.warn("ResizeObserver not available or element missing");
		return () => {};
	}
	
	const observer = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const { width, height } = entry.contentRect;
			callback(width, height);
		}
	});
	
	observer.observe(element);
	
	// Return cleanup function
	return () => observer.disconnect();
}

export function debounceResize(callback, wait = 150) {
	let timeout;
	return function debouncedResize(width, height) {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(width, height), wait);
	};
}

