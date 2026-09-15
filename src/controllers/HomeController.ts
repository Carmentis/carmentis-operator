import { Controller, Get, HttpStatus, Redirect, Res } from '@nestjs/common';
import { Public } from '../decorators/PublicDecorator';

@Controller()
export class HomeController {
	@Public()
	@Get()
	@Redirect('/admin')
	async index() {
	}
}