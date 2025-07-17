import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
	EncoderFactory,
	MessageSerializer,
	MessageUnserializer,
	SCHEMAS,
	wiServer,
} from '@cmts-dev/carmentis-sdk/server';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	namespace: '/',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class OperatorApiGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger(OperatorApiGateway.name);
	private wi : wiServer = new wiServer();

	afterInit(server: Server): any {}

	handleConnection(socket: Socket, message: any): any {
		this.logger.debug(`-> socket connection: ${socket.id}`)
	}

	@SubscribeMessage("data")
	handleRequest(client: Socket, data: any): any {
		this.logger.debug(`-> socket message: ${client.id}`)

		// parse the message and process the request
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const schemaSerializer = new MessageUnserializer(SCHEMAS.WI_MESSAGES);
		const binaryRequest = encoder.decode(data);
		const {type, object} = schemaSerializer.unserialize(binaryRequest);
		const answer = this.wi.handleRequest(client, type, object);


		// encode and send the response
		const unserializer = new MessageSerializer(SCHEMAS.WI_MESSAGES);
		const  binaryResponse = unserializer.serialize(answer.scheme, answer.message);
		const response = encoder.encode(binaryResponse);
		client.emit("data", response);
	}



	handleDisconnect(client: Socket): any {
		this.logger.debug(`<- socket disconnection: ${client.id}`)
	}


}