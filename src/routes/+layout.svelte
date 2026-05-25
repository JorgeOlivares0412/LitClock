<script>
	import '../app.css';
	import { settings } from '$lib/stores/settings.js';

	let { children } = $props();

	// Keep <html data-theme> and <html data-invert> in sync with the settings store
	$effect(() => {
		document.documentElement.setAttribute('data-theme', $settings.theme);
	});
	$effect(() => {
		if ($settings.invert) {
			document.documentElement.setAttribute('data-invert', 'true');
		} else {
			document.documentElement.removeAttribute('data-invert');
		}
	});
</script>

{@render children()}
