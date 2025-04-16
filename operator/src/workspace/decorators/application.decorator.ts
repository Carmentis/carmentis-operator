import {
	ArgumentMetadata,
	createParamDecorator,
	ExecutionContext,
	Injectable,
	NotFoundException,
	PipeTransform,
} from '@nestjs/common';
import { ApplicationService } from '../../shared/services/application.service';
import { OrganisationService } from '../../shared/services/organisation.service';


@Injectable()
export class ApplicationByIdPipe implements PipeTransform {
	constructor(private readonly applicationService: ApplicationService) {}

	async transform(value: number, metadata: ArgumentMetadata) {
		const app = await this.applicationService.findApplication(value);
		if (!app) {
			throw new NotFoundException(`Application with id ${value} not found`);
		}
		return app;
	}
}

@Injectable()
export class OrganisationByIdPipe implements PipeTransform {
	constructor(private readonly organisationService: OrganisationService) {}

	async transform(value: number, metadata: ArgumentMetadata) {
		const org = await this.organisationService.findOne(value);
		if (!org) {
			throw new NotFoundException(`Organisation with id ${value} not found`);
		}
		return org;
	}
}