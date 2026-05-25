<script>
	/**
	 * @type {{
	 *   formattedDate: string,
	 *   formattedTime: string,
	 *   displayExactTime: boolean,
	 *   onSettingsOpen: () => void
	 * }}
	 */
	let { formattedDate, formattedTime, displayExactTime, onSettingsOpen } = $props();

	// 4-tap gesture: 4 taps within 700ms opens settings
	let tapCount = $state(0);
	let tapTimer = null;

	function handleTap() {
		tapCount++;
		clearTimeout(tapTimer);

		if (tapCount >= 4) {
			tapCount = 0;
			onSettingsOpen();
			return;
		}

		tapTimer = setTimeout(() => { tapCount = 0; }, 700);
	}
</script>

<header
	class="date-header"
	role="button"
	tabindex="0"
	aria-label="Date and time. Tap four times quickly to open settings."
	onclick={handleTap}
	onkeydown={(e) => e.key === 'Enter' && handleTap()}
>
	<p class="date">{formattedDate}</p>
	{#if displayExactTime}
		<p class="clock">{formattedTime}</p>
	{/if}
</header>

<style>
	.date-header {
		flex-shrink: 0;
		text-align: center;
		padding: 1.75rem 1rem 1rem;
		cursor: default;
		user-select: none;
		outline: none;
		/* Expand touch target without affecting layout */
		-webkit-tap-highlight-color: transparent;
	}

	.date,
	.clock {
		font-family: var(--font-serif);
		font-size: var(--date-size);
		color: var(--text-muted);
		letter-spacing: 0.04em;
		line-height: 1.8;
		font-weight: 400;
	}
</style>
