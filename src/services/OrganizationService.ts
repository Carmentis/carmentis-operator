import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { WalletEntity } from '../entities/WalletEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganizationCreationDto } from '../dto/OrganizationCreationDto';
import { OrganizationUpdateDto } from '../dto/OrganizationUpdateDto';

@Injectable()
export class OrganizationService {
	constructor(
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
	) {}

	/** Creates a local organization (not published). */
	async createOrganization(dto: OrganizationCreationDto): Promise<OrganizationEntity> {
		const wallet = await this.walletRepository.findOneBy({ id: dto.walletId });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		return this.organizationRepository.save(
			this.organizationRepository.create({
				name: dto.name,
				city: dto.city,
				countryCode: dto.countryCode,
				website: dto.website,
				wallet,
			}),
		);
	}

	/** The change is local: publishing again pushes it on-chain. The wallet is not editable. */
	async updateOrganization(id: number, dto: OrganizationUpdateDto): Promise<OrganizationEntity> {
		const organization = await this.organizationRepository.findOneBy({ id });
		if (!organization) {
			throw new NotFoundException('Organization not found');
		}
		Object.assign(organization, dto);
		return this.organizationRepository.save(organization);
	}

	/** Refuses to delete an organization that still has applications. Only the local registry
	 * entry is removed: a published organization stays on-chain. */
	async deleteOrganization(id: number): Promise<void> {
		const organization = await this.organizationRepository.findOneBy({ id });
		if (!organization) {
			throw new NotFoundException('Organization not found');
		}
		const applications = await ApplicationEntity.count({ where: { organization: { id } } });
		if (applications > 0) {
			throw new ConflictException(
				`Cannot delete this organization: ${applications} application(s) still depend on it. Delete them first.`,
			);
		}
		await this.organizationRepository.delete({ id });
	}
}
