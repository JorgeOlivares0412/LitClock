<script>
	import '../app.css';
	import { settings } from '$lib/stores/settings.js';

	let { children } = $props();

	// Keep <html data-theme> in sync with the settings store
	$effect(() => {
		document.documentElement.setAttribute('data-theme', $settings.theme);
	});
</script>

{@render children()}
