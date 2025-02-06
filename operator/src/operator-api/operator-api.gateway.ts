import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit
} from '@nestjs/websockets';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpCode, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';

@WebSocketGateway({
	namespace: '/',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class OperatorApiGateway implements OnGatewayInit {

	@WebSocketServer() server: Server;
	private wi : any;

	constructor() {}

	afterInit(server: Server): any {
		this.wi = new sdk.wiServer(server);
	}
}