import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';

const NOT_FOUND_MESSAGE = 'Not Found';

/**
 * Controller for handling search-related API endpoints within the workspace.
 */
@Controller('/workspace/api/search')
export class SearchController {
	constructor(
		private readonly userService: UserService,
	) {
	}


	/**
     * Searches for a user based on the provided query string.
     *
     * @param {string} query - The query string to search for the user.
     * @return {Promise<any>} A promise that resolves with the search results.
     */
    @Get('/user')
	async searchUser(
		@Query('query') query: string,
	): Promise<any> {
		this.validateQuery(query);
		return await this.userService.search(query);
	}

	private validateQuery(query: string): void {
		if (query === '') {
			throw new HttpException(NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND);
		}
	}
}