/**
 * Safe JSON parsing utilities
 * Handles NaN, Infinity, and other non-standard JSON tokens
 */

/**
 * Sanitizes a JSON string by replacing non-standard tokens
 * @param {string} rawText - The raw JSON string
 * @returns {string} Sanitized JSON string
 */
export function sanitizeJsonString(rawText) {
	if (typeof rawText !== "string") return rawText;
	
	// Replace standalone NaN, Infinity, -Infinity with null
	return rawText
		.replace(/\bNaN\b/g, "null")
		.replace(/\bInfinity\b/g, "null")
		.replace(/\b-Infinity\b/g, "null");
}

/**
 * Safely parses JSON with error handling and sanitization
 * @param {string} rawText - The raw JSON string
 * @param {Object} options - Options for parsing
 * @param {boolean} options.sanitize - Whether to sanitize non-standard tokens (default: true)
 * @param {*} options.fallback - Fallback value on error (default: null)
 * @param {Function} options.onError - Error callback (default: console.warn)
 * @returns {*} Parsed object or fallback
 */
export function safeParseJson(rawText, options = {}) {
	const {
		sanitize = true,
		fallback = null,
		onError = (err) => console.warn("JSON parse error:", err.message)
	} = options;

	try {
		if (!rawText || typeof rawText !== "string") {
			throw new Error("Invalid input: expected non-empty string");
		}

		const textToParse = sanitize ? sanitizeJsonString(rawText) : rawText;
		return JSON.parse(textToParse);
	} catch (err) {
		if (onError) onError(err);
		return fallback;
	}
}

/**
 * Validates that a parsed object has expected structure
 * @param {*} obj - The object to validate
 * @param {Object} schema - Simple schema with required paths
 * @param {string[]} schema.required - Array of required dot-notation paths
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateJsonSchema(obj, schema = {}) {
	const { required = [] } = schema;
	const missing = [];

	for (const path of required) {
		const keys = path.split(".");
		let current = obj;
		let found = true;

		for (const key of keys) {
			if (!current || typeof current !== "object" || !(key in current)) {
				found = false;
				break;
			}
			current = current[key];
		}

		if (!found) missing.push(path);
	}

	return { valid: missing.length === 0, missing };
}

/**
 * Deep clone helper for JSON-serializable objects
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== "object") return obj;
	try {
		return JSON.parse(JSON.stringify(obj));
	} catch {
		return obj;
	}
}

