/**
 * Lightweight telemetry utilities for tracking usage and performance
 */

const TELEMETRY_ENABLED = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
const events = [];

/**
 * Records a telemetry event
 * @param {string} category - Event category (e.g., "dashboard", "filter")
 * @param {string} action - Action name (e.g., "load", "filter_change")
 * @param {Object} metadata - Additional metadata
 */
export function trackEvent(category, action, metadata = {}) {
	if (!TELEMETRY_ENABLED) return;
	
	const event = {
		timestamp: Date.now(),
		category,
		action,
		...metadata
	};
	
	events.push(event);
	
	// Log to console in development
	if (typeof console !== "undefined" && console.debug) {
		console.debug(`[Telemetry] ${category}.${action}`, metadata);
	}
	
	// Could send to analytics service here
	// Example: sendToAnalytics(event);
}

/**
 * Tracks performance metrics
 * @param {string} name - Metric name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export function trackPerformance(name, duration, metadata = {}) {
	trackEvent("performance", name, {
		duration,
		...metadata
	});
}

/**
 * Creates a performance timer
 * @param {string} name - Timer name
 * @returns {{ end: Function }} Timer object with end method
 */
export function startTimer(name) {
	const startTime = performance.now();
	
	return {
		end: (metadata = {}) => {
			const duration = performance.now() - startTime;
			trackPerformance(name, duration, metadata);
			return duration;
		}
	};
}

/**
 * Tracks component render
 * @param {string} componentName - Component name
 * @param {Object} metadata - Additional metadata
 */
export function trackRender(componentName, metadata = {}) {
	trackEvent("render", componentName, metadata);
}

/**
 * Tracks user interaction
 * @param {string} interactionType - Type of interaction (e.g., "click", "hover")
 * @param {string} target - Target element or action
 * @param {Object} metadata - Additional metadata
 */
export function trackInteraction(interactionType, target, metadata = {}) {
	trackEvent("interaction", target, {
		type: interactionType,
		...metadata
	});
}

/**
 * Tracks errors
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
export function trackError(error, context = {}) {
	trackEvent("error", "exception", {
		message: error.message,
		stack: error.stack?.split("\n").slice(0, 3).join("\n"),
		...context
	});
}

/**
 * Gets all recorded events
 * @returns {Array} Array of events
 */
export function getEvents() {
	return [...events];
}

/**
 * Clears all recorded events
 */
export function clearEvents() {
	events.length = 0;
}

/**
 * Gets summary statistics
 * @returns {Object} Summary stats
 */
export function getStats() {
	const byCategory = {};
	const byAction = {};
	
	for (const event of events) {
		byCategory[event.category] = (byCategory[event.category] || 0) + 1;
		byAction[event.action] = (byAction[event.action] || 0) + 1;
	}
	
	return {
		total: events.length,
		byCategory,
		byAction,
		startTime: events[0]?.timestamp,
		endTime: events[events.length - 1]?.timestamp
	};
}

/**
 * Exports events as JSON
 * @returns {string} JSON string
 */
export function exportEvents() {
	return JSON.stringify({
		events,
		stats: getStats(),
		exportedAt: Date.now()
	}, null, 2);
}

// Expose debug utilities in development
if (typeof window !== "undefined" && window.location.hostname.includes("localhost")) {
	window.__telemetry = {
		getEvents,
		clearEvents,
		getStats,
		exportEvents
	};
}

