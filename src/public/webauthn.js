// Minimal vanilla-JS WebAuthn client helpers (no build step, no @simplewebauthn/browser).
// Converts between the base64url JSON shapes returned/expected by @simplewebauthn/server
// and the ArrayBuffer-based objects the native navigator.credentials API uses.

function base64urlToBuffer(base64url) {
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes.buffer;
}

function bufferToBase64url(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toCredentialCreationOptions(optionsJSON) {
	const options = {
		...optionsJSON,
		challenge: base64urlToBuffer(optionsJSON.challenge),
		user: { ...optionsJSON.user, id: base64urlToBuffer(optionsJSON.user.id) },
	};
	if (optionsJSON.excludeCredentials && optionsJSON.excludeCredentials.length > 0) {
		options.excludeCredentials = optionsJSON.excludeCredentials.map((cred) => ({
			...cred,
			id: base64urlToBuffer(cred.id),
		}));
	} else {
		delete options.excludeCredentials;
	}
	return options;
}

function toCredentialRequestOptions(optionsJSON) {
	const options = {
		...optionsJSON,
		challenge: base64urlToBuffer(optionsJSON.challenge),
	};
	// IMPORTANT: allowCredentials must be OMITTED (not an empty array) to trigger a true
	// discoverable/"usernameless" credential picker. Some platform authenticators treat an
	// explicitly empty array as "zero credentials are allowed" and refuse immediately,
	// rather than letting the user pick from any resident passkey for this RP.
	if (optionsJSON.allowCredentials && optionsJSON.allowCredentials.length > 0) {
		options.allowCredentials = optionsJSON.allowCredentials.map((cred) => ({
			...cred,
			id: base64urlToBuffer(cred.id),
		}));
	} else {
		delete options.allowCredentials;
	}
	return options;
}

function credentialToRegistrationJSON(credential) {
	const response = credential.response;
	return {
		id: credential.id,
		rawId: bufferToBase64url(credential.rawId),
		type: credential.type,
		response: {
			clientDataJSON: bufferToBase64url(response.clientDataJSON),
			attestationObject: bufferToBase64url(response.attestationObject),
			transports: response.getTransports ? response.getTransports() : undefined,
		},
		clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
		authenticatorAttachment: credential.authenticatorAttachment || undefined,
	};
}

function credentialToAuthenticationJSON(credential) {
	const response = credential.response;
	return {
		id: credential.id,
		rawId: bufferToBase64url(credential.rawId),
		type: credential.type,
		response: {
			clientDataJSON: bufferToBase64url(response.clientDataJSON),
			authenticatorData: bufferToBase64url(response.authenticatorData),
			signature: bufferToBase64url(response.signature),
			userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : undefined,
		},
		clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
		authenticatorAttachment: credential.authenticatorAttachment || undefined,
	};
}

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
 * Runs a full WebAuthn registration ceremony: fetches options from `optionsUrl` (POST,
 * with `optionsBody`), calls navigator.credentials.create(), and posts the result to
 * `verifyUrl`. Returns the verify endpoint's JSON response.
 */
async function registerPasskey(optionsUrl, verifyUrl, optionsBody) {
	if (!window.PublicKeyCredential) {
		throw new Error('This browser does not support passkeys (WebAuthn).');
	}
	const options = await postJSON(optionsUrl, optionsBody);
	const credential = await navigator.credentials.create({ publicKey: toCredentialCreationOptions(options) });
	if (!credential) throw new Error('Passkey creation was cancelled');
	return postJSON(verifyUrl, { response: credentialToRegistrationJSON(credential) });
}

/**
 * Runs a full discoverable WebAuthn authentication ceremony against `optionsUrl`/`verifyUrl`.
 */
async function authenticateWithPasskey(optionsUrl, verifyUrl) {
	if (!window.PublicKeyCredential) {
		throw new Error('This browser does not support passkeys (WebAuthn).');
	}
	const options = await postJSON(optionsUrl, undefined);
	const credential = await navigator.credentials.get({ publicKey: toCredentialRequestOptions(options) });
	if (!credential) throw new Error('Passkey sign-in was cancelled');
	return postJSON(verifyUrl, { response: credentialToAuthenticationJSON(credential) });
}
