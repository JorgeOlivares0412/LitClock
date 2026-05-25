import { writable } from 'svelte/store';

/** @type {import('./settings.types').Settings} */
const defaults = {
	dateMode: 'auto',
	dateOverride: null,       // { day, month, year }

	timeMode: 'auto',
	timeOverride: null,       // { hour, minute }

	updateInterval: 1,        // 1 | 5 | 10 | 15 (minutes)
	displayExactTime: true,
	sfwOnly: false,
	theme: 'paper'            // 'paper' | 'quiet' | 'focus' | 'bold'
};

function loadSettings() {
	if (typeof localStorage === 'undefined') return defaults;
	try {
		const stored = localStorage.getItem('litclock_settings');
		return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
	} catch {
		return defaults;
	}
}

function createSettings() {
	const { subscribe, set, update } = writable(loadSettings());

	return {
		subscribe,
		update(newValues) {
			update(current => {
				const next = { ...current, ...newValues };
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('litclock_settings', JSON.stringify(next));
				}
				return next;
			});
		},
		reset() {
			set(defaults);
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem('litclock_settings');
			}
		}
	};
}

export const settings = createSettings();
