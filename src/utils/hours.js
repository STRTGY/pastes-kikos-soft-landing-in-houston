/**
 * Hours and time utilities for restaurant data
 */

/**
 * Day name to index mapping
 */
const DAY_INDEX = {
	sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
	thursday: 4, friday: 5, saturday: 6,
	sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
	dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6
};

/**
 * Checks if a restaurant is currently open based on hours data
 * @param {Object|Array} hours - Hours data (object with day keys or 168-length array)
 * @param {Date} [now] - Current time (defaults to now)
 * @returns {boolean|null} true if open, false if closed, null if unknown
 */
export function isOpenNow(hours, now = new Date()) {
	if (!hours) return null;

	try {
		const day = now.getDay(); // 0=Sunday, 6=Saturday
		const hour = now.getHours();

		// Case 1: Array of 168 values (7 days × 24 hours)
		if (Array.isArray(hours) && hours.length === 168) {
			const index = day * 24 + hour;
			const value = hours[index];
			return typeof value === "number" ? value > 0 : null;
		}

		// Case 2: Object with day names as keys
		if (typeof hours === "object" && !Array.isArray(hours)) {
			// Try multiple day name formats
			const dayNames = Object.keys(DAY_INDEX).filter(k => DAY_INDEX[k] === day);
			
			for (const dayName of dayNames) {
				const dayHours = hours[dayName];
				if (Array.isArray(dayHours) && dayHours.length >= hour + 1) {
					const value = dayHours[hour];
					return typeof value === "number" ? value > 0 : null;
				}
			}
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Parses hours data into a standardized 168-length array
 * @param {Object|Array} hours - Raw hours data
 * @returns {number[]|null} 168-length array or null if invalid
 */
export function normalizeHours(hours) {
	if (!hours) return null;

	try {
		// Already normalized
		if (Array.isArray(hours) && hours.length === 168) {
			return hours.map(v => Number(v) || 0);
		}

		// Object format: convert to 168-array
		if (typeof hours === "object" && !Array.isArray(hours)) {
			const result = new Array(168).fill(0);
			
			for (const [dayName, dayHours] of Object.entries(hours)) {
				const dayNameLower = dayName.toLowerCase();
				const dayIndex = DAY_INDEX[dayNameLower];
				
				if (dayIndex !== undefined && Array.isArray(dayHours)) {
					for (let h = 0; h < Math.min(24, dayHours.length); h++) {
						result[dayIndex * 24 + h] = Number(dayHours[h]) || 0;
					}
				}
			}
			
			return result;
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Finds peak hours from normalized hours data
 * @param {number[]} hours168 - 168-length array of occupancy/open values
 * @returns {{ day: number, hour: number, value: number }|null}
 */
export function findPeakHour(hours168) {
	if (!Array.isArray(hours168) || hours168.length !== 168) return null;

	let maxValue = -Infinity;
	let maxIndex = -1;

	for (let i = 0; i < hours168.length; i++) {
		const value = Number(hours168[i]) || 0;
		if (value > maxValue) {
			maxValue = value;
			maxIndex = i;
		}
	}

	if (maxIndex === -1) return null;

	return {
		day: Math.floor(maxIndex / 24),
		hour: maxIndex % 24,
		value: maxValue
	};
}

/**
 * Aggregates hours data across multiple restaurants
 * @param {Array} restaurants - Array of restaurant objects with hours property
 * @param {Function} [accessor] - Function to extract hours from restaurant object
 * @returns {number[]} 168-length aggregated array
 */
export function aggregateHours(restaurants, accessor = (r) => r.hours || r.occ) {
	const result = new Array(168).fill(0);

	for (const restaurant of restaurants || []) {
		const hours = accessor(restaurant);
		const normalized = normalizeHours(hours);
		
		if (normalized) {
			for (let i = 0; i < 168; i++) {
				result[i] += normalized[i];
			}
		}
	}

	return result;
}

