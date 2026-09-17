import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { WalletEntity } from '../../entities/WalletEntity';
import { WalletService } from '../../services/WalletService';
import { WalletDto, WalletWithSeedDto } from '../../dto/admin/WalletDto';
import { WalletUpdateDto } from '../../dto/admin/WalletUpdateDto';

@ApiTags('Wallets')
@ApiSecurity('api-key')
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/wallet`)
export class OperatorAdminApiWalletController {
	constructor(public service: WalletService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new wallet' })
	@ApiResponse({ status: 201, description: 'Wallet created successfully', type: WalletWithSeedDto })
	async create(@Body() dto: WalletWithSeedDto): Promise<WalletWithSeedDto> {
		const wallet = await WalletEntity.save({
			...dto,
		});
		return plainToInstance(WalletWithSeedDto, wallet, { excludeExtraneousValues: true });
	}

	@Post('seed')
	@ApiOperation({ summary: 'Generate a fresh, randomly-seeded wallet secret (not persisted)' })
	@ApiResponse({ status: 201, description: 'Freshly generated seed' })
	generateSeed(): { seed: string } {
		return { seed: this.service.generateSeed() };
	}

	@Get()
	@ApiOperation({ summary: 'Get all wallets' })
	@ApiResponse({ status: 200, description: 'List of wallets', type: [WalletDto] })
	async getAll(): Promise<WalletDto[]> {
		const wallets = await this.service.find();
		return plainToInstance(WalletDto, wallets, { excludeExtraneousValues: true });
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a wallet by ID' })
	@ApiResponse({ status: 200, description: 'Wallet details', type: WalletDto })
	async getOne(@Param('id', ParseIntPipe) id: number): Promise<WalletDto> {
		const wallet = await this.service.getOneById(id);
		return plainToInstance(WalletDto, wallet, { excludeExtraneousValues: true });
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a wallet (partial: only provided fields are changed)' })
	@ApiResponse({ status: 200, description: 'Wallet updated successfully', type: WalletDto })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: WalletUpdateDto,
	): Promise<WalletDto> {
		const wallet = await this.service.updateWallet(id, dto);
		return plainToInstance(WalletDto, wallet, { excludeExtraneousValues: true });
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update a wallet (alias of PATCH: still a partial merge, seed/scheme ids are never touched)' })
	@ApiResponse({ status: 200, description: 'Wallet updated successfully', type: WalletDto })
	async replace(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: WalletUpdateDto,
	): Promise<WalletDto> {
		const wallet = await this.service.updateWallet(id, dto);
		return plainToInstance(WalletDto, wallet, { excludeExtraneousValues: true });
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a wallet (refused if applications or API keys still depend on it)' })
	@ApiResponse({ status: 200, description: 'Wallet deleted successfully' })
	@ApiResponse({ status: 409, description: 'Wallet has dependent applications or API keys' })
	async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.service.deleteWallet(id);
	}
}
