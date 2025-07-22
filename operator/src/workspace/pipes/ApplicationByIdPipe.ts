import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ApplicationService } from '../../shared/services/ApplicationService';

@Injectable()
export class ApplicationByIdPipe implements PipeTransform {
	constructor(private readonly applicationService: ApplicationService) {
	}

	async transform(value: number, metadata: ArgumentMetadata) {
		const app = await this.applicationService.findApplication(value);
		if (!app) {
			throw new NotFoundException(`Application with id ${value} not found`);
		}
		return app;
	}
}