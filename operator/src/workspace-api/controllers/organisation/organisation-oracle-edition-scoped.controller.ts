import {
	Body,
	Controller,
	Delete, ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import {
	CanEditApplications,
	CanEditOracles,
	IsAdminInOrganisation,
} from '../../guards/user-has-valid-access-right.guard';
import { UpdateOracleDto } from '../../dto/update-oracle.dto';
import { OracleEntity } from '../../entities/oracle.entity';
import { plainToInstance } from 'class-transformer';
import { AuditOperation, EntityType } from '../../entities/audit-log.entity';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';
import { ApplicationService } from '../../services/application.service';
import { AuditService } from '../../services/audit.service';
import { OracleService } from '../../services/oracle.service';

@UseGuards(UserInOrganisationGuard, CanEditOracles)
@Controller('/workspace/api/organisation')
export class OrganisationOracleEditionScopedController {
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userService: UserService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly oracleService: OracleService,
	) {}

	@Put(":organisationId/oracle/:oracleId")
	async updateOracleInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('oracleId') oracleId: number,
		@Body() oracleDto: UpdateOracleDto
	) {
		const oracle: OracleEntity = plainToInstance(OracleEntity, oracleDto);
		console.log("oracle to update", oracleDto)
		oracle.isDraft = true;
		const success = await this.oracleService.update(oracleId, oracle);
		if ( success ) {
			this.auditService.log(
				EntityType.ORACLE,
				organisationId,
				AuditOperation.ORGANISATION_EDITION,
				{ name: oracle.name }
			)
		}
	}


	/**
	 * Create a new Oracle entry for a specific organisation
	 * @param organisationId ID of the organisation
	 * @param body Request body containing Oracle name
	 * @returns The created Oracle entity
	 */
	@Post(':organisationId/oracle')
	async createOracleFromNameInOrganisation(
		@Param('organisationId') organisationId: number,
		@Body('name') name: string
	): Promise<OracleEntity> {
		const organisation = await this.organisationService.findOne(organisationId);
		return this.oracleService.createOracleByName(organisation, name);
	}

	/**
	 * Delete a specific Oracle by its ID
	 * @param organisationId ID of the organisation
	 * @param oracleId ID of the Oracle
	 * @returns The deleted Oracle entity
	 */
	@Delete(':organisationId/oracle/:oracleId')
	async deleteOracle(@Param('organisationId') organisationId: number, @Param('oracleId') oracleId: number): Promise<OracleEntity> {
		return this.oracleService.deleteOracleById(oracleId);
	}

	/**
	 * Update an existing Oracle by its ID
	 * @param organisationId ID of the organisation
	 * @param oracleId ID of the Oracle
	 * @param updateData
	 * @returns The updated Oracle entity
	 */
	@Put(':organisationId/oracle/:oracleId')
	async updateOracle(
		@Param('organisationId') organisationId: number,
		@Param('oracleId') oracleId: number,
		@Body() updateData: Partial<OracleEntity>
	): Promise<void> {
		const oracle = await this.oracleService.getOracleById(oracleId);
		if (!oracle) throw new NotFoundException('Oracle not found');
		Object.assign(oracle, updateData);
		await this.oracleService.updateOracle(oracle);
	}


	@UseGuards(IsAdminInOrganisation)
	@Post(":organisationId/oracle/:oracleId/publish")
	async publishOracle(
		@Param('organisationId') organisationId: number,
		@Param('oracleId') oracleId: number,
	) {
		// reject the publication of an application if the organisation is not published itself
		const organisationIsPublished = await this.organisationService.isPublished(organisationId);
		if (!organisationIsPublished) throw new ForbiddenException("Publish first the organisation before to publish an oracle.")


		try {
			await this.oracleService.publishOracle(oracleId);
		} catch (e) {
			console.error(e)
			throw new InternalServerErrorException();
		}
	}

}
