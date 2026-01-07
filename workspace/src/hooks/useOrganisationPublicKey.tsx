import { CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk/client';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useAsync } from 'react-use';

export function useOrganisationPublicKey() {
	const organisation = useOrganisation();
	return useAsync(async () => {
		const publicKey = organisation.publicSignatureKey;
		const signatureEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const decodedPublicKey = await signatureEncoder.decodePublicKey(organisation.publicSignatureKey);
		return { publicKey: decodedPublicKey, encodedPublicKey: publicKey }
	}, [organisation])
}