import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AnchorWithWalletDto } from '../dto/anchor.dto';

@Entity()
export class AnchorRequestEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	status: 'pending' | 'completed' | 'failed' = 'pending';

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column()
	dataId: string;

	@Column()
	organisationId: number;

	/**
	 * This application id refers to the local id of the application, not the hash of the application on the chain.
	 */
	@Column()
	applicationId: number;


	@Column({ type: 'json' })
	request: AnchorWithWalletDto;

	isPending(): boolean {
		return this.status === 'pending';
	}
}
