import * as z from "zod";
import { join } from 'path';

export const ConfigSchema = z.object({
	operator: z.object({
		// Encapsulate the configuration for the operator in a specific section
		// to allow single-file multi-servers config
		node_url: z.string().url()
			.describe("URL of the blockchain node used by the operator to anchor information on-chain."),

		// This dev flag is used mainly for the database migrations but can be used for other things
		dev: z.boolean().default(false).describe("Allow the operator to run in developer mode."),
		port: z.number().default(3000)
			.describe("Port where the operator listens for incoming requests."),

		workspace: z.object({
			jwt: z.object({
				secret: z.string().optional()
					.describe("Secret key used for signing JWT tokens to authenticate users on the Workspace API."),
				tokenValidity: z.string().default("8h")
					.describe("Validity duration of the generated JWT tokens (e.g., '8h')."),
			}).prefault({})
				.describe("JWT authentication configuration."),

			graphql: z.object({
				debug: z.boolean().default(true)
					.describe("Enable or disable GraphQL debug mode."),
			}).prefault({}).describe("GraphQL configuration."),
		}).prefault({})
			.describe("Workspace configuration, including authentication and GraphQL settings."),

		swagger: z.object({
			path: z.string().default('swagger')
				.describe("Path under which Swagger UI and API docs are served."),
		}).prefault({}).describe("Swagger documentation configuration."),

		cors: z.object({
			origin: z.string().default('*')
				.describe("Allowed origins for CORS requests (e.g., '*')."),
			methods: z.string().default('GET,POST,PUT,DELETE,OPTIONS')
				.describe("Allowed HTTP methods for CORS requests."),
		}).prefault({}).describe("CORS configuration."),

		database: z.object({
			encryption: z.object({
				algorithm: z.string().default('chacha20-poly1305')
					.describe("Encryption algorithm used to protect sensitive data."),
				iv_length: z.number().default(12)
					.describe("Length of the initialization vector (IV) for encryption."),
				encryption_key: z.string().optional()
					.describe("Custom encryption key. If omitted and generation is allowed, a key will be generated."),
				allow_encryption_key_generation: z.boolean().default(true)
					.describe("Whether the system is allowed to generate an encryption key if none is provided."),
			}).prefault({}).describe("Workspace-controlled database encryption configuration."),

			postgresql: z.object({
				user: z.string().describe("PostgreSQL user."),
				password: z.string().describe("PostgreSQL password."),
				database: z.string().describe("Name of the PostgreSQL database."),
				url: z.string().describe("PostgreSQL connection URL."),
				port: z.number().positive("PostgreSQL port must be positive.")
					.describe("Port number of the PostgreSQL server."),
			}).optional().describe("PostgreSQL database configuration."),

			mysql: z.object({
				user: z.string().describe("MySQL user."),
				password: z.string().describe("MySQL password."),
				database: z.string().describe("Name of the MySQL database."),
				url: z.string().describe("MySQL connection URL."),
				port: z.number().positive("MySQL port must be positive.")
					.describe("Port number of the MySQL server."),
			}).optional().describe("MySQL database configuration."),

			sqlite: z.object({
				database: z.string()
					.describe("Path to the SQLite database file (relative to paths.home)."),
			}).optional().describe("SQLite database configuration."),
		}).describe("Database configuration."),

		protocols: z.object({
			wap: z.object({
				version: z.string().default("v0")
					.describe("Version of the Wallet Authentication Protocol (WAP) used to obtain wallet information and signatures."),
			}).prefault({}),
		}).prefault({}).describe("Protocols configuration."),

		paths: z.object({
			home: z.string().default(process.cwd())
				.describe("Base directory for all relative paths."),
			init_token: z.string().default("admin-token.txt")
				.describe("Path to the initialization token file used for first-time setup."),
			db_encryption_key: z.string().default("db-encryption-key.txt")
				.describe("Path where the database encryption key is stored."),
			jwt_secret: z.string().default('jwt-secret.txt')
				.describe("Path to the JWT secret file."),
		}).prefault({}).describe("Filesystem paths configuration."),
	}).describe("Operator configuration, encapsulating server, database, protocols, and paths settings."),
});

export type OperatorConfig = z.infer<typeof ConfigSchema>;
