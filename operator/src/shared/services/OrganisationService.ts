import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { OrganisationAccessRightEntity } from '../entities/OrganisationAccessRightEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import ChainService from './ChainService';
import { CryptoService } from './CryptoService';
import {
	CryptoEncoderFactory, NodeConnectionRefusedError, NodeEndpointClosedWhileCatchingUpError,
	ParsingError,
	PrivateSignatureKey,
	StringSignatureEncoder,
	WalletCrypto,
} from '@cmts-dev/carmentis-sdk/server';
import { NodeEntity } from '../entities/NodeEntity';
import { NodeService } from './NodeService';


@Injectable()
export class OrganisationService {
	private logger = new Logger(OrganisationService.name);
	constructor(
		@InjectRepository(OrganisationEntity)
		private readonly organisationEntityRepository: Repository<OrganisationEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly chainService: ChainService,
		private readonly cryptoService: CryptoService,
		@InjectRepository(NodeEntity)
		private readonly nodeRepository: Repository<NodeEntity>,
		private readonly nodeService: NodeService
	) {}

	/**
	 * Returns true if the provided user belongs to the set of members in the organization or if the user is an administrator.
	 *
	 * @param user
	 * @param organization
	 */
	async isAuthorizedUser(user: UserEntity, organization: number | OrganisationEntity): Promise<boolean> {
		const organizationId = typeof organization === 'number' ? organization : organization.id;
		const isAdmin = user.isAdmin;
		const isMember = OrganisationAccessRightEntity.existsBy({
			organisation: {
				id: organizationId,
			},
			user: {
				publicKey: user.publicKey,
			}
		})
		return isAdmin || isMember;
	}

	// Find one item by ID
	async findOne(id: number): Promise<OrganisationEntity> {
		const organisation = await this.organisationEntityRepository.findOne({
			where: { id: id },
		});
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}
		return organisation;
	}

	async findAllUsersInOrganisation(organisationId: number): Promise<UserEntity[]> {
		return this.userRepository.find({
			where: { accessRights: { organisation: { id: organisationId } } },
			relations: ['accessRights'],
		})
	}

	async findAllNodesInOrganisation(organisationId: number): Promise<NodeEntity[]> {
		return this.nodeRepository.find({
			where: { organisation: { id: organisationId } },
		})
	}


	/**
	 * Creates a new organisation with the specified name and associates the authenticated user with administrative access rights.
	 *
	 * @param {UserEntity} authUser - The authenticated user who will be granted administrative rights to the newly created organisation.
	 * @param {string} organisationName - The name of the organisation to be created.
	 * @param encodedWalletSeed
	 * @return {Promise<OrganisationEntity>} A promise that resolves to the newly created organisation entity.
	 */
	async createByName(authUser: UserEntity, organisationName: string, encodedWalletSeed?: string): Promise<OrganisationEntity> {

		// create the organisation
		const item = this.organisationEntityRepository.create({
			name: organisationName,
		});
		
		// If a wallet seed is provided, we reject the creation of an organisation 
		// if we cannot decode it
		let wallet: WalletCrypto;
		if (typeof encodedWalletSeed === 'string' && encodedWalletSeed.trim().length > 0) {
			try {
				wallet = WalletCrypto.parseFromString(encodedWalletSeed);
			} catch (e) {
				if (e instanceof ParsingError) {
					throw new BadRequestException("Invalid seed provided");
				}
				throw new InternalServerErrorException(e);
			}
		} else {
			this.logger.log("No seed provided: use a randomly chosen one")
			wallet = WalletCrypto.generateWallet();
		}

		// update the created organization with the wallet seed and the public key.


		// log the public key of the organization being created
		const sigEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = wallet.getPrivateSignatureKey().getPublicKey();
		const encodedPublicKey = sigEncoder.encodePublicKey(publicKey);
		item.walletSeed = wallet.encode();
		this.logger.log(`Creating organization ${organisationName} with pk: ${encodedPublicKey}`);
		const organisation = await this.organisationEntityRepository.save(item);

		// we create an initial access right with the provided public key
		const accessRight = this.accessRightRepository.create({
			organisation,
			user: authUser,
			editApplications: true,
			editUsers: true,
		})
		await this.accessRightRepository.save(accessRight);

		// we now attempt to synchronize the organization with the data on chain
		return await this.synchronizeOrganizationWithApplicationsAndNodesFromChain(organisation);
	}

	/**
	 * This method synchronizes the local organization and its applications and nodes with data stored on the chain.
	 *
	 * Note: This method *mutates* the local data and returns the updated organization.
	 * @param organization
	 */
	async synchronizeOrganizationWithApplicationsAndNodesFromChain(organization: OrganisationEntity) {
		try {
			await this.mutateOrganizationFromDataOnChain(organization);
			await this.mutateApplicationsOfOrganizationFromDataOnChain(organization);
			await this.mutateNodesOfOrganizationFromDataOnChain(organization);
		} catch (e) {
			// In case where the node cannot be contacted, which may happen
			if (e instanceof NodeConnectionRefusedError || e instanceof NodeEndpointClosedWhileCatchingUpError) {
				this.logger.log(`Unable to connect to the node: ${e.message}`);
			} else {
				throw new InternalServerErrorException(e);
			}
		}

		return organization;
	}



	async removeUserFromOrganisation(organisationId: number, userPublicKey: string) {
		// search for the access right entity
		return await this.accessRightRepository.delete({
			user: { publicKey: userPublicKey },
			organisation: { id: organisationId },
		});
	}


	async getNumberOfApplicationsInOrganisation(organisationId: number) {
		return this.applicationRepository.count({
			where: { organisation: { id: organisationId } },
		})
	}

	async getNumberOfUsersInOrganisation(organisationId: number) {
		return this.accessRightRepository
			.count({
				where: { organisation: { id: organisationId } },
			})
	}


	async findOrganisationsByUser(user: UserEntity) {
		return this.organisationEntityRepository.find({
			where: { accessRights: { user: { publicKey: user.publicKey } } }
		})
	}

	async publishOrganisation(organisationId: number) {
		this.logger.debug(`Publishing organisation with id ${organisationId}`)
		const organisation: OrganisationEntity = await this.organisationEntityRepository.findOneBy({ id: organisationId });
		try {
			// attempt to publish the organisation
			const microBlockHash = await this.chainService.publishOrganisation(organisation);
			this.logger.debug(`Micro-block hash: ${microBlockHash.encode()}`)

			// init the organisation chain status if first micro-block
			if ( !organisation.virtualBlockchainId ) {
				organisation.virtualBlockchainId = microBlockHash.encode();
			}

			// update the organisation
			organisation.published = true;
			organisation.isDraft = false;
			organisation.publishedAt = new Date();
			return await this.updateOrganisation(organisation, organisation);
		} catch (e) {
			this.logger.debug(`Publication error: ${e}`, e.stack);
			return await this.updateOrganisation(organisation, organisation);
			if (e.code === 'ECONNREFUSED') {
				throw new InternalServerErrorException("Cannot connect to the node.");
			} else {
				throw new UnprocessableEntityException(e)
			}
		}

	}

	async updateOrganisation(organisation: OrganisationEntity, update: Partial<OrganisationEntity>) {
		// Merge the updates into the existing organisation entity
		const updatedOrganisation = this.organisationEntityRepository.merge(organisation, update);

		// Save the updated organisation back to the database
		updatedOrganisation.isDraft = true;
		return this.organisationEntityRepository.save(updatedOrganisation);
	}

	async isPublished(organisationId: number) {
		const organisation = await this.organisationEntityRepository.findOneBy({ id: organisationId });
		if (!organisation) {
			throw new NotFoundException(`Organisation with id ${organisationId} not found`);
		}
		return organisation.published;
	}

	async findOrganisationFromApplicationVirtualBlockchainId(applicationId: string) {

		const application = await this.applicationRepository
			.createQueryBuilder('app')
			.innerJoinAndSelect('app.organisation', 'organisation')
			.where('app.virtualBlockchainId = :applicationId', { applicationId })
			.getOne();

		if (!application) {
			throw new NotFoundException(`No application found with virtualBlockchainId: ${applicationId}`);
		}

		return application.organisation!;
	}

	async findOrganisationFromVirtualBlockchainId(organisationId: string) {

		const organisation = await this.organisationEntityRepository
			.createQueryBuilder('organisation')
			.where('organisation.virtualBlockchainId = :organisationId', { organisationId })
			.getOne();

		if (!organisation) {
			throw new NotFoundException(`No organisation found with virtualBlockchainId: ${organisationId}`);
		}

		return organisation;
	}

	async getOrganisationByApplicationId(applicationId: number) {
		return this.organisationEntityRepository.findOneOrFail({
			relations: ['applications'],
			where: {
				applications: {
					id: applicationId
				}
			}
		})
		/*
		return this.organisationEntityRepository.createQueryBuilder('organisation')
			.innerJoin('organisation.applications', 'application')
			.where('application.id = :applicationId', { applicationId })
			.getOneOrFail();

		 */
	}



	/**
	 * Deletes an organisation using the specified organisation ID.
	 *
	 * @param {number} organisationId - The unique identifier of the organisation to be deleted.
	 * @return {Promise<void>} A promise that resolves when the organisation is successfully deleted.
	 * @throws {NotFoundException} Throws an error if the organisation with the specified ID is not found.
	 */
	async deleteOrganisationById(organisationId: number): Promise<void> {
		const organisation = await this.organisationEntityRepository.findOneBy({ id: organisationId });

		if (!organisation) {
			throw new NotFoundException(`Organisation with id ${organisationId} not found`);
		}
		await this.organisationEntityRepository.remove(organisation);
	}

	/**
	 * Erases the publication information of the given organisation entity.
	 *
	 * @param {OrganisationEntity} organisation - The organisation entity whose publication details need to be erased.
	 * @return {Promise<void>} A promise that resolves when the organisation entity is successfully updated.
	 */
	async erasePublicationInformation(organisation: OrganisationEntity) {
		organisation.published = false;
		organisation.version = 0;
		organisation.virtualBlockchainId = null;
		organisation.publishedAt = null;
		organisation.isDraft = true;
		await this.organisationEntityRepository.save(organisation);

		// erase publication status of existing applications
		const applications = await this.applicationRepository.createQueryBuilder('application')
			.innerJoin('application.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId: organisation.id })
			.getMany();

		for (const application of applications) {
			await this.eraseApplicationPublicationStatus(application)
		}
	}

	async eraseApplicationPublicationStatus(application: ApplicationEntity) {
		application.virtualBlockchainId = null;
		application.isDraft = true;
		application.publishedAt = null;
		application.version = 0;
		application.published = false;
		await this.applicationRepository.save(application);
	}

	async addUserInOrganisation(organisationId: number, userPublicKey: string) {
		this.logger.debug(`Adding user with public key ${userPublicKey} into organisation ${organisationId}`);
		// find organisation and user
		const [organisation, user, userInOrganisation] = await Promise.all([
			this.findOne(organisationId),
			this.userRepository.findOne({ where: { publicKey: userPublicKey } }),
			this.accessRightRepository.exists({
				where: {
					organisation: { id: organisationId },
					user: { publicKey: userPublicKey }
				}
			})
		])

		// the organisation and user should exist
		if (!organisation || !user) throw new NotFoundException();

		// check that the user does not exist already in the organisation
		if (userInOrganisation) {
			throw new BadRequestException('User already exists in the organisation.');
		}

		// add the user in organisation
		const accessRight = new OrganisationAccessRightEntity();
		accessRight.organisation = organisation;
		accessRight.user = user;
		return this.accessRightRepository.save(accessRight);
	}

	async checkUserBelongsToOrganisation(user: UserEntity, organisation: OrganisationEntity) {
		return this.accessRightRepository.exists({
			where: {
				user: { publicKey: user.publicKey },
				organisation: { id: organisation.id },
			}
		})
	}

	async findOrganisationByApplication(application: ApplicationEntity) {
		return this.organisationEntityRepository.findOne({
			where: { applications: { id: application.id } }
		})
	}

	async importNodeInOrganisation(organisationId: number, nodeAlias: string, nodeRpcEndpoint: string) {
		const organisation = await this.findOne(organisationId);
		return this.nodeService.importNode(organisation, nodeAlias, nodeRpcEndpoint)
	}


	async mutateOrganizationFromDataOnChain(organization: OrganisationEntity) {
		await this.chainService.mutateOrganizationFromDataOnChain(organization);
		await this.organisationEntityRepository.save(organization);
	}

	async mutateApplicationsOfOrganizationFromDataOnChain(organization: OrganisationEntity) {
		// we now attempt to fetch applications associated with the organization
		const fetchedApplicationsFromChain = await this.chainService.fetchApplicationsAssociatedWithOrganizationsFromChain(
			organization,
		);

		// for the moment, we only save applications that are not found on database
		for (const fetchedApplication of fetchedApplicationsFromChain) {
			const isContainedInLocalDatabase = await this.applicationRepository.existsBy({
				virtualBlockchainId: fetchedApplication.virtualBlockchainId,
			});
			if (!isContainedInLocalDatabase) {
				await this.applicationRepository.save(fetchedApplication);
			} else {
				const localApplication = await this.applicationRepository.findOneBy({
					virtualBlockchainId: fetchedApplication.virtualBlockchainId,
				})
				await this.applicationRepository.save({
					...localApplication,
					...fetchedApplication
				})
			}
		}
	}

	async mutateNodesOfOrganizationFromDataOnChain(organization: OrganisationEntity) {
		// we now attempt to fetch nodes associated with the organization
		const fetchedNodesFromChain = await this.chainService.fetchNodesAssociatedWithOrganizationFromChain(
			organization,
		)
		this.logger.log(`Fetched nodes: ${fetchedNodesFromChain}`)
		await this.nodeRepository.save(fetchedNodesFromChain)
	}

	isMemberOfOrganization(orgId: number, publicKey: string) {
		return OrganisationEntity.existsBy({
			id: orgId,
			accessRights: {
				user: { publicKey: publicKey }
			}
		})
	}
}