import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { Repository } from 'typeorm';
import { OrganisationEntity } from '../entities/organisation.entity';
import { OracleEntity } from '../entities/oracle.entity';

@Injectable()
export class OracleService {
	constructor(
		@InjectRepository(OracleEntity)
		private readonly oracleRepository: Repository<OracleEntity>,
	) {
	}

	async createOracleByName( organisation: OrganisationEntity, name: string ): Promise<OracleEntity> {
		const item = this.oracleRepository.create({
			name: name,
		});
		item.organisation = organisation;
		return this.oracleRepository.save(item);
	}

	async deleteOracleById( oracleId: number ) : Promise<OracleEntity> {
		const oracle = this.oracleRepository.findOneBy({id: oracleId});
		if ( !oracle ) { throw new NotFoundException('oracle not found!'); }
		await this.oracleRepository.delete({id: oracleId});
		return oracle;
	}

	async getAllOraclesInOrganisation(organisationId: number) : Promise<OracleEntity[]> {
		return this.oracleRepository.createQueryBuilder('oracle')
			.innerJoin('oracle.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.getMany();
	}

	async getOracleById( oracleId: number ) : Promise<OracleEntity> {
		return this.oracleRepository.findOneBy({id: oracleId});
	}


	async updateOracle(oracle: OracleEntity) {
		return this.oracleRepository.update( {id: oracle.id} ,oracle);
	}

	async search(organisationId: number, query: string) {
		return this.oracleRepository.createQueryBuilder('oracle')
			.select(['oracle.id', 'oracle.name'])
			.innerJoin('oracle.organisation', 'org')
			.where('oracle.name LIKE :query', { query: `%${query}%` })
			.andWhere('org.id = :organisationId', { organisationId })
			.limit(10)
			.getMany();
	}
}
