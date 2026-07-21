// did-jwk-resolver.ts
import type {
	DIDDocument,
	DIDResolutionResult,
	DIDResolver,
	ParsedDID,
	Resolvable,
	VerificationMethod,
} from 'did-resolver'

/**
 * Décode la partie base64url de l'identifiant did:jwk en objet JWK.
 * did:jwk:<base64url(JSON(JWK))>[#0]
 */
function decodeJwk(identifier: string): Record<string, any> {
	// On retire un éventuel fragment (ne devrait pas être dans l'identifiant lui-même,
	// mais on sécurise au cas où)
	const raw = identifier.split('#')[0]

	const base64 = raw.replace(/-/g, '+').replace(/_/g, '/')
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

	let jsonStr: string
	try {
		jsonStr = Buffer.from(padded, 'base64').toString('utf-8')
	} catch {
		throw new Error('invalidDid: impossible de décoder le base64url')
	}

	try {
		return JSON.parse(jsonStr)
	} catch {
		throw new Error('invalidDid: le contenu décodé n\'est pas un JSON valide')
	}
}

/**
 * Détermine les relations de vérification (verification relationships)
 * à exposer dans le DID Document, selon le champ `use` du JWK.
 *
 * Règles (spec did:jwk) :
 * - use absent  -> toutes les relations de signature + keyAgreement seulement
 *                  si la clé n'est utilisable que pour l'échange (ex: X25519)
 * - use = "sig" -> authentication, assertionMethod, capabilityInvocation, capabilityDelegation
 * - use = "enc" -> keyAgreement uniquement
 */
function getVerificationRelationships(jwk: Record<string, any>): string[] {
	const isX25519 = jwk.kty === 'OKP' && jwk.crv === 'X25519'

	if (jwk.use === 'sig') {
		return ['authentication', 'assertionMethod', 'capabilityInvocation', 'capabilityDelegation']
	}

	if (jwk.use === 'enc') {
		return ['keyAgreement']
	}

	// Pas de `use` défini
	if (isX25519) {
		// X25519 ne sert qu'à l'échange de clés (ECDH), jamais à signer
		return ['keyAgreement']
	}

	return ['authentication', 'assertionMethod', 'capabilityInvocation', 'capabilityDelegation']
}

/**
 * Construit le DID Document à partir d'un DID did:jwk.
 */
function buildDidDocument(did: string, jwk: Record<string, any>): DIDDocument {
	// On ne veut jamais exposer la clé privée si jamais un `d` traînait dans le JWK fourni
	const { d, ...publicJwk } = jwk

	const vmId = `${did}#0`

	const verificationMethod: VerificationMethod = {
		id: vmId,
		type: 'JsonWebKey2020',
		controller: did,
		publicKeyJwk: publicJwk as any,
	}

	const relationships = getVerificationRelationships(publicJwk)

	const doc: DIDDocument = {
		'@context': [
			'https://www.w3.org/ns/did/v1',
			'https://w3id.org/security/suites/jws-2020/v1',
		],
		id: did,
		verificationMethod: [verificationMethod],
	}

	for (const rel of relationships) {
		;(doc as any)[rel] = [vmId]
	}

	return doc
}

/**
 * Fonction de résolution compatible avec la signature `DIDResolver`
 * de la lib `did-resolver`.
 */
export const resolveDidJwk: DIDResolver = async (
	did: string,
	parsed: ParsedDID,
	_resolver: Resolvable,
	_options,
): Promise<DIDResolutionResult> => {
	const contentType = 'application/did+ld+json'

	try {
		const jwk = decodeJwk(parsed.id)
		const didDocument = buildDidDocument(did, jwk)

		return {
			didDocumentMetadata: {},
			didResolutionMetadata: { contentType },
			didDocument,
		}
	} catch (err: any) {
		return {
			didDocumentMetadata: {},
			didResolutionMetadata: {
				error: 'invalidDid',
				message: err?.message ?? 'Erreur inconnue lors de la résolution du did:jwk',
			},
			didDocument: null,
		}
	}
}

/**
 * Point d'entrée à passer au `Resolver` de `did-resolver` :
 *
 *   import { Resolver } from 'did-resolver'
 *   import { getResolver } from './did-jwk-resolver'
 *
 *   const resolver = new Resolver({ ...getResolver() })
 *   const result = await resolver.resolve('did:jwk:eyJrdHkiOiJFQyIsIm...')
 */
export function getResolver(): Record<string, DIDResolver> {
	return { jwk: resolveDidJwk }
}