import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { Repository } from 'typeorm';
import { OrganisationEntity } from '../entities/organisation.entity';
import { OracleEntity } from '../entities/oracle.entity';
import ChainService from './chain.service';
import { OrganisationService } from './organisation.service';
import { EnvService } from './env.service';

/**
 * The OracleService provides methods to perform CRUD operations
 * and query-related actions on the OracleEntity.
 */
@Injectable()
export class OracleService {
	constructor(
		@InjectRepository(OracleEntity)
		private readonly oracleRepository: Repository<OracleEntity>,
		private readonly chainService: ChainService,
		private readonly organisationService: OrganisationService,
		private readonly envService: EnvService,
	) {
	}


	/**
	 * Creates a new OracleEntity with the given name and associates it with the provided organisation.
	 *
	 * @param {OrganisationEntity} organisation - The organisation to associate with the newly created OracleEntity.
	 * @param {string} name - The name of the OracleEntity to create.
	 * @return {Promise<OracleEntity>} A promise that resolves to the newly created and saved OracleEntity.
	 */
	async createOracleByName( organisation: OrganisationEntity, name: string ): Promise<OracleEntity> {

		// Check if the organisation has reached its limit of 30 oracles
		const oracleCount = await this.getNumberOfOraclesInOrganisation(organisation.id);
		if (oracleCount >= this.envService.maxOraclesInOrganisation) {
			throw new UnauthorizedException('The organisation has reached the limit of oracles.');
		}


		
		const item = this.oracleRepository.create({
			name: name,
		});
		item.organisation = organisation;
		return this.oracleRepository.save(item);
	}

	/**
	 * Deletes an oracle entity based on the provided oracle ID.
	 *
	 * @param {number} oracleId - The unique identifier of the oracle entity to be deleted.
	 * @return {Promise<OracleEntity>} - A promise that resolves to the deleted oracle entity.
	 * @throws {NotFoundException} - Throws an exception if the oracle entity is not found.
	 */
	async deleteOracleById( oracleId: number ) : Promise<OracleEntity> {
		const oracle = this.oracleRepository.findOneBy({id: oracleId});
		if ( !oracle ) { throw new NotFoundException('oracle not found!'); }
		await this.oracleRepository.delete({id: oracleId});
		return oracle;
	}

	/**
	 * Retrieves all Oracle entities associated with a specific organisation.
	 *
	 * @param {number} organisationId - The unique identifier of the organisation.
	 * @return {Promise<OracleEntity[]>} A promise that resolves to an array of OracleEntity objects associated with the organisation.
	 */
	async getAllOraclesInOrganisation(organisationId: number) : Promise<OracleEntity[]> {
		return this.oracleRepository.createQueryBuilder('oracle')
			.innerJoin('oracle.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.select(['oracle.id', 'oracle.version', 'oracle.name', 'oracle.published', 'oracle.isDraft', 'oracle.publishedAt'])
			.getMany();
	}

	/**
	 * Retrieves an oracle entity by its unique identifier.
	 *
	 * @param {number} oracleId - The unique identifier of the oracle entity to retrieve.
	 * @return {Promise<OracleEntity>} A promise that resolves to the oracle entity associated with the provided ID.
	 */
	async getOracleById( oracleId: number ) : Promise<OracleEntity> {
		return this.oracleRepository.findOneByOrFail({id: oracleId});
	}


	/**
	 * Updates the specified OracleEntity in the OracleRepository.
	 *
	 * @param {OracleEntity} oracle - The OracleEntity instance containing updated information to be persisted.
	 *                                The `id` property is used to identify the record to update.
	 * @return {Promise<UpdateResult>} A promise that resolves to the result of the update operation in OracleRepository.
	 */
	async updateOracle(oracle: OracleEntity) {
		return this.oracleRepository.update( {id: oracle.id} ,oracle);
	}

	/**
	 * Searches for oracles within a specific organisation based on a query string.
	 *
	 * @param {number} organisationId - The ID of the organisation to filter the search results.
	 * @param {string} query - The search string to match oracle names.
	 * @return {Promise<Array>} A promise that resolves with an array of oracles that match the search criteria, limited to 10 results.
	 */
	async search(organisationId: number, query: string) {
		return this.oracleRepository.createQueryBuilder('oracle')
			.select(['oracle.id', 'oracle.name'])
			.innerJoin('oracle.organisation', 'org')
			.where('oracle.name LIKE :query', { query: `%${query}%` })
			.andWhere('org.id = :organisationId', { organisationId })
			.limit(10)
			.getMany();
	}

	/**
	 * Retrieves the total count of oracles associated with a specific organisation.
	 *
	 * @param {number} organisationId - The unique identifier of the organisation.
	 * @return {Promise<number>} A promise that resolves to the number of oracles in the organisation.
	 */
	async getNumberOfOraclesInOrganisation(organisationId: number) {
		return this.oracleRepository.createQueryBuilder('oracle')
			.innerJoin('oracle.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.getCount();
	}

	/**
	 * Updates an existing OracleEntity in the repository.
	 *
	 * @param {number} oracleId - The unique identifier of the OracleEntity to be updated.
	 * @param {OracleEntity} oracle - The new OracleEntity data to merge with the existing entity.
	 * @return {Promise<OracleEntity>} A promise that resolves to the updated OracleEntity.
	 * @throws {NotFoundException} If no OracleEntity is found with the given identifier.
	 */
	async update(oracleId: number, oracle: OracleEntity) {
		const existingOracle = await this.oracleRepository.findOneBy({ id: oracleId });

		if (!existingOracle) {
			throw new NotFoundException(`Oracle with id ${oracleId} not found`);
		}

		const updatedOracle = this.oracleRepository.merge(existingOracle, oracle);

		return this.oracleRepository.save(updatedOracle);
	}

	async publishOracle(oracleId: number) {
		const oracle = await this.oracleRepository.findOneBy({
			id: oracleId,
		});
		const organisation = await this.organisationService.getOrganisationByOracleId(oracleId);
		try {
			const mb : MicroBlock = await this.chainService.publishOracle(organisation, oracle);
			oracle.isDraft = false;
			oracle.published = true;
			oracle.publishedAt = new Date();
			oracle.version += 1;
			oracle.organisation = organisation;
			if ( mb.header.height === 1 ) {
				oracle.virtualBlockchainId = mb.hash;
			}

			await this.oracleRepository.save(oracle);
		} catch (e) {
			if (e.code === 'ECONNREFUSED') {
				throw new InternalServerErrorException("Cannot connect to the node.");
			} else {
				throw new InternalServerErrorException(e)
			}
		}


	}


}
