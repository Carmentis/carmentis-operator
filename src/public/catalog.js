// Completes a list page of organizations/applications with what the wallets' indexers know.
//
// The list itself is rendered by the server from the local registry; this script then asks,
// for each wallet, `discoverUrl` (so that a slow or unreachable indexer never blocks the page),
// and
//  - disables the publish buttons of wallets that are not attached to an on-chain account,
//  - lists the objects found on-chain but not registered locally, with an "Import" button.
// Values come from the chain: they are only ever written as text.
function initCatalog({ discoverUrl, importUrl, describe }) {
	const statusBox = document.getElementById('catalog-status');
	const section = document.getElementById('onchain-section');
	const rows = document.getElementById('onchain-rows');

	const note = (message) => {
		const p = document.createElement('p');
		p.className = 'catalog-note';
		p.textContent = message;
		statusBox.appendChild(p);
	};

	const cell = (content) => {
		const td = document.createElement('td');
		if (content instanceof Node) td.appendChild(content);
		else td.textContent = content || '-';
		return td;
	};

	const importForm = (walletId, vbId) => {
		const form = document.createElement('form');
		form.method = 'post';
		form.action = importUrl;
		form.style.display = 'inline';
		for (const [name, value] of [['walletId', walletId], ['vbId', vbId]]) {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = name;
			input.value = value;
			form.appendChild(input);
		}
		const button = document.createElement('button');
		button.type = 'submit';
		button.className = 'btn btn-primary';
		button.textContent = 'Import';
		form.appendChild(button);
		return form;
	};

	document.querySelectorAll('.wallet-ref').forEach(async (ref) => {
		const { id, name } = ref.dataset;
		try {
			const res = await fetch(`${discoverUrl}?walletId=${encodeURIComponent(id)}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Request failed');

			if (data.onChainError) note(`Wallet "${name}": on-chain data unavailable (${data.onChainError}).`);
			if (data.attached === false) {
				note(`Wallet "${name}" is not attached to an on-chain account: objects can only be created locally.`);
				document.querySelectorAll(`[data-publish-wallet-id="${CSS.escape(id)}"]`).forEach((button) => {
					button.disabled = true;
					button.title = 'The wallet is not attached to an on-chain account';
				});
			}

			for (const entry of data.entries.filter((e) => e.status === 'on-chain-only')) {
				const [label, detail] = describe(entry.onChain);
				const tr = document.createElement('tr');
				tr.append(cell(label), cell(detail), cell(entry.onChain.virtualBlockchainId), cell(name));
				tr.append(cell(importForm(id, entry.onChain.virtualBlockchainId)));
				rows.appendChild(tr);
				section.hidden = false;
			}
		} catch (err) {
			note(`Wallet "${name}": on-chain data unavailable (${err.message}).`);
		}
	});
}
