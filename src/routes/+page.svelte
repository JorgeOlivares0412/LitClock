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
			displayTime = getCurrentTime($settings);
			displayDate = getCurrentDate($settings);
		}, 1000);
	}

	// Refresh + reschedule when interval, SFW, or test mode changes
	let prevInterval = $settings.updateInterval;
	let prevSfw = $settings.sfwOnly;
	let prevTestMode = $settings.testMode;
	$effect(() => {
		const interval = $settings.updateInterval;
		const sfw = $settings.sfwOnly;
		const testMode = $settings.testMode;
		if (interval !== prevInterval || sfw !== prevSfw || testMode !== prevTestMode) {
			prevInterval = interval;
			prevSfw = sfw;
			prevTestMode = testMode;
			refreshQuote();
			scheduleNextQuote();
		}
	});

	// Keep display time in sync with manual override changes
	$effect(() => {
		displayTime = getCurrentTime($settings);
		displayDate = getCurrentDate($settings);
	});

	// Derive the quote size class so attribution can match the quote font size
	let quoteCharCount = $derived(
		quote
			? (quote.quote_first ?? '').length +
			  (quote.quote_time_case ?? '').length +
			  (quote.quote_last ?? '').length
			: 0
	);
	let quoteSizeClass = $derived(
		quoteCharCount < 150 ? 'q-s' :
		quoteCharCount < 300 ? 'q-m' :
		quoteCharCount < 500 ? 'q-l' : 'q-xl'
	);

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
		<div
			class="attribution-row"
			class:q-s={quoteSizeClass === 'q-s'}
			class:q-m={quoteSizeClass === 'q-m'}
			class:q-l={quoteSizeClass === 'q-l'}
			class:q-xl={quoteSizeClass === 'q-xl'}
		>
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
		height: var(--app-height, 100%);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: var(--bg);
		/* Edge buffer + Dynamic Island safe area (left/right in landscape).
		   max() ensures at least 0.5rem breathing room on all sides even
		   when env() returns 0. Bottom covers the home indicator (~34px). */
		padding-top:    max(0.5rem, env(safe-area-inset-top,    0px));
		padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
		padding-left:   env(safe-area-inset-left,  0px);
		padding-right:  env(safe-area-inset-right, 0px);
	}

	/* Staggered attribution: left ~28% is empty, matching the mockup */
	.attribution-row {
		padding-left: 28%;
	}

	/* Attribution font size matches the current quote tier — same clamp
	   values as QuoteDisplay so title/author scale identically to the quote.
	   Attribution.svelte uses font-size: inherit to pick this up. */
	.attribution-row.q-s  { font-size: clamp(1.1rem,  min(5.5dvh, 8vw),   var(--qd-s)); }
	.attribution-row.q-m  { font-size: clamp(0.95rem, min(4.2dvh, 5.5vw),  var(--qd-m)); }
	.attribution-row.q-l  { font-size: clamp(0.82rem, min(3.4dvh, 4.5vw),  var(--qd-l)); }
	.attribution-row.q-xl { font-size: clamp(0.72rem, min(2.7dvh, 3.8vw),  1.2rem);      }

	/* Empty / loading state — holds the flex layout without showing anything */
	.empty-state {
		flex: 1;
		display: flex;
		align-items: center;
		padding: 1.75rem;
	}

	.em-dash {
		font-family: var(--font-body);
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
		}
		.attribution-row { padding-left: 32%; }
		.empty-state { padding: 2.5rem 3.5rem; }
	}

	/* ── Landscape phones — attribution size overrides, same as QuoteDisplay ── */
	@media (orientation: landscape) and (max-height: 600px) {
		.attribution-row.q-s  { font-size: clamp(1.0rem,  7.5dvh, var(--qd-s)); }
		.attribution-row.q-m  { font-size: clamp(0.9rem,  6.5dvh, var(--qd-m)); }
		.attribution-row.q-l  { font-size: clamp(0.78rem, 5.0dvh, var(--qd-l)); }
		.attribution-row.q-xl { font-size: clamp(0.68rem, 4.0dvh, 1.2rem);      }
	}
</style>
