import { Injectable, NotFoundException } from '@nestjs/common';
import { NodeEntity } from '../entities/NodeEntity';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ChainService from './ChainService';
import { CMTSToken } from '@cmts-dev/carmentis-sdk/server';

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

	async updateNode(organisation: OrganisationEntity, nodeId: number, nodeAlias: string, nodeRpcEndpoint: string): Promise<NodeEntity> {
		const node = await this.nodeRepository.findOne({
			where: {
				id: nodeId,
				organisation: { id: organisation.id }
			}
		});

		if (!node) {
			throw new NotFoundException(`Node with id ${nodeId} not found in organisation ${organisation.id}`);
		}

		node.nodeAlias = nodeAlias;
		node.rpcEndpoint = nodeRpcEndpoint;

		return this.nodeRepository.save(node);
	}

	async claimNodeById(organisation: OrganisationEntity, nodeId: number): Promise<NodeEntity> {
		const node = await this.nodeRepository.findOne({
			where: {
				id: nodeId,
				organisation: { id: organisation.id }
			}
		});

		if (!node) {
			throw new NotFoundException(`Node with id ${nodeId} not found in organisation ${organisation.id}`);
		}

		const nodeVirtualBlockchainId = await this.chainService.claimNode(organisation, node);
		node.virtualBlockchainId = nodeVirtualBlockchainId.encode();
		return this.nodeRepository.save(node);
	}

	async stakeNodeById(organisation: OrganisationEntity, nodeId: number, amount: string): Promise<NodeEntity> {
		const node = await this.nodeRepository.findOne({
			where: {
				id: nodeId,
				organisation: { id: organisation.id }
			}
		});

		if (!node) {
			throw new NotFoundException(`Node with id ${nodeId} not found in organisation ${organisation.id}`);
		}

		const stakeAmount = CMTSToken.createCMTS(Number(amount));
		await this.chainService.stakeNode(organisation, node, stakeAmount);
		return node;
	}

	async cancelStakeNodeById(organisation: OrganisationEntity, nodeId: number, amount: string): Promise<NodeEntity> {
		const node = await this.nodeRepository.findOne({
			where: {
				id: nodeId,
				organisation: { id: organisation.id }
			}
		});

		if (!node) {
			throw new NotFoundException(`Node with id ${nodeId} not found in organisation ${organisation.id}`);
		}

		await this.chainService.cancelStakeNode(organisation, node, amount);
		return node;
	}

	async getOrganisationIdByNodeId(nodeId: number) {
		const org = await OrganisationEntity.findOne({
			where: {
				nodes: {
					id: nodeId
				}
			},
			select: ['id']
		});
		return org.id;
	}
}