import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { wiServer } from '@cmts-dev/carmentis-sdk/server';

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
		this.wi = new wiServer(server);
	}
}