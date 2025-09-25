import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';
import { DataSource } from 'typeorm';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CryptoService } from '../shared/services/CryptoService';
import { Secp256k1PrivateSignatureKey, StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { SharedModule } from '../shared/SharedModule';
import { OperatorApiModule } from '../operator/OperatorApiModule';
import { WorkspaceApiModule } from '../workspace/WorkspaceApiModule';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { getDatabaseConfig } from '../database/getDatabaseConfig';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApiKeyEntity } from '../shared/entities/ApiKeyEntity';
import TestAgent from 'supertest/lib/agent';
import { it } from 'node:test';

jest.setTimeout(120000); // augmenter le timeout pour le pull/start de l'image

// GraphQL queries and mutations reused across tests
const QUERY_GET_CHALLENGE = `
  query {
    getChallenge {
      challenge
    }
  }
`;

const MUTATION_VERIFY_CHALLENGE = `
  mutation VerifyChallenge($challenge: String!, $publicKey: String!, $signature: String!) {
    verifyChallenge(challenge: $challenge, publicKey: $publicKey, signature: $signature) {
      token
    }
  }
`;

const MUTATION_SETUP_FIRST_ADMINISTRATOR = `
  mutation SetupFirstAdministrator($input: SetupFirstAdminDto!) {
    setupFirstAdministrator(setupFirstAdmin: $input)
  }
`;

const MUTATION_CREATE_USER = `
  mutation CreateUser($publicKey: String!, $firstname: String!, $lastname: String!, $isAdmin: Boolean!) {
    createUser(publicKey: $publicKey, firstname: $firstname, lastname: $lastname, isAdmin: $isAdmin) {
      publicKey
    }
  }
`;

const MUTATION_CREATE_ORGANIZATION = `
  mutation CreateOrganization($name: String!, $privateKey: String) {
    createOrganisation(name: $name, privateKey: $privateKey) {
    	id, name, publicSignatureKey
    }
  }
`;

const MUTATION_CREATE_APPLICATION = `
  mutation CreateApplication($name: String!, $organizationId: Int!) {
  	createApplicationInOrganisation(organisationId: $organizationId, applicationName: $naùe) {
  		id, name
  	}
  }
`;



//
let container: StartedPostgreSqlContainer;
let app: INestApplication;
let agent: TestAgent;

// we generate the public key for two users
const sigEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
const firstUserPrivateKey = Secp256k1PrivateSignatureKey.gen();
const firstUserPublicKey = firstUserPrivateKey.getPublicKey();
const firstUserEncodedPublicKey = sigEncoder.encodePublicKey(firstUserPublicKey);


const secondUserPrivateKey = Secp256k1PrivateSignatureKey.gen();
const secondUserPublicKey = secondUserPrivateKey.getPublicKey();
const secondUserEncodedPublicKey = sigEncoder.encodePublicKey(secondUserPublicKey);

// services
let cryptoService: CryptoService;

describe("Full e2e flow", () => {
	beforeAll(async () => {
		// démarre le conteneur Postgres
		container = await new PostgreSqlContainer("postgres:15")
			.withDatabase(`testdb`)
			.withUsername("testuser")
			.withPassword("testpass")
			.start();

		console.log(container.getHost(), container.getPort(), container.getDatabase(), container.getName())

		// Créer le module Nest avec override de TypeORM pour pointer vers le conteneur

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				OperatorConfigModule,
				SharedModule,
				OperatorApiModule,
				WorkspaceApiModule,
				TypeOrmModule.forRootAsync({
					imports: [OperatorConfigModule],
					inject: [OperatorConfigService],
					useFactory: (configService: OperatorConfigService) => ({
						type: 'postgres',
						host: container.getHost(),
						port: container.getPort(),
						username: container.getUsername(),
						password: container.getPassword(),
						database: container.getDatabase(),
						entities: [__dirname + '/../**/*Entity{.ts,.js}'],
						synchronize: true,
						dropSchema: true,
					}),
				}),
				GraphQLModule.forRootAsync<ApolloDriverConfig>({
					driver: ApolloDriver,
					imports: [OperatorConfigModule],
					inject: [OperatorConfigService],
					useFactory: (config: OperatorConfigService) => ({
						debug: config.launchGraphQLInDebugMode(),
						autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
						formatError: (error) => {
							const original = error.extensions?.originalError as any;
							return {
								message: original?.message || error.message,
								code: error.extensions?.code,
								path: error.path,
							};
						},
					})
				}),
			],
		})
			.compile();

		// instantiate the application module
		app = moduleFixture.createNestApplication();
		await app.init();

		//
		agent = request(app.getHttpServer())


		// instantiate the services
		cryptoService = app.get<CryptoService>(CryptoService)
	});


	afterAll(async () => {
		if (container) {
			await container.stop({
				remove: true,
				removeVolumes: true,
			});
		}
	});



	describe('Operator API (e2e)', () => {
		it('/api/public/hello (GET) should return { message: "Hello world!" }', async () => {
			const response = await request(app.getHttpServer()).get('/api/public/hello')
				.expect(HttpStatus.OK);
			expect(response.body).toEqual({ message: 'Hello world!' });
		});

		it('/api/hello (GET) being unauthenticated should return FORBIDDEN', async () => {
			await request(app.getHttpServer()).get('/api/hello')
				.expect(HttpStatus.FORBIDDEN);
		});
	});

	describe('Workspace API (e2e)', () => {

		// we need to preserve the JWT token for the users
		let firstUserAuthToken;

		it("should setup the first admin successfully", async () => {
			const setupToken = cryptoService.adminCreationToken;
			const mutation = MUTATION_SETUP_FIRST_ADMINISTRATOR;

			const variables = {
				input: {
					token: setupToken,
					firstname: 'admin',
					lastname: 'admin',
					publicKey: firstUserEncodedPublicKey,
				},
			};

			const response = await agent
				.post('/graphql')
				.send({
					query: mutation,
					variables,
				})
				.expect(HttpStatus.OK);


			// La mutation retourne true si tout s'est bien passé
			expect(response.body.data.setupFirstAdministrator).toBe(true);
		})


		it('should get rejected when not authenticated', async () => {
			const query = QUERY_GET_CHALLENGE;

			const response = await agent
				.post('/graphql')
				.send({ query })
				.expect(HttpStatus.OK);

			expect(response.body.data.getChallenge).toHaveProperty('challenge');
			expect(typeof response.body.data.getChallenge.challenge).toBe('string');

			// On peut stocker le challenge pour le test suivant
			const challenge = response.body.data.getChallenge.challenge;

			// Vérification du challenge via signature
			const signature = firstUserPrivateKey.sign(sigEncoder.decodeMessage(challenge));
			const encodedSignature = sigEncoder.encodeSignature(signature);

			const verifyMutation = MUTATION_VERIFY_CHALLENGE;

			const variables = {
				challenge,
				publicKey: firstUserEncodedPublicKey,
				signature: encodedSignature,
			};

			const verifyResponse = await agent
				.post('/graphql')
				.send({ query: verifyMutation, variables })
				.expect(HttpStatus.OK);

			firstUserAuthToken = verifyResponse.body.data.verifyChallenge.token
			expect(verifyResponse.body.data.verifyChallenge).toHaveProperty('token');
			expect(typeof firstUserAuthToken).toBe('string');
		});

		it('should authenticate as first admin', async () => {
			const query = QUERY_GET_CHALLENGE;

			const response = await agent
				.post('/graphql')
				.send({ query })
				.expect(HttpStatus.OK);

			expect(response.body.data.getChallenge).toHaveProperty('challenge');
			expect(typeof response.body.data.getChallenge.challenge).toBe('string');

			// On peut stocker le challenge pour le test suivant
			const challenge = response.body.data.getChallenge.challenge;

			// Vérification du challenge via signature
			const signature = firstUserPrivateKey.sign(sigEncoder.decodeMessage(challenge));
			const encodedSignature = sigEncoder.encodeSignature(signature);

			const verifyMutation = MUTATION_VERIFY_CHALLENGE;

			const variables = {
				challenge,
				publicKey: firstUserEncodedPublicKey,
				signature: encodedSignature,
			};

			const verifyResponse = await agent
				.post('/graphql')
				.send({ query: verifyMutation, variables })
				.expect(HttpStatus.OK);

			firstUserAuthToken = verifyResponse.body.data.verifyChallenge.token
			expect(verifyResponse.body.data.verifyChallenge).toHaveProperty('token');
			expect(typeof firstUserAuthToken).toBe('string');
		});



		it('should get rejected when not authenticated', async () => {
			const mutation = MUTATION_CREATE_USER;

			const variables = {
				publicKey: firstUserEncodedPublicKey,
				firstname: "Rejected",
				lastname: "User",
				isAdmin: true
			};

			const response = await agent
				.post('/graphql')
				.send({ query: mutation, variables })
				.expect(HttpStatus.OK);

			expect(response.body.errors.length).toEqual(1)
			expect(response.body.errors[0].code).toBe("FORBIDDEN")
		});

		// should be able to create a second user when authenticated
		it('should be able to create a second user', async () => {
			const mutation = MUTATION_CREATE_USER;

			const variables = {
				publicKey: firstUserEncodedPublicKey,
				firstname: "Rejected",
				lastname: "User",
				isAdmin: true
			};

			const response = await agent
				.post('/graphql')
				.auth(firstUserAuthToken, { type: "bearer" })
				.send({ query: mutation, variables })
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined()
		});


		const CARMENTIS_ORGANIZATION_NAME = "Carmentis"
		const FILE_SIGN_APPLICATION_NAME = "File Sign";
		let organizationId;
		it('should be able to create an organization and an application', async () => {
			// create the organization
			const mutation = MUTATION_CREATE_ORGANIZATION;
			const variables = {
				name: CARMENTIS_ORGANIZATION_NAME
			};

			const response = await agent
				.post('/graphql')
				.auth(firstUserAuthToken, { type: "bearer" })
				.send({ query: mutation, variables })
				.expect(HttpStatus.OK)

			// ensure that the body is defined
			const body = response.body
			expect(body).toBeDefined();

			// ensure that no error has been raised and data is defined
			const errors = body.errors
			const data = body.data;
			expect(data).toBeDefined()
			expect(errors).toBeUndefined()

			// extract the organization id and name
			organizationId = data.createOrganisation.id;
			const organizationName = data.createOrganisation.name;
			expect(typeof organizationId).toEqual('number')
			expect(organizationId).toBeGreaterThanOrEqual(1)
			expect(organizationName).toEqual(CARMENTIS_ORGANIZATION_NAME)
		});

		it("should create an application", async () => {
			// we now create an application
			const mutation = MUTATION_CREATE_APPLICATION;
			const variables = {
				name: FILE_SIGN_APPLICATION_NAME,
				organizationId: organizationId
			};

			const response = await agent
				.post('/graphql')
				.auth(firstUserAuthToken, { type: "bearer" })
				.send({ query: mutation, variables })
				.expect(HttpStatus.OK)

			// ensure that the body is defined
			const body = response.body
			expect(body).toBeDefined();

			// ensure that no error has been raised and data is defined
			const errors = body.errors
			const data = body.data;
			expect(data).toBeDefined()
			expect(errors).toBeUndefined()
		})

		
		






	});




})