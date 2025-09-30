import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';
import { DataSource } from 'typeorm';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
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
import TestAgent from 'supertest/lib/agent';

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
  	createApplicationInOrganisation(organisationId: $organizationId, applicationName: $name) {
  		id, name
  	}
  }
`;

const QUERY_GET_ORGANIZATION = `
  query GetOrganization($orgId: Int!) {
    organisation(id: $orgId) {
    	id, name
    }
  }
`;

const QUERY_GET_APPLICATION = `
  query GetApplication($id: Int!) {
    getApplicationInOrganization(applicationId: $id) {
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
let httpServer: any;

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
	httpServer = app.getHttpServer();
	agent = request(httpServer)
	expect(httpServer).toBeDefined()
	expect(agent).toBeDefined()


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

class GqlQuery {

	private async sendRequest(query: string, variables: object) {
		let server = request(app.getHttpServer())
		let req = server.post('/graphql')
		if (this.jwtToken) {
			req.auth(this.jwtToken, { type: "bearer" });
		}

		const res = req.send({
				query,
				variables
			});
		res.expect(HttpStatus.OK);
		return res;
	}

	private constructor(private jwtToken?: string) {
	}

	static noAuth() {
		return new GqlQuery();
	}

	static withAuth(jwtToken: string) {
		return new GqlQuery(jwtToken);
	}


	createInitialAdmin(setupToken: string) {
		return this.sendRequest(MUTATION_SETUP_FIRST_ADMINISTRATOR, {
			input: {
				token: setupToken,
				firstname: 'admin',
				lastname: 'admin',
				publicKey: firstUserEncodedPublicKey,
			}
		});
	}

	getLoginChallenge() {
		return this.sendRequest(QUERY_GET_CHALLENGE, {});
	}

	verifyChallenge(challenge: string, publicKey: string, signature: string) {
		return this.sendRequest(MUTATION_VERIFY_CHALLENGE, {
			challenge,
			publicKey,
			signature,
		});
	}

	createUser(publicKey: string, firstname: string, lastname: string, isAdmin: boolean) {
		return this.sendRequest(MUTATION_CREATE_USER, {
			publicKey,
			firstname,
			lastname,
			isAdmin
		})
	}

	async createOrg(orgName: string) {
		return this.sendRequest(MUTATION_CREATE_ORGANIZATION, {
			name: orgName
		})
	}

	async getOrgName(orgId: number) {
		return this.sendRequest(QUERY_GET_ORGANIZATION, {
			orgId,
		})
	}

	async getAppName(applicationId: number) {
		return this.sendRequest(QUERY_GET_APPLICATION, {
			id: applicationId,
		})
	}

	async createApp(appName: string, orgId: number) {
		return this.sendRequest(MUTATION_CREATE_APPLICATION, {
			name: appName,
			organizationId: orgId
		})
	}
}

class GqlResponseChecker {
	private constructor(private response: any) {}

	static fromResponse(response: any) {
		return new GqlResponseChecker(response)
	}

	expectDefinedBody() {
		expect(this.response.body).toBeDefined();
		return this
	}

	expectUndefinedBody() {
		expect(this.response.body).toBeUndefined();
		return this
	}

	expectErrors() {
		// @ts-ignore
		expect(this.response.body.errors).toBeDefined()
		return this;
	}

	expectNoError() {
		expect(this.response.body.errors).toBeUndefined()
		return this;
	}

	expectForbidden() {
		expect(this.response.body.data).toBeNull()
		expect(this.response.body.errors).toBeDefined()
		expect(this.response.body.errors.length).toEqual(1);
		expect(this.response.body.errors[0].code).toBe("FORBIDDEN");
		return this
	}

	expectDefinedData() {
		expect(this.response.body.data).toBeDefined();
		return this;
	}

	getData<T = any>(): T {
		return this.response.body.data;
	}
}


describe("Full e2e flow", () => {

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
			const response = await GqlQuery.noAuth().createInitialAdmin(
				cryptoService.adminCreationToken
			);
			expect(response.body.data.setupFirstAdministrator).toBe(true);
		})

		it("should not execute the first admin again", async () => {
			const response = await GqlQuery.noAuth().createInitialAdmin(
				cryptoService.adminCreationToken
			);
			GqlResponseChecker.fromResponse(response).expectErrors()
			expect(response.body.errors).toBeDefined();
		})



		it('should authenticate as first admin', async () => {
			// get the challenge
			const response = await GqlQuery.noAuth().getLoginChallenge();
			expect(response.body.data.getChallenge).toHaveProperty('challenge');
			expect(typeof response.body.data.getChallenge.challenge).toBe('string');

			// sign the challenge
			const challenge = response.body.data.getChallenge.challenge;
			const encodedSignature = sigEncoder.encodeSignature(
				firstUserPrivateKey.sign(sigEncoder.decodeMessage(challenge))
			);
			const verifyResponse = await GqlQuery.noAuth().verifyChallenge(
				challenge,
				firstUserEncodedPublicKey,
				encodedSignature,
			);
			console.log(verifyResponse.body)
			firstUserAuthToken = verifyResponse.body.data.verifyChallenge.token;
			expect(verifyResponse.body.data.verifyChallenge).toHaveProperty('token');
			expect(typeof firstUserAuthToken).toBe('string');
		});



		const firstUserAuthenticatedClient = GqlQuery.withAuth(firstUserAuthToken);
		it('should get rejected when not authenticated', async () => {
			const response = await firstUserAuthenticatedClient.createUser(
				firstUserEncodedPublicKey,
				"Rejected",
				"lastname",
				true
			);
			GqlResponseChecker.fromResponse(response)
				.expectForbidden();
		});


		it('should be rejected when creating another user with the same public key', async () => {
			const response = await firstUserAuthenticatedClient.createUser(
				firstUserEncodedPublicKey,
				"Rejected",
				"User",
				true
			);
			GqlResponseChecker.fromResponse(response)
				.expectErrors()
		});



		it('should create a second user', async () => {
			const response = await GqlQuery
				.withAuth(firstUserAuthToken)
				.createUser(secondUserEncodedPublicKey, "Second", "User", false);
			GqlResponseChecker.fromResponse(response).expectNoError();
		});


		let secondUserAuthToken;
		it('should authenticate as the second user', async () => {
			// ask for a challenge
			const response = await GqlQuery.noAuth()
				.getLoginChallenge();
			GqlResponseChecker.fromResponse(response).expectNoError();
			const challenge = response.body.data.getChallenge.challenge;

			// sign the challenge
			const signature = secondUserPrivateKey.sign(sigEncoder.decodeMessage(challenge));
			const encodedSignature = sigEncoder.encodeSignature(signature);

			// verify the challenge
			const verifyResponse = await GqlQuery.noAuth()
				.verifyChallenge(challenge, secondUserEncodedPublicKey, encodedSignature);
			GqlResponseChecker.fromResponse(response).expectNoError();
			secondUserAuthToken = verifyResponse.body.data.verifyChallenge.token
		});


		const CARMENTIS_ORGANIZATION_NAME = "Carmentis"
		let carmentisOrganizationId;
		it('should create an organization as first user', async () => {
			// create the organization
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createOrg(CARMENTIS_ORGANIZATION_NAME);
			const data = GqlResponseChecker.fromResponse(response)
					.expectDefinedBody()
					.expectNoError()
					.expectDefinedData()
					.getData();

			// check the returned data
			carmentisOrganizationId = data.createOrganisation.id;
			const organizationName = data.createOrganisation.name;
			expect(typeof carmentisOrganizationId).toEqual('number')
			expect(carmentisOrganizationId).toBeGreaterThanOrEqual(1)
			expect(organizationName).toEqual(CARMENTIS_ORGANIZATION_NAME)
		});


		const FILE_SIGN_APPLICATION_NAME = "File Sign";
		let fileSignApplicationId;
		it("should create an carmentis's application as first user", async () => {
			// create an application
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApp(FILE_SIGN_APPLICATION_NAME, carmentisOrganizationId);
			const data = GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData()
				.getData();
			fileSignApplicationId = data.createApplicationInOrganisation.id;
		})


		it('should not create an organization when not authenticated', async () => {
			const response = await GqlQuery.noAuth()
				.createOrg(CARMENTIS_ORGANIZATION_NAME);
			GqlResponseChecker.fromResponse(response).expectForbidden()
		});

		it('should access an organization when member', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.getOrgName(carmentisOrganizationId);
			const data = GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(data.organisation.name).toEqual(CARMENTIS_ORGANIZATION_NAME);
		})

		it('should NOT access an organization when NOT a member', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.getOrgName(carmentisOrganizationId);
			GqlResponseChecker.fromResponse(response).expectForbidden();
		})


		const OTHER_ORGANIZATION_NAME = "Other"
		let otherOrganizationId;
		it('should create an organization as second user', async () => {
			// create the organization
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createOrg(OTHER_ORGANIZATION_NAME);
			const data = GqlResponseChecker.fromResponse(response)
				.expectDefinedBody()
				.expectNoError()
				.expectDefinedData()
				.getData();
			otherOrganizationId = data.createOrganisation.id;
		});


		it('should access an organization when NOT a member but IS admin', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.getOrgName(otherOrganizationId);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		})

		it('should create an application in organization when NOT a member but IS admin', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApp("Mon application", otherOrganizationId);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		})

		it('should NOT create an application in organization when NOT a member and NOT admin', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createApp("Rejected application", carmentisOrganizationId);
			GqlResponseChecker.fromResponse(response).expectForbidden()
		})

		
		






	});




})