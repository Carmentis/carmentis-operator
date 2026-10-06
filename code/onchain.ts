import { defineStore } from 'pinia';
import {
	Hash,
	IProvider,
	Provider,
	Microblock,
	OrganizationDescriptionSection,
	ProviderFactory,
	SectionType,
	SeedEncoder,
	SignatureSchemeId,
	Utils,
	WalletCrypto,
	ValidatorNodeCreationSection,
	ValidatorNodeRpcEndpointSection,
	ValidatorNodeCometbftPublicKeyDeclarationSection,
	CMTSToken,
	VirtualBlockchainType,
	PublicSignatureKey,
	PrivateSignatureKey,
	ApplicationDescriptionSection,
	CryptoEncoderFactory,
	AccountVb, FeesCalculationFormulaFactory,
} from '@cmts-dev/carmentis-sdk-core';
import { createIndexerClient } from '../api/indexer/client.ts';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import {useWalletStore} from "./walletStore.ts";
import {useCurrentWallet} from "../composables/useCurrentWallet.ts";
import {DeskDatabase} from "../db/DeskDatabase.ts";

const MAXIMAL_ALLOWED_TOKEN_TRANSFER = 1000000000;

export interface PublishOrganizationParams {
	orgId: number;
}

export interface ClaimNodeParams {
	orgId: number;
	nodeId: number;
}

export interface StakeOnNodeParams {
	orgId: number;
	nodeId: number;
	amount: CMTSToken;
}

export interface UnstakeFromNodeParams {
	orgId: number;
	nodeId: number;
	amount: CMTSToken;
}

export interface PublishApplicationParams {
	orgId: number;
	appId: number;
	name: string;
	description: string;
	website?: string;
}

export interface TransferTokensParams {
	walletId: number;
	recipientPublicKey: string;
	amount: CMTSToken;
}

export interface PublishCustomJsonParams {
	orgId: number;
	json: Record<string, unknown>;
}

export const useOnChainStore = defineStore('onchain', () => {
	const toast = useToast();
	const { walletKeyPair, walletProvider, indexer: walletIndexer } = useCurrentWallet();

	const isPublishingOrganization = ref(false);
	const isClaimingNode = ref(false);
	const isStakingOnNode = ref(false);
	const isUnstakingFromNode = ref(false);
	const isPublishingApplication = ref(false);
	const isTransferringTokens = ref(false);
	const isPublishingCustomJson = ref(false);


	function getProvider() {
		if (!walletProvider.value) throw new Error("Wallet provider not ready")
		return walletProvider.value
	}

	function getKeyPair() {
		if (!walletKeyPair.value) throw new Error("Wallet key pair not ready")
		const {sk, pk} = walletKeyPair.value
		if (!sk || !pk) throw new Error("Wallet key pair not ready")
		return {sk, pk}
	}

	function getIndexer() {
		if (!walletIndexer.value) throw new Error("Wallet indexer not ready")
		return walletIndexer.value
	}


	/**
	 * Publishes an organization on-chain
	 * Creates a new virtual blockchain for the organization and stores the VB ID
	 */
	async function pushOrganization(params: PublishOrganizationParams) {
		isPublishingOrganization.value = true;
		try {
			const { orgId } = params;

			// Get organization from storage
			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization) {
				throw new Error(`Organization with id ${orgId} not found`);
			}

			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);

			const organisationPrivateKey = sk;
			let organizationVbId = organization.organizationVbId;
			const orgDescSection: OrganizationDescriptionSection = {
				type: SectionType.ORG_DESCRIPTION,
				city: organization.city,
				name: organization.name,
				website: organization.website,
				countryCode: organization.countryCode,
			};
			if (organizationVbId) {
				const orgVB = await provider.loadOrganizationVirtualBlockchain(Hash.from(organizationVbId));
				const mb = await orgVB.createMicroblock();
				mb.addSection(orgDescSection);
				await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
				await mb.seal(organisationPrivateKey, {
					feesPayerAccount: accountId,
				});
				await provider.publishMicroblock(mb);
			} else {
				const mb = Microblock.createGenesisOrganizationMicroblock();
				mb.addSections([
					{
						type: SectionType.ORG_CREATION,
						accountId: accountId,
					},
					orgDescSection,
				]);
				await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());

				await mb.seal(organisationPrivateKey, {
					feesPayerAccount: accountId,
				});
				await provider.publishMicroblock(mb);
				organizationVbId = mb.getHash().encode();
			}
			organization.organizationVbId = organizationVbId;

			// Update organization in storage with the VB ID
			await DeskDatabase.updateOrganization(orgId, organization);
			//await orgRepo.updateOrganization(orgId, { vbId: organisationId });

			toast.add({
				severity: 'success',
				summary: 'Organization published',
				detail: `Organization "${organization.name}" published successfully`,
				life: 3000,
			});
		} catch (e) {
			console.error(e);
			toast.add({
				severity: 'error',
				summary: `Error publishing organization: ${e}`,
				life: 3000,
			});
		} finally {
			isPublishingOrganization.value = false;
		}
	}


	async function getNode(nodeId: number) {
		const node = await DeskDatabase.getNodeById(nodeId);
		if (!node) throw new Error('Node not found')
		return node;
	}


	/**
	 * Claims a node for an organization on-chain
	 * Creates a validator node virtual blockchain and associates it with the organization
	 */
	async function claimNode(params: ClaimNodeParams) {
		isClaimingNode.value = true;
		try {
			const { orgId, nodeId } = params;

			// Get organization from storage
			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization) {
				throw new Error(`Organization with id ${orgId} not found`);
			}

			// Check if organization is published
			if (!organization.organizationVbId) {
				throw new Error(`Organization must be published before claiming nodes`);
			}

			// Get node from organization
			const node = await DeskDatabase.getNodeById(nodeId);
			if (!node) {
				throw new Error(`Node with id ${nodeId} not found in organization ${orgId}`);
			}

			if (!node.nodeEndpoint) throw new Error(`Node with id ${nodeId} does not have an endpoint`);
			if (!node.rpcEndpoint) throw new Error(`Node with id ${nodeId} does not have an RPC endpoint`);

			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);

			const organizationId = Hash.from(organization.organizationVbId);
			const organisationPrivateKey = sk;
			const nodeStatus = await provider.getNodeStatus(node.nodeEndpoint);
			const { type: cometPublicKeyType, value: cometPublicKey } = nodeStatus.result.validator_info.pub_key;

			const mb = Microblock.createGenesisValidatorNodeMicroblock();

			const vnCreationSection: ValidatorNodeCreationSection = {
				type: SectionType.VN_CREATION,
				organizationId: organizationId.toBytes(),
			};

			const vnRpcEndpointDeclarationSection: ValidatorNodeRpcEndpointSection = {
				type: SectionType.VN_RPC_ENDPOINT,
				rpcEndpoint: node.rpcEndpoint,
			};

			const vnCometBFTPublicKeyDeclarationSection: ValidatorNodeCometbftPublicKeyDeclarationSection = {
				type: SectionType.VN_COMETBFT_PUBLIC_KEY_DECLARATION,
				cometPublicKeyType: cometPublicKeyType,
				cometPublicKey: cometPublicKey,
			};

			mb.addSections([vnCreationSection, vnRpcEndpointDeclarationSection, vnCometBFTPublicKeyDeclarationSection]);

			await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId,
			});

			const microblockHash = await provider.publishMicroblock(mb);

			// Update node in storage with the VB ID
			const nodeVbId = microblockHash.encode();
			node.nodeVbId = nodeVbId
			await DeskDatabase.updateNode(nodeId, node);

			toast.add({
				severity: 'success',
				summary: 'Node claimed',
				detail: `Node "${node.name}" claimed successfully`,
				life: 3000,
			});

			return microblockHash;
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error claiming node',
				detail: e instanceof Error ? e.message : 'Unknown error',
				life: 5000,
			});
			throw e;
		} finally {
			isClaimingNode.value = false;
		}
	}

	/**
	 * Stakes tokens on a node
	 * Creates a microblock with an ACCOUNT_STAKE section to lock tokens for the node
	 */
	async function stakeOnNode(params: StakeOnNodeParams) {
		isStakingOnNode.value = true;
		try {
			const { orgId, nodeId, amount } = params;

			// Get organization from storage
			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization) {
				throw new Error(`Organization with id ${orgId} not found`);
			}

			// Check if organization is published
			if (!organization.organizationVbId) {
				throw new Error(`Organization must be published before staking on nodes`);
			}

			// Get node from organization
			const node = await getNode(nodeId);
			if (!node.nodeEndpoint) throw new Error('Node does not have a node endpoint')
			if (!node.rpcEndpoint) throw new Error('Node does not have an RPC endpoint')

			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);
			const organisationPrivateKey = sk;

			const nodeStatus = await provider.getNodeStatus(node.rpcEndpoint);
			const cometbftPublicKey = nodeStatus.result.validator_info.pub_key.value;

			const nodeResult = await getIndexer().getValidatorNodes({ public_key: cometbftPublicKey });
			if (nodeResult.items.length === 0) throw new Error(`The node must be declared before staking: No node found with public key ${cometbftPublicKey}`);
			const nodeAddress = Hash.from(nodeResult.items[0].virtualBlockchainId).toBytes();

			// Create the staking request
			const accountVb = await provider.loadAccountVirtualBlockchain(Hash.from(accountId));
			const mb = await accountVb.createMicroblock();

			mb.addSection({
				type: SectionType.ACCOUNT_STAKE,
				amount: amount.getAmountAsAtomic(),
				objectType: VirtualBlockchainType.NODE_VIRTUAL_BLOCKCHAIN,
				objectIdentifier: nodeAddress,
			});

			await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId,
			});

			const microblockHash = await provider.publishMicroblock(mb);

			toast.add({
				severity: 'success',
				summary: 'Staking successful',
				detail: `Staked ${amount.toString()} on node "${node.name}"`,
				life: 3000,
			});

			return microblockHash;
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error staking',
				detail: e instanceof Error ? e.message : 'Unknown error',
				life: 5000,
			});
			throw e;
		} finally {
			isStakingOnNode.value = false;
		}
	}

	/**
	 * Unstakes tokens from a node
	 * Creates a microblock with an ACCOUNT_UNSTAKE section to unlock tokens from the node
	 */
	async function unstakeFromNode(params: UnstakeFromNodeParams) {
		isUnstakingFromNode.value = true;
		try {
			const { orgId, nodeId, amount } = params;

			// Get organization from storage
			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization) {
				throw new Error(`Organization with id ${orgId} not found`);
			}

			// Check if organization is published
			if (!organization.organizationVbId) {
				throw new Error(`Organization must be published before unstaking from nodes`);
			}

			// Get node from organization
			const node = await getNode(nodeId);
			if (!node.nodeEndpoint) throw new Error('Node does not have a node endpoint')
			if (!node.rpcEndpoint) throw new Error('Node does not have an RPC endpoint')

			const indexer = getIndexer();
			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);
			const organisationPrivateKey = sk;

			const nodeStatus = await provider.getNodeStatus(node.rpcEndpoint);
			const cometbftPublicKey = nodeStatus.result.validator_info.pub_key.value;
			const nodeResult = await indexer.getValidatorNodes({ public_key: cometbftPublicKey });
			if (nodeResult.items.length === 0) throw new Error('Node not found on indexer');
			const nodeAddress = Hash.from(nodeResult.items[0].virtualBlockchainId).toBytes();

			// Create the unstaking request
			const accountVb = await provider.loadAccountVirtualBlockchain(Hash.from(accountId));
			const mb = await accountVb.createMicroblock();

			mb.addSection({
				type: SectionType.ACCOUNT_UNSTAKE,
				amount: amount.getAmountAsAtomic(),
				objectType: VirtualBlockchainType.NODE_VIRTUAL_BLOCKCHAIN,
				objectIdentifier: nodeAddress,
			});

			await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId,
			});

			const microblockHash = await provider.publishMicroblock(mb);

			toast.add({
				severity: 'success',
				summary: 'Unstaking successful',
				detail: `Unstaked ${amount.toString()} from node "${node.name}"`,
				life: 3000,
			});

			return microblockHash;
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error unstaking',
				detail: e instanceof Error ? e.message : 'Unknown error',
				life: 5000,
			});
			throw e;
		} finally {
			isUnstakingFromNode.value = false;
		}
	}

	async function updateGasInMicroblock(provider: IProvider, mb: Microblock, usedSigSchemeId: SignatureSchemeId) {
		const gas = await provider.computeMicroblockGas(mb, { signatureSchemeId: usedSigSchemeId });
		mb.setGasPrice(CMTSToken.createMilliToken(1));
		mb.setGas(gas);
	}

	async function fetchAccountStateByPublicKey(walletId: number, publicKey: PublicSignatureKey) {
		const wallet = await DeskDatabase.getWalletById(walletId);
		if (!wallet) throw new Error(`Wallet with id ${walletId} not found`);
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(wallet.network.node);
		const accountId = await provider.getAccountIdByPublicKey(publicKey);
		if (!wallet.network.indexer) throw new Error('Indexer not configured for this wallet');
		const hexId = Utils.binaryToHexa(accountId);
		const result = await createIndexerClient(wallet.network.indexer).getAccounts({ id: hexId });
		return result.items[0] ?? null;
	}

	/**
	 * Publishes an application on-chain
	 * Creates a new application virtual blockchain or updates an existing one
	 */
	async function publishApplication(params: PublishApplicationParams) {
		isPublishingApplication.value = true;
		try {
			const { orgId, appId, name, description, website } = params;

			// Get organization from storage
			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization) {
				throw new Error(`Organization with id ${orgId} not found`);
			}

			// Check if organization is published
			if (!organization.organizationVbId) {
				throw new Error(`Organization must be published before publishing applications`);
			}

			// Get application from organization
			const application = await DeskDatabase.getApplicationById(appId);
			if (!application) {
				throw new Error(`Application with id ${appId} not found in organization ${orgId}`);
			}

			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);

			// Prepare application description section
			const appDescSection: ApplicationDescriptionSection = {
				type: SectionType.APP_DESCRIPTION,
				name: name,
				homepageUrl: website || '',
				description: description,
				logoUrl: '',
			};

			const organisationPrivateKey = sk;
			const isAlreadyPublished = !!application.applicationVbId;

			let applicationVbId: string;

			if (isAlreadyPublished) {
				const appVb = await provider.loadApplicationVirtualBlockchain(Hash.from(application.applicationVbId!));
				const mb = await appVb.createMicroblock();
				mb.addSections([appDescSection]);
				await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
				await mb.seal(organisationPrivateKey, {
					feesPayerAccount: accountId,
				});
				await provider.publishMicroblock(mb);
				applicationVbId = application.applicationVbId!;
			} else {
				const mb = Microblock.createGenesisApplicationMicroblock();
				mb.setHeight(1);
				mb.addSections([
					{
						type: SectionType.APP_CREATION,
						organizationId: Hash.from(organization.organizationVbId).toBytes(),
					},
					appDescSection,
				]);
				await updateGasInMicroblock(provider, mb, organisationPrivateKey.getSignatureSchemeId());
				await mb.seal(organisationPrivateKey, {
					feesPayerAccount: accountId,
				});
				await provider.publishMicroblock(mb);
				applicationVbId = mb.getHash().encode();
			}

			// Update application in storage with the VB ID
			application.applicationVbId = applicationVbId;
			application.name = name;
			await DeskDatabase.updateApplication(appId, application);

			toast.add({
				severity: 'success',
				summary: 'Application published',
				detail: `Application "${name}" published successfully`,
				life: 3000,
			});
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error publishing application',
				detail: e instanceof Error ? e.message : 'Unknown error',
				life: 5000,
			});
			throw e;
		} finally {
			isPublishingApplication.value = false;
		}
	}

	/**
	 * Transfers tokens to a recipient's account
	 * @param walletId The wallet ID
	 * @param recipientPublicKey The public key of the recipient (as a string)
	 * @param amount The amount of tokens to transfer
	 */
	async function transferTokens(params: TransferTokensParams) {
		isTransferringTokens.value = true;
		try {
			const { walletId, recipientPublicKey, amount } = params;

			// Validate token amount
			const transferredAmount = amount.getAmountAsAtomic();
			const isNegativeOrZero = transferredAmount <= 0;
			const isAboveAllowedMax = MAXIMAL_ALLOWED_TOKEN_TRANSFER < amount.getAmount();
			if (isNegativeOrZero || isAboveAllowedMax) {
				throw new Error(
					`Invalid amount of token transfer: Should be between zero (excluded) and ${MAXIMAL_ALLOWED_TOKEN_TRANSFER}`,
				);
			}


			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			console.log(`Transfer performed using key ${sk.getSignatureSchemeId()}`)
			//const accountCrypto = await _walletCrypto(walletId);
			//const sk = await accountCrypto.getPrivateSignatureKey(SignatureSchemeId.SECP256K1);
			const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
			const recipientPk = await encoder.decodePublicKey(recipientPublicKey);

			try {
				const recipientAccountHash = Hash.from(await provider.getAccountIdByPublicKey(recipientPk));
				await creditExistingAccount(sk, provider, recipientAccountHash, amount);
				toast.add({
					severity: 'success',
					summary: 'Transfer successful',
					detail: `Transferred ${amount.toString()} tokens successfully`,
					life: 3000,
				});
			} catch {
				await createAndCreditNewAccount(sk, provider, recipientPk, amount);
				toast.add({
					severity: 'success',
					summary: 'Transfer successful',
					detail: `Created account and transferred ${amount.toString()} tokens successfully`,
					life: 3000,
				});
			}
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error transferring tokens',
				detail: e instanceof Error ? e.message : 'Unknown error',
				life: 5000,
			});
			throw e;
		} finally {
			isTransferringTokens.value = false;
		}
	}

	/**
	 * Creates a new account for a recipient and credits it with tokens
	 * @param issuerPrivateSignatureKey The private signature key of the issuer
	 * @param provider The blockchain provider
	 * @param recipientPublicKey The public key of the recipient
	 * @param tokenAmount The amount of tokens to credit
	 * @returns The hash of the created account
	 */
	async function createAndCreditNewAccount(
		issuerPrivateSignatureKey: PrivateSignatureKey,
		provider: Provider,
		recipientPublicKey: PublicSignatureKey,
		tokenAmount: CMTSToken,
	): Promise<Hash> {
		const issuerAccountHash = await provider.getAccountIdFromPublicKey(
			await issuerPrivateSignatureKey.getPublicKey(),
		);
		const accountCreationMb = await AccountVb.createAccountCreationMicroblock(
			recipientPublicKey,
			tokenAmount,
			issuerAccountHash.toBytes(),
		);
		const gas = await provider.computeMicroblockGas(accountCreationMb, {
			signatureSchemeId: issuerPrivateSignatureKey.getSignatureSchemeId(),
		});
		accountCreationMb.setGasPrice(CMTSToken.createMilliToken(1));
		accountCreationMb.setGas(gas);
		await accountCreationMb.seal(issuerPrivateSignatureKey, {
			feesPayerAccount: issuerAccountHash.toBytes(),
		});
		await provider.publishMicroblock(accountCreationMb);
		return accountCreationMb.getHash();
	}

	/**
	 * Credits tokens to an existing account
	 * @param issuerPrivateSignatureKey The private signature key of the issuer
	 * @param provider The blockchain provider
	 * @param receiverAccountHash The hash of the receiver's account
	 * @param tokenAmount The amount of tokens to credit
	 */
	async function creditExistingAccount(
		issuerPrivateSignatureKey: PrivateSignatureKey,
		provider: Provider,
		receiverAccountHash: Hash,
		tokenAmount: CMTSToken,
	): Promise<Hash> {
		const issuerPublicKey = await issuerPrivateSignatureKey.getPublicKey();
		const senderAccountHash = await provider.getAccountIdFromPublicKey(issuerPublicKey);
		const senderAccount = await provider.loadAccountVirtualBlockchain(senderAccountHash);
		const tokenTransferMb = await senderAccount.createMicroblock();
		tokenTransferMb.addSection({
			type: SectionType.ACCOUNT_TRANSFER,
			amount: tokenAmount.getAmountAsAtomic(),
			publicReference: '',
			privateReference: '',
			account: receiverAccountHash.toBytes(),
		});
		const gas = await provider.computeMicroblockGas(tokenTransferMb, {
			signatureSchemeId: issuerPrivateSignatureKey.getSignatureSchemeId(),
		});
		tokenTransferMb.setGasPrice(CMTSToken.createMilliToken(1));
		tokenTransferMb.setGas(gas);
		await tokenTransferMb.seal(issuerPrivateSignatureKey, {
			feesPayerAccount: senderAccountHash.toBytes(),
		});
		const hash = tokenTransferMb.getHash();
		await provider.publishMicroblock(tokenTransferMb);
		return hash;
	}

	/**
	 * Publishes a custom JSON section on the organization's virtual blockchain.
	 */
	async function publishCustomJson(params: PublishCustomJsonParams) {
		isPublishingCustomJson.value = true;
		try {
			const {  orgId, json } = params;

			const organization = await DeskDatabase.getOrganizationById(orgId);
			if (!organization || !organization.organizationVbId) {
				throw new Error('Organization is not published on-chain');
			}

			const provider = getProvider();
			const {sk, pk} = getKeyPair();
			const accountId = await provider.getAccountIdByPublicKey(pk);

			const orgVB = await provider.loadOrganizationVirtualBlockchain(Hash.from(organization.organizationVbId));
			const mb = await orgVB.createMicroblock();
			mb.addSection({ type: SectionType.CUSTOM, ...json });
			await updateGasInMicroblock(provider, mb, sk.getSignatureSchemeId());
			await mb.seal(sk, { feesPayerAccount: accountId });
			await provider.publishMicroblock(mb);

			toast.add({
				severity: 'success',
				summary: 'Custom data published',
				detail: 'Custom JSON section published on-chain successfully',
				life: 3000,
			});
		} catch (e) {
			toast.add({
				severity: 'error',
				summary: 'Error publishing custom data',
				detail: String(e),
				life: 5000,
			});
		} finally {
			isPublishingCustomJson.value = false;
		}
	}

	return {
		isPublishingOrganization,
		isClaimingNode,
		isStakingOnNode,
		isUnstakingFromNode,
		isPublishingApplication,
		isTransferringTokens,
		isPublishingCustomJson,
		publishOrganization: pushOrganization,
		claimNode,
		stakeOnNode,
		unstakeFromNode,
		fetchAccountStateByPublicKey,
		publishApplication,
		transferTokens,
		publishCustomJson,
	};
});
