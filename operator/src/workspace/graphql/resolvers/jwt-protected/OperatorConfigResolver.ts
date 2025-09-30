import { GraphQLJwtAuthGuard } from '../../../guards/GraphQLJwtAuthGuard';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { EnvService } from '../../../../shared/services/EnvService';
import { Query } from '@nestjs/graphql';
import { JwtProtectedResolver } from './JwtProtectedResolver';


@Injectable()
export class OperatorConfigResolver extends JwtProtectedResolver {
	private logger = new Logger(OperatorConfigResolver.name);

	constructor(
		private readonly envService: EnvService
	) { super() }


	@Query(() => String, { name: 'getLinkedNode' })
	async getLinkedNode() {
		return this.envService.nodeUrl;
	}
}