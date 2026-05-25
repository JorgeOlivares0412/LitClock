<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { settings } from '$lib/stores/settings.js';

	let { children } = $props();

	// ── Viewport height fix for iOS PWA standalone ─────────────────
	// In iOS standalone (home screen) mode, window.innerHeight can report
	// portrait height even when the device is in landscape on initial launch,
	// because no resize/orientationchange fires if orientation hasn't changed
	// since the icon was tapped. window.visualViewport.height is the reliable
	// API for this — it always reflects the actual visible area correctly.
	onMount(() => {
		function updateAppHeight() {
			const height = window.visualViewport
				? window.visualViewport.height
				: window.innerHeight;
			document.documentElement.style.setProperty('--app-height', `${height}px`);
		}

		// Run immediately, then retry — iOS PWA can take a few frames to settle
		// into the correct orientation on initial launch.
		updateAppHeight();
		const t1 = setTimeout(updateAppHeight, 100);
		const t2 = setTimeout(updateAppHeight, 500);

		// visualViewport fires more reliably than window.resize in iOS PWA
		const vvp = window.visualViewport;
		if (vvp) {
			vvp.addEventListener('resize', updateAppHeight);
		}
		window.addEventListener('resize', updateAppHeight);
		window.addEventListener('orientationchange', () => {
			// iOS updates innerHeight after a delay on rotation
			setTimeout(updateAppHeight, 100);
			setTimeout(updateAppHeight, 500);
		});

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			if (vvp) vvp.removeEventListener('resize', updateAppHeight);
			window.removeEventListener('resize', updateAppHeight);
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
