<script>
	/** @type {{ title: string, author: string }} */
	let { title, author } = $props();
</script>

<div class="attribution">
	<p class="title">{title}</p>
	<p class="author">{author}</p>
</div>

<style>
	.attribution {
		flex-shrink: 0;
		text-align: right;
		padding: 1rem 1.75rem 2.25rem;
		user-select: none;
	}

	.title,
	.author {
		font-family: var(--font-serif);
		font-size: var(--attr-size);
		color: var(--text-primary);
		line-height: 1.7;
		font-weight: 400;
	}

	@media (min-width: 600px) {
		.attribution { padding: 1rem 2.5rem 2.5rem; }
	}

	@media (min-width: 1024px) {
		.attribution { padding: 1.25rem 3.5rem 3rem; }
	}
</style>
