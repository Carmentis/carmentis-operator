document.addEventListener('DOMContentLoaded', () => {
	// Confirm dialogs for destructive actions
	const confirmButtons = document.querySelectorAll('[data-confirm]');
	confirmButtons.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const message = btn.getAttribute('data-confirm');
			if (!window.confirm(message)) {
				e.preventDefault();
				return false;
			}
		});
	});

	// Auto-dismiss flash messages after a delay
	const flashEl = document.getElementById('flash');
	if (flashEl) {
		setTimeout(() => {
			flashEl.style.transition = 'opacity 0.3s';
			flashEl.style.opacity = '0';
			setTimeout(() => flashEl.remove(), 300);
		}, 3500);
	}

	// Copy-to-clipboard for API keys
	const copyButtons = document.querySelectorAll('[data-copy-text]');
	copyButtons.forEach((btn) => {
		btn.addEventListener('click', async (e) => {
			e.preventDefault();
			const text = btn.getAttribute('data-copy-text');
			try {
				await navigator.clipboard.writeText(text);
				const originalText = btn.innerText;
				btn.innerText = 'Copied!';
				setTimeout(() => {
					btn.innerText = originalText;
				}, 2000);
			} catch (err) {
				console.error('Failed to copy:', err);
			}
		});
	});
});
