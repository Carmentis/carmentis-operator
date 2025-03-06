import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpException,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import { CanEditApplications, IsAdminInOrganisation } from '../../guards/user-has-valid-access-right.guard';
import { OrganisationService } from '../../../shared/services/organisation.service';
import { ApplicationService } from '../../../shared/services/application.service';
import { AuditService } from '../../../shared/services/audit.service';
import { ImportApplicationDto } from '../../dto/import-application.dto';
import { ApplicationEntity } from '../../../shared/entities/application.entity';
import { AuditOperation, EntityType } from '../../../shared/entities/audit-log.entity';
import { ApplicationDto } from '../../dto/application.dto';
import { plainToInstance } from 'class-transformer';
import { Public } from '../../decorators/public.decorator';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { EnvService } from '../../../shared/services/env.service';

@UseGuards(UserInOrganisationGuard, CanEditApplications)
@Controller('/workspace/api/organisation')
export class OrganisationApplicationEditionScopedController {

	private readonly logger = new Logger(OrganisationApplicationEditionScopedController.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly envService: EnvService,
	) {}

	@UseGuards(IsAdminInOrganisation)
	@Post(":organisationId/application/:applicationId/publish")
	async publishApplication(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	) {
		// reject the publication of an application if the organisation is not published itself
		const organisationIsPublished = await this.organisationService.isPublished(organisationId);
		if (!organisationIsPublished) throw new ForbiddenException("Publish first the organisation before to publish an application.")

		try {
			await this.applicationService.publishApplication(applicationId);
		} catch (e) {
			throw new InternalServerErrorException();
		}
	}



	@Post(':organisationId/application/import')
	async importApplication(
		@Param('organisationId') organisationId: number,
		@Body() importApplication: ImportApplicationDto
	): Promise<ApplicationEntity> {
		// create the application
		const result = await this.applicationService.importApplicationInOrganisation(
			organisationId,
			importApplication
		);

		// log the application creation
		if ( result ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_CREATION,
				{ name: importApplication.name }
			)
		}

		// return the created application
		return result
	}

	/**
	 * Update an application
	 *
	 */
	@Put(":organisationId/application/:applicationId")
	async updateApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
		@Body() applicationDto: ApplicationDto
	) {
		// create an application entity from the input DTO
		const application: ApplicationEntity = plainToInstance(ApplicationEntity, applicationDto);
		application.isDraft = true;
		console.log("update of application:", application)
		const success = await this.applicationService.update(application);
		if ( success ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_EDITION,
				{ name: application.name }
			)
		}
	}

	@Post(':organisationId/application')
	async createApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Body('applicationName') name: string,
	): Promise<ApplicationEntity> {
		const organisation = await this.organisationService.findOne(organisationId);
		if ( !organisation ) {
			throw new HttpException('Organisation not found', HttpStatus.NOT_FOUND);
		}
		const result = this.applicationService.createApplicationInOrganisationByName(
			organisation,
			name
		);

		if ( result ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_CREATION,
				{ name: name }
			)
		}


		return result;
	}

	@Delete(':organisationId/application/:applicationId')
	async deleteApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	): Promise<ApplicationEntity> {
		const deletedApplication = await this.applicationService.deleteApplicationById(applicationId);
		if ( deletedApplication ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_DELETION,
				{ name: deletedApplication.name }
			)
		}

		return deletedApplication;
	}

}