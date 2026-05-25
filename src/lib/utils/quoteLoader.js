import { base } from '$app/paths';
import { toFileKey } from './timeUtils.js';

/**
 * Builds the array of { hour, minute } objects covering the time window.
 * For exact mode (interval=1), returns just the current minute.
 * For approximate modes, returns current ± tolerance minutes.
 *
 * interval → tolerance:  1→0  5→2  10→5  15→7
 * @param {{ hour: number, minute: number }} time
 * @param {number} intervalMinutes
 * @returns {{ hour: number, minute: number }[]}
 */
function buildTimeWindow(time, intervalMinutes) {
	const toleranceMap = { 1: 0, 5: 2, 10: 5, 15: 7 };
	const tolerance = toleranceMap[intervalMinutes] ?? 0;

	const times = [];
	for (let offset = -tolerance; offset <= tolerance; offset++) {
		let totalMinutes = time.hour * 60 + time.minute + offset;
		// Wrap around midnight
		totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
		times.push({ hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 });
	}
	return times;
}

/**
 * Fetches a single quote file and returns its entries, or [] on failure.
 * @param {{ hour: number, minute: number }} time
 * @returns {Promise<object[]>}
 */
async function fetchQuoteFile(time) {
	const key = toFileKey(time);
	try {
		const res = await fetch(`${base}/data/quotes/${key}.json`);
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}

/**
 * Strips HTML tags from a string and normalises whitespace.
 * Handles <br/>, <br />, <br>, <p> etc. from raw dataset entries.
 * @param {string} str
 * @returns {string}
 */
function sanitizeText(str) {
	if (!str) return '';
	return str
		.replace(/<br\s*\/?>/gi, ' ')  // <br/> → space
		.replace(/<[^>]+>/g, '')        // strip any remaining tags
		.replace(/\s+/g, ' ');          // collapse multiple spaces
}

/**
 * Sanitizes the text fields of a raw quote entry.
 * @param {object} quote
 * @returns {object}
 */
function sanitizeQuote(quote) {
	return {
		...quote,
		quote_first:     sanitizeText(quote.quote_first),
		quote_time_case: sanitizeText(quote.quote_time_case),
		quote_last:      sanitizeText(quote.quote_last),
	};
}

/**
 * Loads a quote for the given time and settings.
 * Returns a quote object or null if none found.
 *
 * @param {{ hour: number, minute: number }} time
 * @param {{ updateInterval: number, sfwOnly: boolean }} settings
 * @returns {Promise<object|null>}
 */
export async function loadQuote(time, settings) {
	const window = buildTimeWindow(time, settings.updateInterval);

	// Fetch all files in the window in parallel
	const allEntries = (await Promise.all(window.map(fetchQuoteFile))).flat();

	// Apply SFW filter
	const pool = settings.sfwOnly
		? allEntries.filter(q => q.sfw === 'yes')
		: allEntries;

	if (pool.length === 0) return null;

	// Pick a random quote and sanitize before returning
	const raw = pool[Math.floor(Math.random() * pool.length)];
	return sanitizeQuote(raw);
}