import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class WalletService extends TypeOrmCrudService<WalletEntity> {
	constructor(
		@InjectRepository(WalletEntity)
		repo: Repository<WalletEntity>,
	) {
		super(repo);
	}
}
