import * as z from "zod";
import { join } from 'path';

export const ConfigSchema = z.object({
    operator: z.object({
		workspace: z.object({
			jwt: z.object({
				secret: z.string().optional(),
				tokenValidity: z.string().default("8h")
			}).default({}),
			graphql: z.object({
				debug: z.boolean().default(true),
			}).default({}),
		}).default({}),
		swagger: z.object({
			path: z.string().default('swagger'),
		}).default({}),
		cors: z.object({
			origin: z.string().default('*'),
			methods: z.string().default('GET,POST,PUT,DELETE,OPTIONS')
		}).default({}),
		node_url: z.string(),
		port: z.number().default(3000),
		database: z.object({
			encryption: z.object({
				algorithm: z.string().default('chacha20-poly1305'),
				iv_length: z.number().default(12),
				encryption_key: z.string().optional(),
				allow_encryption_key_generation: z.boolean().default(true),
			}).default({}),
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
				database: z.string()
			}).optional()
		}),
		protocols: z.object({
			 wap: z.object({
				 version: z.string().default("v0"),
			 }).default({})
		}).default({}),
		paths: z.object({
			home: z.string().default(process.cwd()),
			init_token: z.string().default("admin-token.txt"),
			db_encryption_key: z.string().default("db-encryption-key.txt"),
		}).default({}),
	}),
});

export type OperatorConfig = z.infer<typeof ConfigSchema>;