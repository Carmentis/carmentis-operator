import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpCode, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk';

const WI = {
	CLIENT_STORAGE_KEY: "CWI-client",
	WALLET_STORAGE_KEY: "CWI-wallet",

	REQ_SIGN_IN: 0,
	REQ_AUTHENTICATION: 1,
	REQ_EVENT_APPROVAL: 2,

	REQ_RECIPIENT_IS_SERVER: [
		false,
		false,
		true,
	],

	REQ_NAME: [
		"signIn",
		"authentication",
		"eventApproval",
	],

	// TTL of device cookie, in seconds
	DEVICE_COOKIE_TTL: 180 * 24 * 60 * 60,

	// Timeout for reconnection of client or wallet, in milliseconds
	// (how long does one wait for the other's socket to be reconnected)
	RECONNECTION_TIMEOUT: 500,

	MSG_MSK: 0x7F,
	MSG_ACK: 0x80,

	MSG_SDK_CONNECTION: 0x00 | 0x80, // MSG_ACK
	MSG_SDK_RECONNECTION: 0x01 | 0x80, // MSG_ACK
	MSG_UPDATE_QR_ID: 0x02,
	MSG_GET_CONNECTION_INFO: 0x03 | 0x80, // MSG_ACK
	MSG_ACCEPT_CONNECTION: 0x04,
	MSG_REJECT_CONNECTION: 0x05,
	MSG_WALLET_CONNECTED: 0x06 | 0x80, // MSG_ACK
	MSG_EXPIRED: 0x07,
	MSG_REQUEST_DATA: 0x08,
	MSG_FORWARDED_REQUEST_DATA: 0x09,
	MSG_ANSWER_CLIENT: 0x0A,
	MSG_FORWARDED_ANSWER: 0x0B,
	MSG_ANSWER_SERVER: 0x0C,
	MSG_SERVER_TO_WALLET: 0x0D,
	MSG_WALLET_RECONNECTION: 0x0E | 0x80, // MSG_ACK

	// Delays expressed in seconds
	QR_REFRESH_PERIOD: 20,
	QR_FLASH_PERIOD: 25,
	REQUEST_ACK_PERIOD: 120,
	REQUEST_TTL: 600, // 180,

	ST_UNKNOWN: 0,
	ST_PENDING: 1,
	ST_LOCKED: 2,
	ST_CONNECTED: 3,
	ST_REJECTED: 4,
	ST_ACCEPTED: 5,
};


export class Utils {
	/**
	 * Converts a string to its hexadecimal representation.
	 * @param {string} str - The input string to convert.
	 * @returns {string} - The hexadecimal representation of the string.
	 */
	static stringToHexa(str:string): string
	{
		if (typeof str !== 'string') {
			throw new TypeError('Input must be a valid string.');
		}
		return Array.from(str)
			.map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
			.join('');
	}

}

/**
 * A utility class for operations and conversions involving Uint8Array.
 */
export class Uint8Utils {
	/**
	 * Convertit un Uint8Array en une chaîne hexadécimale.
	 * @param {Uint8Array} uint8Array - Le tableau de bytes à convertir.
	 * @returns {string} - Représentation hexadécimale des données.
	 */
	static toHexa(uint8Array) {
		if (!(uint8Array instanceof Uint8Array)) {
			throw new TypeError(`Input should be instance of Uint8Array, got: ${typeof uint8Array}`);
		}
		return Array.from(uint8Array)
			.map(byte => byte.toString(16).padStart(2, '0'))
			.join('');
	}

	/**
	 * Convertit une chaîne hexadécimale en Uint8Array.
	 * @param {string} hexString - La chaîne hexadécimale à convertir.
	 * @returns {Uint8Array} - Le tableau de bytes résultant.
	 */
	static fromHexa(hexString) {
		if (typeof hexString !== 'string') {
			throw new TypeError("L'entrée doit être une chaîne valide.");
		}

		if (hexString.length % 2 !== 0) {
			throw new Error("La chaîne hexadécimale doit avoir un nombre pair de caractères.");
		}

		const uint8Array = new Uint8Array(hexString.length / 2);
		for (let i = 0; i < hexString.length; i += 2) {
			uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
		}
		return uint8Array;
	}

	/**
	 * Compare deux Uint8Array pour vérifier leur égalité.
	 * @param {Uint8Array} arr1 - Premier tableau de bytes.
	 * @param {Uint8Array} arr2 - Deuxième tableau de bytes.
	 * @returns {boolean} - `true` si les deux tableaux sont identiques, `false` sinon.
	 */
	static equals(arr1, arr2) {
		if (!(arr1 instanceof Uint8Array) || !(arr2 instanceof Uint8Array)) {
			throw new TypeError("Les deux entrées doivent être des instances de Uint8Array");
		}

		if (arr1.length !== arr2.length) {
			return false;
		}

		return arr1.every((value, index) => value === arr2[index]);
	}

	/**
	 * Génère un Uint8Array aléatoire d'une taille donnée.
	 * @param {number} length - La taille du tableau à générer.
	 * @returns {Uint8Array} - Tableau de bytes aléatoire.
	 */
	static random(length) {
		if (!Number.isInteger(length) || length < 0) {
			throw new TypeError("La longueur doit être un entier valide supérieur ou égal à 0.");
		}
		const array = new Uint8Array(length);
		crypto.getRandomValues(array); // Utilise l'API Web Cryptography pour de l'aléatoire sécurisé.
		return array;
	}

	/**
	 * Fusionne plusieurs Uint8Array en un seul tableau.
	 * @param {...Uint8Array} arrays - Les tableaux de bytes à fusionner.
	 * @returns {Uint8Array} - Tableau fusionné.
	 */
	static concat(...arrays) {
		arrays.forEach(arr => {
			if (!(arr instanceof Uint8Array)) {
				throw new TypeError("Tous les arguments doivent être des instances de Uint8Array");
			}
		});

		const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
		const result = new Uint8Array(totalLength);

		let offset = 0;
		arrays.forEach(arr => {
			result.set(arr, offset);
			offset += arr.length;
		});

		return result;
	}


	/**
	 * Converts a string into a Uint8Array using the TextEncoder API.
	 *
	 * @param {string} str - The input string to be converted.
	 * @return {Uint8Array} A Uint8Array representing the encoded string.
	 */
	static stringToUint8Array(str: string) {
		const encoder = new TextEncoder(); // Utilise l'API TextEncoder
		return encoder.encode(str);
	}
}


@WebSocketGateway({
	namespace: '/',
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class OperatorApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(OperatorApiGateway.name);
	@WebSocketServer() server: Server;
	private clients: Set<Socket> = new Set();
	private requests = new Map<string, any>();
	private qrCodes = new Map<string, any>();
	private socketMetadata = new Map<Socket, any>();

	handleConnection(client: Socket) {
		this.clients.add(client);
		this.logger.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.clients.delete(client);
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('data')
	async handleMessage(
		client: Socket,
		message: any
	) {
		this.logger.log(`received message: ${message}`)

		let response;
		switch (message.id) {
			case WI.MSG_SDK_CONNECTION:
				response = await this.sdkConnection(client, message.data);
				break;
			case WI.MSG_SDK_RECONNECTION:
				response = await this.sdkReconnection(client, message.data);
				break;
			case WI.MSG_GET_CONNECTION_INFO:
				response = await this.getConnectionInfo(client, message.data);
				break;
				/*
			case WI.MSG_ACCEPT_CONNECTION:
				response = await this.acceptConnection(client, msg.data);
				break;
			case WI.MSG_REJECT_CONNECTION:
				response = await this.rejectConnection(client, msg.data);
				break;
			case WI.MSG_REQUEST_DATA:
				response = await this.requestData(client, msg.data);
				break;
			case WI.MSG_ANSWER_CLIENT:
				response = await this.walletAnswerClient(client, msg.data);
				break;
			case WI.MSG_ANSWER_SERVER:
				response = await this.walletAnswerServer(client, msg.data);
				break;
			case WI.MSG_WALLET_RECONNECTION:
				response = await this.walletReconnection(client, msg.data);
				break;
				 */
			default:
				this.logger.error(`Unexpected Message ID: ${message.id}`);
				break;
		}
		return response;
	}


	async sdkConnection(socket: Socket, data: any) {
		let seed = sdk.crypto.getRandomBytes(12),
			now  = Math.floor(new Date().getTime() / 1000),
			ip   = socket.handshake.headers["x-real-ip"],
			ua   = socket.handshake.headers["user-agent"];

		let request = {
			deviceId : Uint8Utils.fromHexa(data.deviceId),
			ip       : ip,
			userAgent: ua,
			timestamp: now,
			seed     : seed
		};

		this.logger.log(`connection/request ${request}`);


		//serializedRequest = await sdk.serializer.serialize(CST.SCHEMA.WI_REQUEST, request),
		let serializedRequest = Uint8Utils.stringToUint8Array(JSON.stringify(request)),
			hash = sdk.crypto.sha256(serializedRequest),
			requestId = Utils.stringToHexa(hash);

		let requestObject = {
			ts          : now,
			status      : WI.ST_PENDING,
			data        : serializedRequest,
			clientSocket: socket,
			shownQrId: undefined
		};

		this.socketMetadata.set(socket, {
			requestId:  requestId,
			isClient: true,
		});

		this.requests.set(requestId, requestObject);

		requestObject.shownQrId = this.generateQRIdentifier(requestId);

		return {
			success: true,
			data: {
				qrId: requestObject.shownQrId
			}
		};
	}

	async sdkReconnection(client: Socket, message: any) {

	}


	async getConnectionInfo(client: Socket, data: any) {

		this.logger.log(`getConnectionInfo ${data}`);

		let qr = this.qrCodes.get(data.qrId),
			request = qr && qr.active && this.requests.get(qr.requestId);

		this.logger.log(`qr / request ${qr} ${request}`);

		let status = request ? request.status : WI.ST_UNKNOWN;

		if(status != WI.ST_PENDING) {
			return { success: false };
		}

		return {
			success: true,
			data: {
				request: Uint8Utils.toHexa(request.data)
			}
		};
	}


	private generateQRIdentifier(requestId) {
		let request = this.requests.get(requestId),
			qrId = Uint8Utils.toHexa(sdk.crypto.getRandomBytes(16)),
			now = Math.floor(new Date().getTime() / 1000);

		this.logger.log(`setting qrId ${qrId}`);

		this.qrCodes.set(
			qrId,
			{
				requestId  : requestId,
				replaceable: true,
				active     : true,
				ts         : now,
				maxTs      : request.ts + WI.REQUEST_TTL
			}
		);

		return qrId;
	}
}