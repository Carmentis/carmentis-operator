import * as z from "zod";
import { join } from 'path';

export const ConfigSchema = z.object({
	operator: z.object({ // encapsulate the configuration for the operator in a specific section to allow single-file multi-servers config
		node_url: z.string().url().describe("URL of the node to interact with the blockchain."), // URL of the node used by the operator to anchor information on chain
		port: z.number().default(3000).describe("Used port where the operator listens"), // used port
		workspace: z.object({ // focus on the workspace config
			jwt: z.object({ // secret key and token validity for JWT
				secret: z.string().optional()
					.describe("JWT secret used to authenticate users when interacting with the Workspace API."),
				tokenValidity: z.string().optional().default("8h")
					.describe("Validity of the JWT secret")
			}).default({}).describe("JWT configuration."),
			graphql: z.object({ // graphql-related config
				debug: z.boolean().default(true).describe("Enable graphql debug mode."),
			}).default({}).describe("GraphQL configuration."),
		})
			.default({})
			.describe("Workspace configuration."),
		swagger: z.object({ // swagger-related config
			path: z.string().default('swagger'),
		}).default({}).describe("Swagger configuration."),
		cors: z.object({ // cors-related config
			origin: z.string().default('*'),
			methods: z.string().default('GET,POST,PUT,DELETE,OPTIONS')
		}).default({}).describe("CORS configuration."),

		database: z.object({ // database-related config
			encryption: z.object({ // configuration of the encryption
				algorithm: z.string().default('chacha20-poly1305'),
				iv_length: z.number().default(12),
				encryption_key: z.string().optional(),
				// When allowed, an encryption key is generated automatically.
				// Be careful; when the encryption key is changed, the server cannot decrypt encrypted data anymore.
				allow_encryption_key_generation: z.boolean().default(true),
			}).default({}).describe("Workspace-controlled database encryption configuration."),
			postgresql: z.object({
				user: z.string(),
				password: z.string(),
				database: z.string(),
				url: z.string(),
				port: z.number().positive("PostgreSQL port must be positive."),
			}).optional(),
			mysql: z.object({
				user: z.string(),
				password: z.string(),
				database: z.string(),
				url: z.string(),
				port: z.number().positive("MySQL port must be positive."),
			}).optional(),
			sqlite: z.object({
				database: z.string() // SQLite database file is stored relatively to the paths.home location.
			}).optional()
		}).describe("Database configuration."),
		// Protocols-related configuration
		/**
		 * Test
		 */
		protocols: z.object({
			 wap: z.object({ // Wallet Authentication Protocol (WAP): used to obtain wallet information and signature.
				 version: z.string().default("v0"),
			 }).default({})
		}).default({}),
		paths: z.object({ // By default, all paths are relative to the paths.home location.
			home: z.string().default(process.cwd()),
			init_token: z.string().default("admin-token.txt"),
			db_encryption_key: z.string().default("db-encryption-key.txt")
				.describe("Path where database encryption key is stored."),
			jwt_secret: z.string().default('jwt-secret.txt'),
		}).default({}),
	}).describe("Test"),
});

export type OperatorConfig = z.infer<typeof ConfigSchema>;