import {
	Body,
	Controller, Delete,
	HttpException, HttpStatus,
	InternalServerErrorException,
	Logger,
	Param,
	Post, Put,
	UseGuards,
} from '@nestjs/common';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import { CanEditApplications } from '../../guards/user-has-valid-access-right.guard';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';
import { ApplicationService } from '../../services/application.service';
import { AuditService } from '../../services/audit.service';
import { OracleService } from '../../services/oracle.service';
import { ImportApplicationDto } from '../../dto/import-application.dto';
import { ApplicationEntity } from '../../entities/application.entity';
import { AuditOperation, EntityType } from '../../entities/audit-log.entity';
import { ApplicationDto } from '../../dto/application.dto';
import { plainToInstance } from 'class-transformer';

@UseGuards(UserInOrganisationGuard, CanEditApplications)
@Controller('/workspace/api/organisation')
export class OrganisationApplicationEditionScopedController {

	private readonly logger = new Logger(OrganisationApplicationEditionScopedController.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userService: UserService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly oracleService: OracleService,
	) {}

	@Post(":organisationId/application/:applicationId/publish")
	async publishApplication(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	) {
		try {
			await this.applicationService.publishApplication(applicationId);
		} catch (e) {
			console.error(e)
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