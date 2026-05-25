<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { settings } from '$lib/stores/settings.js';

	let { children } = $props();

	// Set --app-height from window.innerHeight so landscape layout uses the
	// real visible height instead of the buggy dvh value on some iOS versions.
	onMount(() => {
		function updateAppHeight() {
			document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
		}
		updateAppHeight();
		window.addEventListener('resize', updateAppHeight);
		window.addEventListener('orientationchange', () => {
			// Small delay — iOS fires orientationchange before innerHeight updates
			setTimeout(updateAppHeight, 100);
		});
		return () => {
			window.removeEventListener('resize', updateAppHeight);
			window.removeEventListener('orientationchange', updateAppHeight);
		};
	});

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
