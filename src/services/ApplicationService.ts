import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationUpdateDto } from '../dto/ApplicationUpdateDto';


@Injectable()
export class ApplicationService {

    private logger = new Logger(ApplicationService.name);
    constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
    ) {
    }


	async findApplicationByVbId(applicationVbId: string) {
		return ApplicationEntity.findOne({
			where: {
				vbId: applicationVbId
			},
			relations: ['wallet']
		});
	}

	/** Only `name` is editable — see ApplicationUpdateDto for why `vbId`/`wallet` are not. */
	async updateApplication(vbId: string, dto: ApplicationUpdateDto): Promise<ApplicationEntity> {
		const application = await this.applicationRepository.findOneBy({ vbId });
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		application.name = dto.name;
		return this.applicationRepository.save(application);
	}

	async countDependents(vbId: string): Promise<{ apiKeys: number; anchorRequests: number }> {
		const [apiKeys, anchorRequests] = await Promise.all([
			ApiKeyEntity.count({ where: { application: { vbId } } }),
			AnchorRequestEntity.count({ where: { application: { vbId } } }),
		]);
		return { apiKeys, anchorRequests };
	}

	/** Refuses to delete an application that still has API keys or anchoring history
	 * attached, rather than silently letting the DB's `onDelete: CASCADE` wipe them out. */
	async deleteApplication(vbId: string): Promise<void> {
		const application = await this.applicationRepository.findOneBy({ vbId });
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		const { apiKeys, anchorRequests } = await this.countDependents(vbId);
		if (apiKeys > 0 || anchorRequests > 0) {
			throw new ConflictException(
				`Cannot delete this application: ${apiKeys} API key(s) and ${anchorRequests} anchor request(s) still depend on it. Delete them first.`,
			);
		}
		await this.applicationRepository.delete({ vbId });
	}

}
