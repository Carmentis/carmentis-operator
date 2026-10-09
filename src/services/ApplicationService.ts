import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { WalletEntity } from '../entities/WalletEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationCreationDto } from '../dto/ApplicationCreationDto';
import { ApplicationUpdateDto } from '../dto/ApplicationUpdateDto';


@Injectable()
export class ApplicationService {

    private logger = new Logger(ApplicationService.name);
    constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
    ) {
    }


	async findApplicationByVbId(applicationVbId: string) {
		return ApplicationEntity.findOne({
			where: {
				vbId: applicationVbId
			},
			relations: {
				wallet: true
			}
		});
	}

	/** Creates a local application (not published): the organization must belong to the wallet. */
	async createApplication(dto: ApplicationCreationDto): Promise<ApplicationEntity> {
		const wallet = await this.walletRepository.findOneBy({ id: dto.walletId });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		const organization = await this.organizationRepository.findOneBy({
			id: dto.organizationId,
			wallet: { id: wallet.id },
		});
		if (!organization) {
			throw new BadRequestException('The organization does not exist or does not belong to this wallet');
		}
		return this.applicationRepository.save(
			this.applicationRepository.create({
				name: dto.name,
				description: dto.description ?? '',
				homepageUrl: dto.homepageUrl ?? '',
				logoUrl: dto.logoUrl ?? '',
				wallet,
				organization,
			}),
		);
	}

	/** `vbId`, `wallet` and `organization` are not editable, see ApplicationUpdateDto. The change
	 * is local: publishing again pushes it on-chain. */
	async updateApplication(id: number, dto: ApplicationUpdateDto): Promise<ApplicationEntity> {
		const application = await this.applicationRepository.findOneBy({ id });
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		Object.assign(application, dto);
		return this.applicationRepository.save(application);
	}

	async countDependents(id: number): Promise<{ apiKeys: number; anchorRequests: number }> {
		const [apiKeys, anchorRequests] = await Promise.all([
			ApiKeyEntity.count({ where: { application: { id } } }),
			AnchorRequestEntity.count({ where: { application: { id } } }),
		]);
		return { apiKeys, anchorRequests };
	}

	/** Refuses to delete an application that still has API keys or anchoring history
	 * attached, rather than silently letting the DB's `onDelete: CASCADE` wipe them out.
	 * Only the local registry entry is removed: a published application stays on-chain. */
	async deleteApplication(id: number): Promise<void> {
		const application = await this.applicationRepository.findOneBy({ id });
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		const { apiKeys, anchorRequests } = await this.countDependents(id);
		if (apiKeys > 0 || anchorRequests > 0) {
			throw new ConflictException(
				`Cannot delete this application: ${apiKeys} API key(s) and ${anchorRequests} anchor request(s) still depend on it. Delete them first.`,
			);
		}
		await this.applicationRepository.delete({ id });
	}

}
