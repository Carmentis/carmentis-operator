import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
	ApplicationPublicationExecutionContext,
	Blockchain, BlockchainFacade, CometBFTPublicKey,
	Explorer,
	Hash, OrganizationPublicationExecutionContext, OrganizationWrapper,
	ProviderFactory,
	PublicSignatureKey,
	StringSignatureEncoder,
	ValidatorNodePublicationExecutionContext,
} from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { NodeEntity } from '../entities/NodeEntity';


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
	private blockchain : BlockchainFacade;
	constructor() {
		this.logger = new Logger(ChainService.name);
		this.logger.log(`Linking operator with node located at ${process.env.NODE_URL}`)
		this.nodeUrl = process.env.NODE_URL;
		this.blockchain = BlockchainFacade.createFromNodeUrl(this.nodeUrl);
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


		// load organisation key pair
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisationEntity.privateSignatureKey);



		// create or update the application
		const isAlreadyPublished = organisationEntity.published;
		const organisationId = organisationEntity.virtualBlockchainId;
		const publicationContext = new OrganizationPublicationExecutionContext()
			.withCity(organisationEntity.city)
			.withName(organisationEntity.name)
			.withWebsite(organisationEntity.website)
			.withCountryCode(organisationEntity.countryCode);

		if (isAlreadyPublished) {
			publicationContext.withExistingOrganizationId(Hash.from(organisationId))
		}

		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(this.nodeUrl, organisationPrivateKey);
		return blockchain.publishOrganization(publicationContext);
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
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
		const applicationId = applicationEntity.virtualBlockchainId;
		const isAlreadyPublished = applicationEntity.published;


		// create or update the application
		const publicationContext = new ApplicationPublicationExecutionContext()
			.withApplicationName(applicationEntity.name)
			.withApplicationDescription(applicationEntity.description);
		if (isAlreadyPublished) {
			publicationContext.withExistingApplicationId(Hash.from(applicationId))
		} else {
			publicationContext.withOrganizationId(Hash.from(organisation.virtualBlockchainId));
		}
		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(this.nodeUrl, organisationPrivateKey);
		return blockchain.publishApplication(publicationContext);
	}

	async checkAccountExistence(publicSignatureKey: PublicSignatureKey) {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl);
		const blockchain = Explorer.createFromProvider(provider);
		try {
			this.logger.log(`Checking existence of token account from public key: '${publicSignatureKey}'`)
			await blockchain.getAccountByPublicKey(publicSignatureKey);
			return true;
		} catch (e) {
			this.logger.log('Organisation token account not found');
			return false;
		}
	}


	async getTransactionsHistory(publicSignatureKey: PublicSignatureKey, fromHistoryHash: string | undefined, limit: number) {
		return this.blockchain.getAccountHistoryFromPublicKey(publicSignatureKey);
	}

	async getBalanceOfAccount(publicSignatureKey: PublicSignatureKey) {
		return this.blockchain.getAccountBalanceFromPublicKey(publicSignatureKey);
	}

	async checkPublishedOnChain(organisation: OrganisationEntity) {
		// if the organisation do not have virtual blockchain id, it has not been published
		if (!organisation.virtualBlockchainId) return false;

		// otherwise, check if the organisation is published on the blockchain
		try {
			const blockchain = Blockchain.createFromProvider(
				ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl)
			);
			await blockchain.loadOrganization(
				Hash.from(organisation.virtualBlockchainId)
			);
			return true;
		} catch (e) {
			return false;
		}
	}


	async claimNode(organisation: OrganisationEntity, node: NodeEntity) {
		// create the blockchain client
		const organizationId = organisation.getVirtualBlockchainId();
		this.logger.verbose(`Proceeding to claim of node ${node.rpcEndpoint} by organisation ${organizationId.encode()} (ID: ${organisation.id})`)
		const organisationPrivateKey = organisation.getPrivateSignatureKey();
		const nodeRpcEndpoint = node.rpcEndpoint;
		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(nodeRpcEndpoint, organisationPrivateKey);
		const nodeStatus = await blockchain.getNodeStatus();
		const cometPublicKey = nodeStatus.getCometBFTNodePublicKey();
		const cometPublicKeyType = nodeStatus.getCometBFTNodePublicKeyType();
		const validatorNodeCreationContext = new ValidatorNodePublicationExecutionContext()
			.withOrganizationId(organizationId)
			.withCometPublicKeyType(cometPublicKeyType)
			.withRpcEndpoint(nodeRpcEndpoint)
			.withCometPublicKey(cometPublicKey);

		this.logger.verbose(`Claiming node...`)
		const validatorNodeId = await blockchain.publishValidatorNode(validatorNodeCreationContext);
		return validatorNodeId;
	}


	/**
	 * In this method, we mutate the provided object to synchronize the organization and the underlying applications.
	 *
	 * Warning: all information are not present on chain, this method fills the gap when possible.
	 *
	 * @param organization
	 */
	async mutateOrganizationFromDataOnChain(organization: OrganisationEntity) {
		// we first decode the public key of the organization.
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const publicKey = signatureEncoder.decodePublicKey(organization.publicSignatureKey);

		// If the organization contains a virtual blockchain id, we need to know if the organization
		// is still valid or not.
		const hasOrganizationId = organization.hasVirtualBlockchainId();
		let fetchedOrganizationHash: Hash | undefined;
		let fetchedOrganization: OrganizationWrapper | undefined = undefined;
		if (hasOrganizationId) {
			const organizationId = organization.getVirtualBlockchainId();
			try {
				// if the organization can be fetched by its virtual blockchain ID, we now that the organization is defined on chain.
				const organizationOnChain = await this.blockchain.loadOrganization(
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
		const { found, organization: foundOrganization, organizationId: foundOrganizationId } =
			await this.searchOrganizationFromChain(publicKey);
		if (found) {
			fetchedOrganization = foundOrganization;
			fetchedOrganizationHash = foundOrganizationId
		} else {
			this.logger.debug(`Organization not found on chain by its public key ${organization.publicSignatureKey}`)
		}



		// if no organization is fetched, the organization is currently not published on chain
		if (fetchedOrganization === undefined) {
			organization.virtualBlockchainId = undefined;
			organization.published = false;
			organization.publishedAt = undefined;
			return;
		} else {
			// We are now aware that the organization is published online, so we update the state of the organization.
			// Since we do not know when the organization has been published, we set it to now.
			organization.virtualBlockchainId = fetchedOrganizationHash.encode();
			organization.published = true;
			organization.isDraft = false;
			organization.publishedAt = new Date();
			organization.name = fetchedOrganization.getName();
			organization.countryCode = fetchedOrganization.getCountryCode();
			organization.city = fetchedOrganization.getCity();
			organization.website = fetchedOrganization.getWebsite();
		}
	}

	private async searchOrganizationFromChain(organizationPublicKey: PublicSignatureKey) {
		// We search among all existing organizations if one as the same public key as ours
		// TODO: This method can be really time-consuming, need a more appropriate approach!!!!
		const allOrganizations = await this.blockchain.getAllOrganizations();
		for (const organizationHash of allOrganizations) {
			const organization = await this.blockchain.loadOrganization(organizationHash);
			const otherPublicKey = organization.getPublicKey().getPublicKeyAsString();
			const myPublicKey = organizationPublicKey.getPublicKeyAsString();
			if (myPublicKey === otherPublicKey) {
				return { found: true, organization: organization, organizationId: organizationHash };
			}
		}
		return { found: false, organization: undefined, organizationId: undefined };
	}

	async fetchApplicationsAssociatedWithOrganizationsFromChain(organisation: OrganisationEntity) {
		// TODO: This method can be time-consuming, we need a more direct approach!!!
		const managedApplications: Partial<ApplicationEntity>[] = [];
		const encoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const myPublicKey = organisation.publicSignatureKey;
		const allApplicationsHashes = await this.blockchain.getAllApplications();
		for (const applicationHash of allApplicationsHashes) {
			const application = await this.blockchain.loadApplication(applicationHash);
			const organizationHoldingApplication = await this.blockchain.loadOrganization(application.getOrganizationId());
			const organizationPublicKey = organizationHoldingApplication.getPublicKey();
			if (myPublicKey === encoder.encodePublicKey(organizationPublicKey)) {
				managedApplications.push({
					name: application.getName(),
					website: application.getWebsite(),
					logoUrl: application.getLogoUrl(),
					isDraft: false,
					publishedAt: new Date(),
					virtualBlockchainId: applicationHash.encode(),
					published: true,
					description: application.getDescription(),
					organisation,
				});
			}
		}
		return managedApplications
	}

	async fetchNodesAssociatedWithOrganizationFromChain(organization: OrganisationEntity) {
		return []
		/* We are currently unable to load nodes from chain: No information about the rpc endpoint.
		const managedNodes: Partial<NodeEntity>[] = [];
		const encoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const myPublicKey = organization.publicSignatureKey;
		const allNodesHashes = await this.blockchain.getAllValidatorNodes();
		let nodeIndex = 1; // we create a default alias for nodes we are loading
		for (const nodeHash of allNodesHashes) {
			const node = await this.blockchain.loadValidatorNode(nodeHash);
			const organizationHoldingNode = await this.blockchain.loadOrganization(node.getOrganizationId());
			const organizationPublicKey = organizationHoldingNode.getPublicKey();
			if (myPublicKey === encoder.encodePublicKey(organizationPublicKey)) {
				managedNodes.push({
					organisation: organization,
					nodeAlias: `Node ${nodeIndex}`,
					rpcEndpoint:
				});
			}
			nodeIndex += 1;
		}

		 */
	}
}