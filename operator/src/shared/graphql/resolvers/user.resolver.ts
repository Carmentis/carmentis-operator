import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { CurrentUser } from '../../../workspace/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../../../workspace/guards/authentication.guards';

@UseGuards(GraphQLJwtAuthGuard)
@Resolver(() => UserEntity)
@Injectable()
export class UserResolver {
	constructor(private readonly userService: UserService) {
	}

	@Query(() => UserEntity, { name: 'getCurrentUser' })
	async getCurrentUser(@CurrentUser() user: UserEntity): Promise<UserEntity> {
		return user;
	}


	@Query(() => [UserEntity], { name: 'searchUser' })
	async searchUser(
		@Args('search', { type: () => String }) search: string
	){
			const results = await this.userService.search(search);
			return results
	}

	@Query(() => [UserEntity], { name: 'getAllUsers' })
	async getAllUsers(): Promise<UserEntity[]> {
		return this.userService.findAllUsers();
	}

	@Query(() => UserEntity, { name: 'getUserByPublicKey' })
	async getUserByPublicKey(@Args('publicKey', { type: () => String }) publicKey: string): Promise<UserEntity> {
		return this.userService.findOneByPublicKey(publicKey);
	}


	@Mutation(() => UserEntity, { name: 'createUser' })
	async createUser(
		@CurrentUser() currentUser: UserEntity,
		@Args('publicKey', { type: () => String }) publicKey: string,
		@Args('firstname', { type: () => String }) firstname: string,
		@Args('lastname', { type: () => String }) lastname: string,
		@Args('isAdmin', { type: () => Boolean }) isAdmin: boolean,
	): Promise<UserEntity> {
		// only administrator can create administrators
		if (!currentUser.isAdmin && isAdmin) {
			throw new UnauthorizedException('Only administrators can create administrators.');
		}

		return await this.userService.createUser({
			publicKey,
			firstname,
			lastname,
			isAdmin,
		});
	}

	@Mutation(() => UserEntity, { name: 'updateUserAdminStatus' })
	async updateUserAdminStatus(
		@CurrentUser() currentUser: UserEntity,
		@Args('publicKey', { type: () => String }) publicKey: string,
		@Args('isAdmin', { type: () => Boolean }) isAdmin: boolean,
	): Promise<UserEntity> {
		// only administrator can edit administrator status
		if (!currentUser.isAdmin && isAdmin) {
			throw new UnauthorizedException('Only administrators can edit administrator status.');
		}

		// find the user
		await this.userService.markAsAdmin(publicKey, isAdmin);
		return  await this.userService.findOneByPublicKey(publicKey);
	}


	@Mutation(() => UserEntity, { name: 'deleteUser' })
	async deleteUser(
		@CurrentUser() currentUser: UserEntity,
		@Args('publicKey', { type: () => String }) publicKey: string
	) {
		// only administrator can delete an administrator
		const deletedUser = await this.userService.findOneByPublicKey(publicKey);
		if (!currentUser.isAdmin && deletedUser.isAdmin) throw new UnauthorizedException('Only administrators can delete administrators.');
		await this.userService.deleteUser(publicKey);
		return deletedUser;
	}


}