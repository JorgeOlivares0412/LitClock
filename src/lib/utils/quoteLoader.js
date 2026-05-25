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
 * Also converts Unicode mathematical alphanumeric symbols to regular ASCII.
 * @param {string} str
 * @returns {string}
 */
function sanitizeText(str) {
	if (!str) return '';

	let result = str
		.replace(/<br\s*\/?>/gi, '\n')  // <br/> → real newline, preserved for rendering
		.replace(/<[^>]+>/g, '');      // strip any remaining tags

	// Convert mathematical alphanumeric symbols (U+1D400–U+1D7FF range)
	// These include bold, italic, bold-italic, and other variants of Latin letters
	result = Array.from(result)
		.map(char => {
			const codePoint = char.codePointAt(0);
			// Mathematical Alphanumeric Symbols block spans 0x1D400–0x1D7FF
			if (codePoint >= 0x1D400 && codePoint <= 0x1D7FF) {
				// Each mathematical alphabet has 52 letters (26 uppercase + 26 lowercase)
				// Calculate which alphabet and position within that alphabet
				const offset = codePoint - 0x1D400;
				const position = offset % 52;

				if (position < 26) {
					// Uppercase A-Z
					return String.fromCharCode(65 + position);
				} else {
					// Lowercase a-z
					return String.fromCharCode(97 + (position - 26));
				}
			}
			return char;
		})
		.join('');

	return result
		.replace(/[^\S\n]+/g, ' ')   // collapse spaces/tabs but NOT newlines
		.replace(/\n{3,}/g, '\n\n'); // cap at two consecutive line breaks
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