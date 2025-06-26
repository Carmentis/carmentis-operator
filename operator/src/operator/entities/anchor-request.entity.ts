import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AnchorWithWalletDto } from '../dto/anchor.dto';

@Entity()
export class AnchorRequestEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	status: 'pending' | 'success' | 'failed' = 'pending';

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column()
	dataId: string;

	@Column()
	organisationId: number;


	@Column({ type: 'json' })
	request: AnchorWithWalletDto;
}
