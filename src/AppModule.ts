import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorApiModule } from './OperatorApiModule';
import { OperatorConfigModule } from './config/OperatorConfigModule';
import DataSourceOptions from './database/DataSourceOptions';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports: [
		OperatorConfigModule,
		OperatorApiModule,
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 1000,
				},
			],
		}),
		TypeOrmModule.forRoot(DataSourceOptions),
	],
})
export class AppModule {
}
