import { GraphQLJwtAuthGuard } from '../../../guards/GraphQLJwtAuthGuard';
import { UseGuards } from '@nestjs/common';

@UseGuards(GraphQLJwtAuthGuard)
export class JwtProtectedResolver {
	constructor() {
	}
}