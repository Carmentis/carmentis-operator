import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/client';
import { useOrganisation } from '@/contexts/organisation-store.context';

export function useOrganisationPublicKey() {
	const organisation = useOrganisation();
	const publicKey = organisation.publicSignatureKey;
	const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
	const decodedPublicKey = signatureEncoder.decodePublicKey(organisation.publicSignatureKey);
	return { publicKey, decodedPublicKey }
}