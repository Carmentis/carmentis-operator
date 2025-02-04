import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { useEffect, useState } from 'react';
import { Organisation } from '@/entities/organisation.entity';

export default function OrganisationAccountBalance(
	input: {organisation: Organisation}
) {
	const organisation = input.organisation;
	const [balance, setBalance] = useState<number|undefined>(undefined);

	async function recoverOrganisationBalanceFromBlockchain():Promise<void> {
		try {
			const publicKey = organisation.publicSignatureKey;
			const accountVbHash = await sdk.blockchain.blockchainQuery.getAccountByPublicKey(publicKey);
			const accountState = await sdk.blockchain.blockchainQuery.getAccountState(accountVbHash);
			setBalance(accountState.balance / sdk.constants.ECO.TOKEN)
		} catch (e) {
			//throw new Error(`An error occured: ${e}`);
		}
	}

	useEffect(() => {
		recoverOrganisationBalanceFromBlockchain()
			.catch(console.error);
	}, [organisation]);

	return <>
		{balance || '--'}
	</>
}