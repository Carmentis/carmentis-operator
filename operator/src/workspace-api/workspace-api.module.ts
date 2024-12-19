import { Module } from '@nestjs/common';
import { WorkspaceApiController } from './workspace-api.controller';
import PackageConfigService from '../package.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AdministrationService } from './services/administration.service';
import { OrganisationService } from './services/organisation.service';
import { AdminController } from './admin/admin.controller';
import { OrganisationEntity } from './entities/organisation.entity';
import { OrganisationAccessRightEntity } from './entities/organisation-access-right.entity';
import { UserService } from './services/user.service';
import {OrganisationController} from "./controllers/organisation.controller";
import {SearchController} from "./controllers/search.controller";
import {UserController} from "./controllers/user.controller";
import {ApplicationEntity} from "./entities/application.entity";
import {ApplicationService} from "./services/application.service";

@Module({
	imports: [TypeOrmModule.forFeature([
		UserEntity,
		OrganisationEntity,
		OrganisationAccessRightEntity,
		ApplicationEntity
	])],
	controllers: [WorkspaceApiController, AdminController, OrganisationController, SearchController, UserController],
	providers: [PackageConfigService, AdministrationService, OrganisationService, UserService, ApplicationService],
})
export class WorkspaceApiModule {
}
