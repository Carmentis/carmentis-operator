import { Resolver } from 'did-resolver';
import { getResolver as getKeyResolver } from 'key-did-resolver';
import { getResolver as getWebResolver } from 'web-did-resolver';
import { getResolver as getJwkResolver } from '../did/DidJwkResolver';

export class DidUtils {
	private static resolver = new Resolver({
		...getKeyResolver(),
		...getWebResolver(),
		...getJwkResolver(),
	});

	static async resolveDid(did: string) {
		return this.resolver.resolve(did);
	}

	static async resolveDidAsCryptoKey(did: string) {
		const result = await this.resolveDid(did);

		if (result.didResolutionMetadata.error || !result.didDocument) {
			throw new Error(
				`Impossible de résoudre le DID "${did}": ${result.didResolutionMetadata.error ?? 'document introuvable'}`
			);
		}

		const doc = result.didDocument;
		const verificationMethods = doc.verificationMethod ?? [];

		if (verificationMethods.length === 0) {
			throw new Error(`Aucune verificationMethod trouvée pour le DID "${did}"`);
		}

		// Si le DID contient un fragment (ex: did:jwk:...#0), on cible la clé précise.
		// Sinon on prend la première verificationMethod du document.
		const fragment = did.includes('#') ? did.split('#')[1] : undefined;

		const vm = fragment
			? verificationMethods.find(
				(m) => m.id === did || m.id.endsWith(`#${fragment}`)
			)
			: verificationMethods[0];

		if (!vm) {
			throw new Error(`Aucune verificationMethod ne correspond au fragment "#${fragment}" pour "${did}"`);
		}

		if (!vm.publicKeyJwk) {
			throw new Error(
				`La verificationMethod "${vm.id}" ne contient pas de publicKeyJwk (type: ${vm.type}). ` +
				`Seul le format JWK est supporté par ce resolver.`
			);
		}

		const jwk = vm.publicKeyJwk;

		const { algorithm, usages } = this.getWebCryptoParams(jwk);

		return crypto.subtle.importKey(
			'jwk',
			jwk as JsonWebKey,
			algorithm,
			true,
			usages,
		);
	}

	private static getWebCryptoParams(jwk: any): {
		algorithm: AlgorithmIdentifier | EcKeyImportParams | any;
		usages: KeyUsage[];
	} {
		if (jwk.kty === 'OKP' && jwk.crv === 'Ed25519') {
			return { algorithm: { name: 'Ed25519' }, usages: ['verify'] };
		}

		if (jwk.kty === 'OKP' && jwk.crv === 'X25519') {
			// Clé d'échange uniquement, pas d'usage direct (deriveBits/deriveKey via une clé privée)
			return { algorithm: { name: 'X25519' }, usages: [] };
		}

		if (jwk.kty === 'EC' && jwk.crv === 'P-256') {
			return { algorithm: { name: 'ECDSA', namedCurve: 'P-256' }, usages: ['verify'] };
		}

		if (jwk.kty === 'EC' && jwk.crv === 'P-384') {
			return { algorithm: { name: 'ECDSA', namedCurve: 'P-384' }, usages: ['verify'] };
		}

		if (jwk.kty === 'EC' && jwk.crv === 'secp256k1') {
			// La WebCrypto API native ne supporte pas secp256k1 (Node.js et navigateurs).
			// C'est pour ça que le reste du projet utilise @noble/curves pour cette courbe.
			throw new Error(
				'secp256k1 n\'est pas supporté par SubtleCrypto (WebCrypto). ' +
				'Utilise @noble/curves/secp256k1 pour vérifier cette clé plutôt que resolveDidAsCryptoKey.'
			);
		}

		throw new Error(`Type de clé non supporté : kty=${jwk.kty}, crv=${jwk.crv}`);
	}
}