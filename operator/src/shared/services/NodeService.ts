import { Injectable } from '@nestjs/common';
import { NodeEntity } from '../entities/NodeEntity';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ChainService from './ChainService';

@Injectable()
export class NodeService {

	constructor(
		@InjectRepository(NodeEntity)
		private readonly nodeRepository: Repository<NodeEntity>,
		private readonly chainService: ChainService,
	) {}


	importNode(organisation: OrganisationEntity, nodeAlias: string, nodeRpcEndpoint: string) {
		const node: NodeEntity = this.nodeRepository.create({
			nodeAlias,
			rpcEndpoint: nodeRpcEndpoint,
			organisation: organisation,
		})
		return this.nodeRepository.save(node)
	}

	async claimNode(organisation: OrganisationEntity, node: NodeEntity) {
		const virtualBlockchainId = await this.chainService.claimNode(organisation, node);
		node.setVirtualBlockchainId(virtualBlockchainId);
		return this.nodeRepository.save(node)
	}

	removeNode(organisation: OrganisationEntity, node: NodeEntity) {
		return this.nodeRepository.delete({id: node.id})
	}

	deleteNode(organisation: OrganisationEntity, nodeId: number) {
		return this.nodeRepository.delete({id: nodeId})
	}
}