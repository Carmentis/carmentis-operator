import * as v from "valibot";

export enum PrivateKeyObjectType {
	SEED = "SEED",
	JWK = "JWK",
	// any other key types should be represented here
}


export const SeedableKeySchema = v.object({
	keyType: v.literal(PrivateKeyObjectType.SEED),


	/**
	 * Identifier of the private key scheme.
	 */
	schemeId: v.number(),

	/**
	 * The passphrase from which the seed is derived (using BIP39).
	 *
	 * The passphrase is optional.
	 */
	passphrase: v.optional(v.string()),

	/**
	 * The seed from which the private key is derived.
	 */
	seed: v.string(),
});

export const JwkKeySchema = v.object({
	keyType: v.literal(PrivateKeyObjectType.JWK),

	jwk: v.unknown(),
})


export const PrivateKeyObjectSchema = v.variant("keyType", [
	SeedableKeySchema,
	JwkKeySchema,
])

export type PrivateKeyObject = v.InferOutput<typeof PrivateKeyObjectSchema>
