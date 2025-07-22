import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { OrganisationService } from '../../shared/services/OrganisationService';

@Injectable()
export class OrganisationByIdPipe implements PipeTransform {
	constructor(private readonly organisationService: OrganisationService) {
	}

	async transform(value: number, metadata: ArgumentMetadata) {
		const org = await this.organisationService.findOne(value);
		if (!org) {
			throw new NotFoundException(`Organisation with id ${value} not found`);
		}
		return org;
	}
}