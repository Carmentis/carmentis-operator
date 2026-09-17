/**
 * Drives a Carmentis Desk `wr-auth-pk` ("authenticate by public key") exchange from the
 * browser, for login/setup/invitation-registration alike.
 *
 * Depends on the `@cmts-dev/carmentis-desk-connect-js` UMD bundle (global `CarmentisConnect`)
 * being loaded via a <script> tag before this file, e.g.:
 *   <script src="https://unpkg.com/@cmts-dev/carmentis-desk-connect-js@1.1.0/dist/index.umd.cjs"></script>
 * This mirrors how the SDK is used in the official Carmentis docs: it is a browser-only
 * dependency, never bundled or imported server-side.
 */

async function postJSON(url, body) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(data.message || 'Request failed');
	}
	return data;
}

/**
 * Fetches a challenge from `challengeUrl`, has Carmentis Desk sign it via `relayUrl`, then
 * posts `{ challenge, publicKey, signature, ...extraBody }` to `verifyUrl`.
 */
async function authenticateWithDesk(challengeUrl, verifyUrl, relayUrl, extraBody) {
	if (!window.CarmentisConnect) {
		throw new Error('Carmentis Desk connector script did not load.');
	}

	const { challenge } = await postJSON(challengeUrl, undefined);

	const { publicKey, signature, payload } = await new Promise((resolve, reject) => {
		let popup;
		popup = window.CarmentisConnect.createCarmentisJsonRpcPopup({
			relayUrl,
			title: 'Authenticate with Carmentis Desk',
			request: {
				jsonrpc: '2.0',
				id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				method: '/v1/auth/pk',
				params: {
					origin: "Carmentis Operator",
					challenge: challenge,
					sigMethod: "canonical-json",
				},
			},
			onResponse(response) {
				console.log("Receiving response:", response)
				popup.close();
				resolve(response.result);
			},
			onError(err) {
				console.error("Receiving error:", err)
				popup.close();
				reject(new Error(err.message || 'Carmentis Desk authentication failed'));
			},
			onClose() {
				//reject(new Error('Carmentis Desk authentication was cancelled'));
			},
		});
		popup.open().catch(reject);
	});

	return postJSON(verifyUrl, { challenge, publicKey, signature, payload, ...extraBody });
}
