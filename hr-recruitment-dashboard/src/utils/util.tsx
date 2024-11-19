/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// Array of full names of weekdays
export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Array of short names of weekdays
export const DAYS_OF_WEEK_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/**
 * Function to get keys from a map by a specific value.
 * @param map - The map to search through.
 * @param value - The value to search for.
 * @returns An array of keys that have the specified value.
 */
export function getKeysByValue<K, V>(map: Map<K, V>, value: V): K[] {
	const keys: K[] = [];

	// Iterate through the map entries
	for (const [key, val] of map.entries()) {
		// If the value matches, add the key to the keys array
		if (val === value) {
			keys.push(key);
		}
	}

	// Return the array of keys
	return keys;
}
