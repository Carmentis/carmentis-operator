import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
	ClientBridgeEncoder, ClientBridgeMessageType,
	EncoderFactory,
	MessageSerializer,
	MessageUnserializer,
	SCHEMAS, WalletRequestEncoder,
	wiServer,
} from '@cmts-dev/carmentis-sdk/server';
import { Logger } from '@nestjs/common';


/**
 * OperatorApiGateway handles WebSocket interactions for the application, including connection initialization,
 * message processing, and socket disconnection handling.
 *
 * Implements the behavior for WebSocket server initialization, connection lifecycle events,
 * and handling of incoming messages via specific message subscriptions.
 *
 * Implements:
 * - OnGatewayInit: Lifecycle hook for gateway initialization.
 * - OnGatewayConnection: Lifecycle hook for handling new socket connections.
 * - OnGatewayDisconnect: Lifecycle hook for handling socket disconnections.
 *
 * Decorators:
 * - @WebSocketGateway: Configures WebSocket gateway behaviors, including namespace, CORS settings, and allowed methods.
 */
@WebSocketGateway({
	namespace: '/',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class OperatorApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger(OperatorApiGateway.name);
	private wi : wiServer = new wiServer();

	handleConnection(socket: Socket, message: any): any {
		this.logger.debug(`-> socket connection: ${socket.id}`)
	}

	@SubscribeMessage("data")
	handleRequest(client: Socket, base64EncodedRequest: string): any {
		this.logger.debug(`-> socket message: ${base64EncodedRequest}`)

		// parse the message and process the request
		const encoder = EncoderFactory.bytesToBase64Encoder();
		const serializedRequest = encoder.decode(base64EncodedRequest);
		const request = ClientBridgeEncoder.decode(serializedRequest);

		try {
			const answer = this.wi.handleRequest(client, request);

			// encode and send the response
			const response = ClientBridgeEncoder.encode(answer);
			client.emit("data", encoder.encode(response));
		} catch (e) {
			this.logger.error(`Error during the request: ${e}`);
			const serializedResponse = ClientBridgeEncoder.encode({
				type: ClientBridgeMessageType.ERROR,
				errorMessage: `Error during the request: ${e}`
			});

			client.emit("data", encoder.encode(serializedResponse));
		}

		/*
		const schemaSerializer = new MessageUnserializer(SCHEMAS.WI_MESSAGES);
		const binaryRequest = encoder.decode(data);
		const {type, object} = schemaSerializer.unserialize(binaryRequest);
		const answer = this.wi.handleRequest(client, type, object);

		 */



	}



	handleDisconnect(client: Socket): any {
		this.logger.debug(`<- socket disconnection: ${client.id}`)
	}


}