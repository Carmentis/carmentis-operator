// Completes a list page of organizations/applications with what the wallets' indexers know.
//
// The registered items are rendered by the server from the local registry. This script fills the
// "found on-chain" card: for each wallet it asks `discoverUrl` (so that a slow or unreachable
// indexer never blocks the page) and
//  - lists the objects found on-chain but not registered locally, with an "Import" button,
//  - disables the publish buttons of wallets that are not attached to an on-chain account.
// Values come from the chain: they are only ever written as text.
function initCatalog({ discoverUrl, importUrl, columns, describe }) {
	const wallets = document.getElementById('onchain-wallets');
	const loading = document.getElementById('onchain-loading');
	const empty = document.getElementById('onchain-empty');
	const count = document.getElementById('onchain-count');
	const refs = [...document.querySelectorAll('.wallet-ref')];

	let pending = refs.length;
	let importable = 0;
	let readable = 0; // wallets whose on-chain objects could actually be looked up

	const element = (tag, className, text) => {
		const el = document.createElement(tag);
		if (className) el.className = className;
		if (text !== undefined) el.textContent = text;
		return el;
	};

	const cell = (content) => {
		const td = document.createElement('td');
		if (content instanceof Node) td.appendChild(content);
		else td.textContent = content || '-';
		return td;
	};

	const importForm = (walletId, vbId) => {
		const form = element('form');
		form.method = 'post';
		form.action = importUrl;
		form.style.display = 'inline';
		for (const [name, value] of [['walletId', walletId], ['vbId', vbId]]) {
			const input = element('input');
			input.type = 'hidden';
			input.name = name;
			input.value = value;
			form.appendChild(input);
		}
		const button = element('button', 'btn btn-primary', 'Import');
		button.type = 'submit';
		form.appendChild(button);
		return form;
	};

	const table = (walletId, items) => {
		const t = element('table');
		const head = element('tr');
		[...columns, 'Virtual blockchain ID', ''].forEach((label) => head.appendChild(element('th', '', label)));
		t.appendChild(element('thead')).appendChild(head);
		const body = t.appendChild(element('tbody'));
		for (const item of items) {
			const tr = element('tr');
			describe(item).forEach((value) => tr.appendChild(cell(value)));
			tr.appendChild(cell(item.virtualBlockchainId));
			tr.appendChild(cell(importForm(walletId, item.virtualBlockchainId)));
			body.appendChild(tr);
		}
		return t;
	};

	const finish = () => {
		if (--pending > 0) return;
		loading.hidden = true;
		count.textContent = String(importable);
		// nothing to claim "everything is registered" about when no wallet could be read
		empty.hidden = importable > 0 || readable === 0;
	};

	if (refs.length === 0) {
		loading.hidden = true;
		count.textContent = '0';
		empty.textContent = 'No wallet yet: create a wallet to look for on-chain objects.';
		empty.hidden = false;
		return;
	}

	refs.forEach(async (ref) => {
		const { id, name } = ref.dataset;
		// created up-front so that blocks keep the wallets' order whatever the answers' order
		const block = wallets.appendChild(element('div', 'catalog-wallet'));
		block.appendChild(element('h4', '', name));
		const note = (message, isError) => block.appendChild(element('p', `catalog-note${isError ? ' catalog-note-error' : ''}`, message));

		try {
			const res = await fetch(`${discoverUrl}?walletId=${encodeURIComponent(id)}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Request failed');

			if (data.attached === false) {
				note('Not attached to an on-chain account: nothing can be found on-chain, and objects can only be created locally.');
				document.querySelectorAll(`[data-publish-wallet-id="${CSS.escape(id)}"]`).forEach((button) => {
					button.disabled = true;
					button.title = 'The wallet is not attached to an on-chain account';
				});
			}
			if (data.onChainError) note(`On-chain data unavailable (${data.onChainError}).`, true);

			if (data.attached !== false && !data.onChainError) readable++;

			const items = data.entries.filter((e) => e.status === 'on-chain-only').map((e) => e.onChain);
			if (items.length > 0) {
				block.appendChild(table(id, items));
				importable += items.length;
			} else if (data.attached !== false && !data.onChainError) {
				note('Nothing to import.');
			}
		} catch (err) {
			note(`On-chain data unavailable (${err.message}).`, true);
		} finally {
			finish();
		}
	});
}
