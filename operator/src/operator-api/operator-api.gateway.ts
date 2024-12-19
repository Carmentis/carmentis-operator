import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpCode, HttpException, HttpStatus } from '@nestjs/common';

@WebSocketGateway({
	namespace: '/',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class OperatorApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	private clients: Set<Socket> = new Set();

	handleConnection(client: Socket) {
		this.clients.add(client);
		console.log('Client connected:', client.id);
	}

	handleDisconnect(client: Socket) {
		this.clients.delete(client);
		console.log('Client disconnected:', client.id);
	}

	@SubscribeMessage('data')
	handleMessage(@MessageBody() message: any) {
		console.log('Received message:', message);
		switch (message.id) {
			case 128:
				return this.onSdkConnection(message);
			default:
				console.error('Unkown message', message);
				throw new HttpException('Unkown message', HttpStatus.BAD_REQUEST);
		}
	}


	onSdkConnection(message: any) {
		return {
			success: true,
			data: {
				qrId: 'FFC12753425A51082049152035542376',
			},
		};
	}
}