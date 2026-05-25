<script>
	/**
	 * @type {{
	 *   quote: {
	 *     quote_first: string,
	 *     quote_time_case: string,
	 *     quote_last: string
	 *   }
	 * }}
	 */
	let { quote } = $props();

	// Adaptive font sizing based on total quote length
	let charCount = $derived(
		(quote.quote_first ?? '').length +
		(quote.quote_time_case ?? '').length +
		(quote.quote_last ?? '').length
	);

	// s = short (<150), m = medium (150-299), l = long (300-499), xl = very long (≥500)
	let sizeClass = $derived(
		charCount < 150 ? 'q-s' :
		charCount < 300 ? 'q-m' :
		charCount < 500 ? 'q-l' : 'q-xl'
	);
</script>

<div class="quote-wrapper">
	<blockquote class="quote-text {sizeClass}">
		{quote.quote_first}<strong>{quote.quote_time_case}</strong>{quote.quote_last}
	</blockquote>
</div>

<style>
	.quote-wrapper {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		padding: 1.5rem 1.75rem;
		overflow: hidden;
	}

	.quote-text {
		font-family: var(--font-serif);
		line-height: var(--quote-leading);
		color: var(--text-primary);
		font-weight: 400;
		font-style: normal;
		text-align: left;
		width: 100%;
	}

	/*
	 * Font sizes use clamp() with dvh units so they scale continuously
	 * with the actual viewport height — no media-query jumping needed.
	 * The upper bound matches the desktop theme vars; the dvh value
	 * ensures the text stays within the fixed frame on small screens.
	 */
	.q-s  { font-size: clamp(1.1rem,  5.5dvh, var(--qd-s)); }
	.q-m  { font-size: clamp(0.95rem, 4.2dvh, var(--qd-m)); }
	.q-l  { font-size: clamp(0.82rem, 3.4dvh, var(--qd-l)); }
	.q-xl { font-size: clamp(0.72rem, 2.7dvh, 1.2rem);      }

	/* Bolded time text — weight only, no size shift */
	.quote-text :global(strong) {
		font-weight: 600;
		font-style: normal;
	}

	/* ── Tablet ── */
	@media (min-width: 600px) {
		.quote-wrapper { padding: 2rem 2.5rem; }
	}

	/* ── Desktop ── */
	@media (min-width: 1024px) {
		.quote-wrapper { padding: 2.5rem 3.5rem; }
	}
</style>
