import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	ApplicationDescriptionSection,
	CMTSToken,
	CryptoEncoderFactory, FeesCalculationFormulaFactory,
	Hash,
	Microblock, OrganizationVb,
	Provider,
	ProviderFactory,
	PublicSignatureKey,
	Section,
	SectionType,
	SignatureSchemeId, Utils,
	ValidatorNodeCometbftPublicKeyDeclarationSection, ValidatorNodeCreationSection, ValidatorNodeRpcEndpointSection,
	VirtualBlockchainType,
} from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { NodeEntity } from '../entities/NodeEntity';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { ObjectType } from '@nestjs/graphql';


/**
 * ChainService is a service class designed to handle functionalities
 * related to managing and operating on chains of data or operations.
 *
 * This class is intended to provide utility methods for processing,
 * manipulating, or interacting with chains. It includes no initial
 * state or properties by default.
 *
 * The specific roles and methods intended for this service should
 * be defined and implemented as per the application requirements.
 */
@Injectable()
export default class ChainService {

	private logger: Logger;
	private nodeUrl: string;
	private provider : Provider;
	constructor(
		private readonly config: OperatorConfigService
	) {
		this.nodeUrl = this.config.getNodeUrl();
		this.logger = new Logger(ChainService.name);
		this.logger.log(`Linking operator with node located at ${this.nodeUrl}`)
		this.provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl);
	}


	async publishOrganisation(
		organisationEntity: OrganisationEntity
	)  {
		this.logger.log(`Publishing organisation ${organisationEntity.name}`)
		// reject if the country code or city are undefined
		const countryCode = organisationEntity.countryCode;
		const city = organisationEntity.city;
		if (typeof countryCode !== 'string' || countryCode.trim().length === 0) {
			throw "Empty country code."
		}
		if (typeof city !== 'string' || city.trim().length === 0) {
			throw "Empty city.";
		}

		const organisationPrivateKey = await this.getOrganizationPrivateKeyByOrganization(organisationEntity);
		const organizationPublicKey = await organisationPrivateKey.getPublicKey();
		const accountId = await this.provider.getAccountIdByPublicKey(organizationPublicKey);
		const organisationId = organisationEntity.virtualBlockchainId;
		const orgDescSection: Section = {
			type: SectionType.ORG_DESCRIPTION,
			city: organisationEntity.city,
			name: organisationEntity.name,
			website: organisationEntity.website,
			countryCode: organisationEntity.countryCode
		}
		if (organisationId) {
			this.logger.log(`Organisation already published on chain, updating it`)
			const orgVB = await this.provider.loadOrganizationVirtualBlockchain(Hash.from(organisationId));
			const mb = await orgVB.createMicroblock();
			mb.addSection(orgDescSection);
			await this.updateGasInMicroblock(mb, organisationPrivateKey.getSignatureSchemeId())
			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId
			});
			return await this.provider.publishMicroblock(mb);
		} else {
			this.logger.log(`Organisation not published on chain, publishing it`);
			const mb = Microblock.createGenesisOrganizationMicroblock();
			mb.addSections([
				{
					type: SectionType.ORG_CREATION,
					accountId: accountId,
				},
				orgDescSection,
			])
			await this.updateGasInMicroblock(mb, organisationPrivateKey.getSignatureSchemeId())

			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId
			});
			return await this.provider.publishMicroblock(mb);
		}
	}

	/**
	 * Publishes an application to the blockchain.
	 *
	 * @param organisation The organisation to publish the application under.
	 * @param applicationEntity The application to publish.
	 */
	async publishApplication(
		organisation: OrganisationEntity,
		applicationEntity: ApplicationEntity
	): Promise<Hash> {
		// load the organisation key pair and application id
		const organisationPrivateKey = await this.getOrganizationPrivateKeyByOrganization(organisation);
		const organizationPublicKey = await organisationPrivateKey.getPublicKey();
		const accountId = await this.provider.getAccountIdByPublicKey(organizationPublicKey);
		const applicationId = applicationEntity.virtualBlockchainId;
		const isAlreadyPublished = applicationEntity.published;
		const appDescSection: ApplicationDescriptionSection = {
			type: SectionType.APP_DESCRIPTION,
			name: applicationEntity.name,
			homepageUrl: applicationEntity.website || '',
			description: applicationEntity.description,
			logoUrl: '', // TODO: set the logo url
		}

		if (isAlreadyPublished) {
			this.logger.log(`Application already published on chain, updating it`)
			const appVb = await this.provider.loadApplicationVirtualBlockchain(Hash.from(applicationId));
			const mb = await appVb.createMicroblock();
			mb.addSections([ appDescSection ]);
			await this.updateGasInMicroblock(mb, organisationPrivateKey.getSignatureSchemeId())
			await mb.seal(organisationPrivateKey, { feesPayerAccount: accountId });
			return await this.provider.publishMicroblock(mb);
		} else {
			this.logger.log(`Application not published on chain, publishing a new one`);
			const mb = Microblock.createGenesisApplicationMicroblock();
			mb.setHeight(1);
			mb.addSections([
				{
					type: SectionType.APP_CREATION,
					organizationId: organisation.getVirtualBlockchainId().toBytes(),
				},
				appDescSection
			]);
			await this.updateGasInMicroblock(mb, organisationPrivateKey.getSignatureSchemeId())
			await mb.seal(organisationPrivateKey, { feesPayerAccount: accountId });
			console.log(mb.toString())
			return await this.provider.publishMicroblock(mb);
		}
	}

	async updateGasInMicroblock(mb: Microblock, usedSigSchemeId: SignatureSchemeId) {
		const protocolVariables = await this.provider.getProtocolVariables();
		const feesCalculationFormulaVersion = protocolVariables.getFeesCalculationVersion();
		const feesCalculationFormula = FeesCalculationFormulaFactory.getFeesCalculationFormulaByVersion(feesCalculationFormulaVersion);
		mb.setGas(await feesCalculationFormula.computeFees(usedSigSchemeId, mb))
	}


	async checkAccountExistence(publicSignatureKey: PublicSignatureKey) {
		//const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl);=
		try {
			const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
			const publicKey = await encoder.encodePublicKey(publicSignatureKey);
			this.logger.debug(`Checking existence of token account from public key: '${publicKey}'`)
			await this.provider.getAccountIdByPublicKey(publicSignatureKey);
			return true;
		} catch (e) {
			this.logger.log('Organisation token account not found');
			return false;
		}
	}


	async getTransactionsHistory(publicSignatureKey: PublicSignatureKey, fromHistoryHash: string | undefined, limit: number) {
		this.logger.debug("Getting transactions history");
		const accountId = await this.provider.getAccountIdByPublicKey(publicSignatureKey);
		const accountState = await this.provider.getAccountState(accountId);
		return await this.provider.getAccountHistory(accountId, accountState.lastHistoryHash, limit);
	}

	async getBalanceOfAccount(publicSignatureKey: PublicSignatureKey) {
		try {
			this.logger.debug("Getting balance of account");
			const accountId = await this.provider.getAccountIdByPublicKey(publicSignatureKey);
			const accountState = await this.provider.getAccountState(accountId);
			return accountState.balance;
		} catch {
			return CMTSToken.zero();
		}
	}

	async checkPublishedOnChain(organisation: OrganisationEntity) {
		this.logger.debug("Checking organisation published on chain");

		// if the organisation do not have virtual blockchain id, it has not been published
		if (!organisation.virtualBlockchainId) return false;

		// otherwise, check if the organisation is published on the blockchain
		try {
			await this.provider.loadOrganizationVirtualBlockchain(
				Hash.from(organisation.virtualBlockchainId)
			);
			return true;
		} catch (e) {
			return false;
		}
	}


	async claimNode(organisation: OrganisationEntity, node: NodeEntity) {
		// we abort the node claiming process if the organization is not published yet
		if (!organisation.isPublished()) {
			throw new BadRequestException('Cannot claim of node for an unpublished organization');
		}

		// create the blockchain client
		const organizationId = organisation.getVirtualBlockchainId();
		const accountId = await this.fetchAccountIdByOrganization(organisation);
		const organisationPrivateKey = await organisation.getPrivateSignatureKey();
		const nodeRpcEndpoint = node.rpcEndpoint;
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl);
		const nodeStatus = await provider.getNodeStatus(this.nodeUrl);
		const { type: cometPublicKeyType, value: cometPublicKey } = nodeStatus.result.validator_info.pub_key;


		// create the node claim request
		this.logger.debug(`Creating node claiming request for node: organizationId=${organizationId.encode()}, public key=${cometPublicKey}, public key type=${cometPublicKeyType}, rpc endpoint=${nodeRpcEndpoint}`)
		const mb = Microblock.createGenesisValidatorNodeMicroblock();
		const vnCreationSection: ValidatorNodeCreationSection = {
			type: SectionType.VN_CREATION,
			organizationId: organizationId.toBytes(),
		}
		const vnRpcEndpointDeclarationSection: ValidatorNodeRpcEndpointSection = {
			type: SectionType.VN_RPC_ENDPOINT,
			rpcEndpoint: nodeRpcEndpoint
		}
		const vnCometBFTPublicKeyDeclarationSection: ValidatorNodeCometbftPublicKeyDeclarationSection = {
			type: SectionType.VN_COMETBFT_PUBLIC_KEY_DECLARATION,
			cometPublicKeyType: cometPublicKeyType,
			cometPublicKey: cometPublicKey
		}
		mb.addSections([vnCreationSection, vnRpcEndpointDeclarationSection, vnCometBFTPublicKeyDeclarationSection]);
		await mb.seal(organisationPrivateKey, { feesPayerAccount: accountId });
		const microblockHash = await provider.publishMicroblock(mb);
		return microblockHash;
	}

	async stakeNode(organisation: OrganisationEntity, node: NodeEntity, amount: CMTSToken) {
		// we abort the staking process if the organization is not published yet
		if (!organisation.isPublished()) {
			throw new BadRequestException('Cannot stake node for an unpublished organization');
		}

		// we abort the staking process if the node has not been claimed yet
		if (!node.virtualBlockchainId) {
			throw new BadRequestException('Cannot stake a node that has not been claimed yet');
		}

		// create the blockchain client
		const accountId = await this.fetchAccountIdByOrganization(organisation);
		const organisationPrivateKey = await organisation.getPrivateSignatureKey();
		const accountVb = await this.provider.loadAccountVirtualBlockchain(Hash.from(accountId));
		const mb = await accountVb.createMicroblock();
		const nodeId = Hash.from(node.virtualBlockchainId);


		this.logger.debug(`Creating staking request for node: nodeId=${nodeId.encode()}, amount=${amount.toString()}`);


		mb.addSection({
			type: SectionType.ACCOUNT_STAKE,
			amount: amount.getAmountAsAtomic(),
			objectType: VirtualBlockchainType.NODE_VIRTUAL_BLOCKCHAIN, // TODO: ensure it is correct type
			objectIdentifier: nodeId.toBytes()
		})

		await this.updateGasInMicroblock(mb, organisationPrivateKey.getSignatureSchemeId());
		await mb.seal(organisationPrivateKey, { feesPayerAccount: accountId });
		const microblockHash = await this.provider.publishMicroblock(mb);
		return microblockHash;
	}


	/**
	 * In this method, we mutate the provided object to synchronize the organization and the underlying applications.
	 *
	 * Warning: all information are not present on chain, this method fills the gap when possible.
	 *
	 * @param organization
	 */
	async mutateOrganizationFromDataOnChain(organization: OrganisationEntity) {

		// If the organization contains a virtual blockchain id, we need to know if the organization
		// is still valid or not.
		const hasOrganizationId = organization.hasVirtualBlockchainId();
		let fetchedOrganizationHash: Hash | undefined;
		let fetchedOrganization: OrganizationVb | undefined = undefined;
		if (hasOrganizationId) {
			const organizationId = organization.getVirtualBlockchainId();
			try {
				// if the organization can be fetched by its virtual blockchain ID, we now that the organization is defined on chain.
				const organizationOnChain = await this.provider.loadOrganizationVirtualBlockchain(
					organizationId
				);

				// we update the organization details from what is stored in chain
				fetchedOrganization = organizationOnChain;
				fetchedOrganizationHash = organization.getVirtualBlockchainId();
			} catch (e) {
				// the organization has not been found on chain with its identifier
				this.logger.debug(`Organization not found on chain by its identifier ${organizationId.encode()}`)
			}
		}

		// if the organization has not been found on chain, we launch a search by its public key
		// TODO: search for all types of public keys
		const publicKey = await organization.getPublicSignatureKey();
		const { found, organization: foundOrganization, organizationId: foundOrganizationId } =
			await this.searchOrganizationFromChain(publicKey);

		if (found) {
			fetchedOrganization = foundOrganization;
			fetchedOrganizationHash = foundOrganizationId
		} else {
			const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
			this.logger.debug(`Organization not found on chain by its public key ${encoder.encodePublicKey(publicKey)}`)
		}



		// Update lastPublicationCheckTime to record the check
		organization.lastPublicationCheckTime = new Date();

		// if no organization is fetched, the organization is currently not published on chain
		if (fetchedOrganization === undefined) {
			organization.virtualBlockchainId = undefined;
			organization.publishedAt = undefined;
			return;
		} else {
			// We are now aware that the organization is published online, so we update the state of the organization.
			// Since we do not know when the organization has been published, we set it to now.
			const orgDesc = await fetchedOrganization.getDescription();
			organization.virtualBlockchainId = fetchedOrganizationHash.encode();
			organization.isDraft = false;
			organization.publishedAt = new Date();
			organization.name = orgDesc.name;
			organization.countryCode = orgDesc.countryCode;
			organization.city = orgDesc.city;
			organization.website = orgDesc.website;
		}
	}

	private async searchOrganizationFromChain(organizationPublicKey: PublicSignatureKey) {
		// We search among all existing organizations if one as the same public key as ours
		// TODO: This method can be really time-consuming, need a more appropriate approach!!!!
		const allOrganizations = await this.provider.getAllOrganizationIds();
		for (const organizationHash of allOrganizations) {
			const organization = await this.provider.loadOrganizationVirtualBlockchain(organizationHash);
			const accountId = organization.getAccountId();
			const accountVb = await this.provider.loadAccountVirtualBlockchain(accountId);
			const otherPublicKey = await (await accountVb.getPublicKey()).getPublicKeyAsBytes();
			const myPublicKey = await organizationPublicKey.getPublicKeyAsBytes();
			if (Utils.binaryIsEqual(myPublicKey, otherPublicKey)) {
				return { found: true, organization: organization, organizationId: organizationHash };
			}
		}
		return { found: false, organization: undefined, organizationId: undefined };
	}

	async fetchApplicationsAssociatedWithOrganizationsFromChain(organization: OrganisationEntity) {

		// TODO: This method can be time-consuming, we need a more direct approach!!!
		const accountId = await this.fetchAccountIdByOrganization(organization);
		const managedApplications: Partial<ApplicationEntity>[] = [];
		const allApplicationsHashes = await this.provider.getAllApplicationIds();
		for (const applicationHash of allApplicationsHashes) {
			const application = await this.provider.loadApplicationVirtualBlockchain(applicationHash);
			const organizationHoldingApplication = await this.provider.loadOrganizationVirtualBlockchain(application.getOrganizationId());
			const accountIdHoldingOrganization = organizationHoldingApplication.getAccountId();
			if (Utils.binaryIsEqual(accountId, accountIdHoldingOrganization.toBytes())) {
				const appDesc =  await application.getApplicationDescription();
				managedApplications.push({
					name: appDesc.name,
					website: appDesc.homepageUrl,
					logoUrl: appDesc.logoUrl,
					isDraft: false,
					publishedAt: new Date(),
					virtualBlockchainId: applicationHash.encode(),
					published: true,
					description: appDesc.description,
					organisation: organization,
				});
			}
		}
		return managedApplications
	}

	async fetchNodesAssociatedWithOrganizationFromChain(organization: OrganisationEntity) {

		const managedNodes: Partial<NodeEntity>[] = [];
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const myPublicKey = await organization.getPublicSignatureKey();

		const allNodesHashes = await this.provider.getAllValidatorNodes();
		let nodeIndex = 1; // we create a default alias for nodes we are loading
		for (const nodeHash of allNodesHashes) {
			const node = await this.provider.loadValidatorNodeVirtualBlockchain(nodeHash);
			const orgId = await node.getOrganizationId();
			const organizationHoldingNode = await this.provider.loadOrganizationVirtualBlockchain(orgId);
			const accountId = organizationHoldingNode.getAccountId();
			const accountVb = await this.provider.loadAccountVirtualBlockchain(accountId);
			const otherPublicKey = await (await accountVb.getPublicKey()).getPublicKeyAsBytes();
			if (Utils.binaryIsEqual(await myPublicKey.getPublicKeyAsBytes(), otherPublicKey)) {
				const rpcEndpoint = await node.getRpcEndpointDeclaration()
				managedNodes.push({
					organisation: organization,
					nodeAlias: `Node ${nodeIndex}`,
					rpcEndpoint: rpcEndpoint
				});
			}
			nodeIndex += 1;
		}
		return managedNodes;
	}

	private async getOrganizationPrivateKeyByOrganization(organization: OrganisationEntity, sigScheme: SignatureSchemeId = SignatureSchemeId.SECP256K1) {
		const walletCrypto = organization.getWallet();
		const orgAccount = walletCrypto.getDefaultAccountCrypto();
		return await orgAccount.getPrivateSignatureKey(sigScheme);
	}

	private async fetchAccountIdByOrganization(organization: OrganisationEntity) {
		const organisationPrivateKey = await this.getOrganizationPrivateKeyByOrganization(organization);
		const organizationPublicKey = await organisationPrivateKey.getPublicKey();
		const accountId = await this.provider.getAccountIdByPublicKey(organizationPublicKey);
		return accountId;
	}
}