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

	// s = short (<150), m = medium (150-300), l = long (>300)
	let sizeClass = $derived(
		charCount < 150 ? 'q-s' :
		charCount < 300 ? 'q-m' : 'q-l'
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
		display: flex;
		align-items: center;
		padding: 1.5rem 1.75rem;
		/* Allow scroll if quote is truly enormous */
		overflow-y: auto;
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

	/* ── Mobile sizes ── */
	.q-s { font-size: var(--qs-s); }
	.q-m { font-size: var(--qs-m); }
	.q-l { font-size: var(--qs-l); }

	/* Bolded time text — weight only, no size shift */
	.quote-text :global(strong) {
		font-weight: 600;
		font-style: normal;
	}

	/* ── Tablet ── */
	@media (min-width: 600px) {
		.q-s { font-size: var(--qt-s); }
		.q-m { font-size: var(--qt-m); }
		.q-l { font-size: var(--qt-l); }
		.quote-wrapper { padding: 2rem 2.5rem; }
	}

	/* ── Desktop ── */
	@media (min-width: 1024px) {
		.q-s { font-size: var(--qd-s); }
		.q-m { font-size: var(--qd-m); }
		.q-l { font-size: var(--qd-l); }
		.quote-wrapper { padding: 2.5rem 3.5rem; }
	}
</style>
