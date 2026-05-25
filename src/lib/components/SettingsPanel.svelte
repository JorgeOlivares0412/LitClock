<script>
	import { settings } from '$lib/stores/settings.js';

	/** @type {{ onClose: () => void }} */
	let { onClose } = $props();

	// Seed manual fields with current override, or live current values as defaults
	const seedDate = () => {
		if ($settings.dateOverride) return { ...$settings.dateOverride };
		const n = new Date();
		return { day: n.getDate(), month: n.getMonth() + 1, year: n.getFullYear() };
	};
	const seedTime = () => {
		if ($settings.timeOverride) return { ...$settings.timeOverride };
		const n = new Date();
		return { hour: n.getHours(), minute: n.getMinutes() };
	};

	let manualDate = $state(seedDate());
	let manualTime = $state(seedTime());

	// ── Setters ────────────────────────────────────────────────────
	function setDateMode(mode) {
		if (mode === 'auto') {
			settings.update({ dateMode: 'auto', dateOverride: null });
		} else {
			settings.update({ dateMode: 'manual', dateOverride: { ...manualDate } });
		}
	}

	function setTimeMode(mode) {
		if (mode === 'auto') {
			settings.update({ timeMode: 'auto', timeOverride: null });
		} else {
			settings.update({ timeMode: 'manual', timeOverride: { ...manualTime } });
		}
	}

	function onDateField(field, raw) {
		const val = parseInt(raw, 10);
		if (isNaN(val)) return;
		const limits = { day: [1, 31], month: [1, 12], year: [2000, 2100] };
		const [min, max] = limits[field];
		manualDate = { ...manualDate, [field]: Math.min(max, Math.max(min, val)) };
		settings.update({ dateMode: 'manual', dateOverride: { ...manualDate } });
	}

	function onTimeField(field, raw) {
		const val = parseInt(raw, 10);
		if (isNaN(val)) return;
		const max = field === 'hour' ? 23 : 59;
		manualTime = { ...manualTime, [field]: Math.min(max, Math.max(0, val)) };
		settings.update({ timeMode: 'manual', timeOverride: { ...manualTime } });
	}

	function padTwo(n) {
		return String(n).padStart(2, '0');
	}

	// Activate manual mode when user clicks directly into a field
	function activateDateManual() {
		if ($settings.dateMode !== 'manual') setDateMode('manual');
	}
	function activateTimeManual() {
		if ($settings.timeMode !== 'manual') setTimeMode('manual');
	}
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Settings">
	<p class="heading">Settings</p>

	<div class="rows">

		<!-- Date -->
		<div class="row">
			<span class="label">Date</span>
			<div class="options">
				<button
					class="opt"
					class:selected={$settings.dateMode === 'auto'}
					onclick={() => setDateMode('auto')}
				>Auto</button>

				<!-- Manual date fields — always visible, active when manual mode on -->
				<span
					class="field-group"
					class:active={$settings.dateMode === 'manual'}
					role="button"
					tabindex="0"
					onclick={activateDateManual}
					onkeydown={(e) => e.key === 'Enter' && activateDateManual()}
				>
					<input
						class="field"
						type="number"
						min="1" max="31"
						value={manualDate.day}
						placeholder="DD"
						aria-label="Day"
						onfocus={activateDateManual}
						onchange={(e) => onDateField('day', e.currentTarget.value)}
					/>
					<input
						class="field"
						type="number"
						min="1" max="12"
						value={manualDate.month}
						placeholder="MM"
						aria-label="Month"
						onfocus={activateDateManual}
						onchange={(e) => onDateField('month', e.currentTarget.value)}
					/>
					<input
						class="field year"
						type="number"
						min="2000" max="2100"
						value={manualDate.year}
						placeholder="YYYY"
						aria-label="Year"
						onfocus={activateDateManual}
						onchange={(e) => onDateField('year', e.currentTarget.value)}
					/>
				</span>
			</div>
		</div>

		<!-- Time -->
		<div class="row">
			<span class="label">Time</span>
			<div class="options">
				<button
					class="opt"
					class:selected={$settings.timeMode === 'auto'}
					onclick={() => setTimeMode('auto')}
				>Auto</button>

				<span
					class="field-group"
					class:active={$settings.timeMode === 'manual'}
					role="button"
					tabindex="0"
					onclick={activateTimeManual}
					onkeydown={(e) => e.key === 'Enter' && activateTimeManual()}
				>
					<input
						class="field"
						type="number"
						min="0" max="23"
						value={padTwo(manualTime.hour)}
						placeholder="HH"
						aria-label="Hour"
						onfocus={activateTimeManual}
						onchange={(e) => onTimeField('hour', e.currentTarget.value)}
					/>
					<input
						class="field"
						type="number"
						min="0" max="59"
						value={padTwo(manualTime.minute)}
						placeholder="MM"
						aria-label="Minute"
						onfocus={activateTimeManual}
						onchange={(e) => onTimeField('minute', e.currentTarget.value)}
					/>
				</span>
			</div>
		</div>

		<!-- Update Time -->
		<div class="row">
			<span class="label">Update Time</span>
			<div class="options">
				{#each [1, 5, 10, 15] as interval}
					<button
						class="opt"
						class:selected={$settings.updateInterval === interval}
						onclick={() => settings.update({ updateInterval: interval })}
					>{interval}m</button>
				{/each}
			</div>
		</div>

		<!-- Display Exact Time -->
		<div class="row">
			<span class="label">Display Exact Time</span>
			<div class="options">
				<button
					class="opt"
					class:selected={$settings.displayExactTime === true}
					onclick={() => settings.update({ displayExactTime: true })}
				>Yes</button>
				<button
					class="opt"
					class:selected={$settings.displayExactTime === false}
					onclick={() => settings.update({ displayExactTime: false })}
				>No</button>
			</div>
		</div>

		<!-- SFW Only -->
		<div class="row">
			<span class="label">SFW Only</span>
			<div class="options">
				<button
					class="opt"
					class:selected={$settings.sfwOnly === true}
					onclick={() => settings.update({ sfwOnly: true })}
				>Yes</button>
				<button
					class="opt"
					class:selected={$settings.sfwOnly === false}
					onclick={() => settings.update({ sfwOnly: false })}
				>No</button>
			</div>
		</div>

		<!-- Theme -->
		<div class="row">
			<span class="label">Theme</span>
			<div class="options">
				{#each ['paper', 'quiet', 'focus', 'bold'] as theme}
					<button
						class="opt"
						class:selected={$settings.theme === theme}
						onclick={() => settings.update({ theme })}
					>{theme.charAt(0).toUpperCase() + theme.slice(1)}</button>
				{/each}
			</div>
		</div>

	</div>

	<button class="done" onclick={onClose}>Done</button>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: var(--bg);
		z-index: 100;
		display: flex;
		flex-direction: column;
		padding: 1.5rem 1.5rem 2.5rem;
		overflow-y: auto;
	}

	.heading {
		font-family: var(--font-serif);
		font-size: var(--date-size);
		color: var(--text-muted);
		letter-spacing: 0.03em;
		font-weight: 400;
		text-align: center;
		padding: 0.5rem 0 2rem;
	}

	.rows {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 0;
		gap: 1rem;
	}

	.label {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		color: var(--text-primary);
		font-weight: 400;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.options {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	/* Option buttons — look like plain text, bold when selected */
	.opt {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		font-weight: 400;
		color: var(--text-primary);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: opacity 0.1s;
	}
	.opt:hover { opacity: 0.6; }
	.opt.selected { font-weight: 600; }

	/* Manual field group — muted when inactive, full color when active */
	.field-group {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		opacity: 0.35;
		transition: opacity 0.15s;
	}
	.field-group.active { opacity: 1; }
	.field-group:focus { outline: none; }

	/* Number inputs that look like text */
	.field {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		color: var(--text-primary);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border);
		width: 2.4ch;
		text-align: center;
		padding: 0 0.1rem 0.1rem;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.field::-webkit-outer-spin-button,
	.field::-webkit-inner-spin-button { -webkit-appearance: none; }
	.field:focus {
		outline: none;
		border-bottom-color: var(--text-primary);
	}
	.field.year { width: 4ch; }

	/* Done button */
	.done {
		font-family: var(--font-serif);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 1rem;
		margin-top: 1.5rem;
		align-self: center;
		-webkit-tap-highlight-color: transparent;
	}
	.done:hover { opacity: 0.6; }

	/* Tighter layout on small screens */
	@media (max-width: 380px) {
		.label { font-size: 0.95rem; }
		.opt, .field { font-size: 0.95rem; }
		.options { gap: 0.6rem; }
	}
</style>
