<script>
	import { onMount, onDestroy } from 'svelte';
	import { settings } from '$lib/stores/settings.js';
	import {
		getCurrentTime,
		getCurrentDate,
		formatDate,
		formatTime,
		msUntilNextTick
	} from '$lib/utils/timeUtils.js';
	import { loadQuote } from '$lib/utils/quoteLoader.js';
	import DateHeader from '$lib/components/DateHeader.svelte';
	import QuoteDisplay from '$lib/components/QuoteDisplay.svelte';
	import Attribution from '$lib/components/Attribution.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';

	// ── State ──────────────────────────────────────────────────────
	let quote = $state(null);
	let displayTime = $state(getCurrentTime($settings));
	let displayDate = $state(getCurrentDate($settings));
	let settingsOpen = $state(false);

	// ── Timers ─────────────────────────────────────────────────────
	let quoteTimer = null;
	let clockTimer = null;

	async function refreshQuote() {
		const time = getCurrentTime($settings);
		displayTime = time;
		displayDate = getCurrentDate($settings);
		const result = await loadQuote(time, $settings);
		if (result !== null) quote = result;
	}

	function scheduleNextQuote() {
		clearTimeout(quoteTimer);
		const delay = msUntilNextTick($settings.updateInterval);
		quoteTimer = setTimeout(async () => {
			await refreshQuote();
			scheduleNextQuote();
		}, delay);
	}

	function startClockTick() {
		clockTimer = setInterval(() => {
			if ($settings.timeMode === 'auto') {
				displayTime = getCurrentTime($settings);
				displayDate = getCurrentDate($settings);
			}
		}, 1000);
	}

	// Refresh + reschedule when interval or SFW setting changes
	let prevInterval = $settings.updateInterval;
	let prevSfw = $settings.sfwOnly;
	$effect(() => {
		const interval = $settings.updateInterval;
		const sfw = $settings.sfwOnly;
		if (interval !== prevInterval || sfw !== prevSfw) {
			prevInterval = interval;
			prevSfw = sfw;
			refreshQuote();
			scheduleNextQuote();
		}
	});

	// Keep display time in sync with manual override changes
	$effect(() => {
		displayTime = getCurrentTime($settings);
		displayDate = getCurrentDate($settings);
	});

	onMount(() => {
		refreshQuote();
		scheduleNextQuote();
		startClockTick();
	});

	onDestroy(() => {
		clearTimeout(quoteTimer);
		clearInterval(clockTimer);
	});
</script>

<div class="page">
	<DateHeader
		formattedDate={formatDate(displayDate)}
		formattedTime={formatTime(displayTime)}
		displayExactTime={$settings.displayExactTime}
		onSettingsOpen={() => (settingsOpen = true)}
	/>

	{#if quote}
		<QuoteDisplay {quote} />
		<div class="attribution-row">
			<Attribution title={quote.title} author={quote.author} />
		</div>
	{:else}
		<!-- Empty state: holds layout shape while first quote loads -->
		<div class="empty-state" aria-hidden="true">
			<span class="em-dash">—</span>
		</div>
	{/if}
</div>

{#if settingsOpen}
	<SettingsPanel onClose={() => (settingsOpen = false)} />
{/if}

<style>
	.page {
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: var(--bg);
	}

	/* Staggered attribution: left ~28% is empty, matching the mockup */
	.attribution-row {
		padding-left: 28%;
	}

	/* Empty / loading state — holds the flex layout without showing anything */
	.empty-state {
		flex: 1;
		display: flex;
		align-items: center;
		padding: 1.75rem;
	}

	.em-dash {
		font-family: var(--font-serif);
		font-size: 1.3rem;
		color: var(--text-muted);
		opacity: 0.4;
	}

	/* ── Tablet ── */
	@media (min-width: 600px) {
		.attribution-row { padding-left: 30%; }
		.empty-state { padding: 2rem 2.5rem; }
	}

	/* ── Desktop: constrain max width for readability ── */
	@media (min-width: 1024px) {
		.page {
			max-width: 860px;
			margin: 0 auto;
			/* Keep the themed bg behind the constrained column */
			box-shadow: none;
		}
		.attribution-row { padding-left: 32%; }
		.empty-state { padding: 2.5rem 3.5rem; }
	}
</style>
