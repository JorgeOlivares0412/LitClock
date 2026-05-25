/**
 * Returns { hour, minute } for the current effective time.
 * Respects manual override from settings if set.
 * @param {import('../stores/settings.types').Settings} settings
 * @returns {{ hour: number, minute: number }}
 */
export function getCurrentTime(settings) {
	if (settings.timeMode === 'manual' && settings.timeOverride) {
		const { hour, minute, setAt } = settings.timeOverride;
		if (setAt) {
			// Tick forward from the moment the override was set
			const elapsedMinutes = Math.floor((Date.now() - setAt) / 60000);
			const total = ((hour * 60 + minute + elapsedMinutes) % 1440 + 1440) % 1440;
			return { hour: Math.floor(total / 60), minute: total % 60 };
		}
		return { hour, minute }; // legacy: no setAt → frozen
	}
	const now = new Date();
	return { hour: now.getHours(), minute: now.getMinutes() };
}

/**
 * Returns { day, month, year } for the current effective date.
 * @param {import('../stores/settings.types').Settings} settings
 * @returns {{ day: number, month: number, year: number }}
 */
export function getCurrentDate(settings) {
	if (settings.dateMode === 'manual' && settings.dateOverride) {
		const { day, month, year } = settings.dateOverride;

		// When time is also manually set, couple date to the time offset so
		// midnight crossings naturally advance the date.
		if (settings.timeMode === 'manual' && settings.timeOverride?.setAt) {
			const { hour, minute, setAt } = settings.timeOverride;
			const elapsedMinutes = Math.floor((Date.now() - setAt) / 60000);
			const dayOffset = Math.floor((hour * 60 + minute + elapsedMinutes) / 1440);
			const d = new Date(year, month - 1, day + dayOffset);
			return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
		}

		// Date-only override: advance by whole elapsed days from setAt
		if (settings.dateOverride.setAt) {
			const elapsedDays = Math.floor((Date.now() - settings.dateOverride.setAt) / 86400000);
			const d = new Date(year, month - 1, day + elapsedDays);
			return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
		}

		return { day, month, year }; // legacy: no setAt → frozen
	}
	const now = new Date();
	return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * Formats { day, month, year } as "DD Month YYYY" e.g. "16 May 2025"
 * @param {{ day: number, month: number, year: number }} date
 * @returns {string}
 */
export function formatDate({ day, month, year }) {
	const months = [
		'January','February','March','April','May','June',
		'July','August','September','October','November','December'
	];
	return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Formats { hour, minute } as 12-hour clock string e.g. "12:56 am"
 * @param {{ hour: number, minute: number }} time
 * @returns {string}
 */
export function formatTime({ hour, minute }) {
	const period = hour >= 12 ? 'pm' : 'am';
	const h = hour % 12 || 12;
	const m = String(minute).padStart(2, '0');
	return `${h}:${m} ${period}`;
}

/**
 * Converts { hour, minute } to a JSON file key: "HH_MM"
 * @param {{ hour: number, minute: number }} time
 * @returns {string}
 */
export function toFileKey({ hour, minute }) {
	return `${String(hour).padStart(2, '0')}_${String(minute).padStart(2, '0')}`;
}

/**
 * Returns the next Date tick time based on updateInterval.
 * Aligns to the next clean interval boundary.
 * @param {number} intervalMinutes
 * @returns {number} milliseconds until next tick
 */
export function msUntilNextTick(intervalMinutes) {
	const now = new Date();
	const ms = now.getTime();
	const intervalMs = intervalMinutes * 60 * 1000;
	const nextTick = Math.ceil(ms / intervalMs) * intervalMs;
	// Add a small buffer so we're safely past the minute boundary
	return (nextTick - ms) + 500;
}
