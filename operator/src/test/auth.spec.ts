import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';
import { DataSource } from 'typeorm';
import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CryptoService } from '../shared/services/CryptoService';
import { Secp256k1PrivateSignatureKey, CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk/server';
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
import { OperatorTestConfig } from './OperatorTestConfig';

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

const MUTATION_ADD_USER_IN_ORGANIZATION = `
  mutation AddUserInOrganisation($orgId: Int!, $userPublicKey: String!) {
    addUserInOrganisation(organisationId: $orgId, userPublicKey: $userPublicKey)
  }
`;

const MUTATION_CREATE_API_KEY = `
  mutation CreateApiKey($applicationId: Int!, $name: String!, $activeUntil: String!) {
    createApiKey(applicationId: $applicationId, name: $name, activeUntil: $activeUntil) {
      id
      name
      key
    }
  }
`;

const MUTATION_IMPORT_NODE = `
  mutation ImportNode($orgId: Int!, $alias: String!, $rpc: String!) {
    importNodeInOrganisation(organisationId: $orgId, nodeAlias: $alias, nodeRpcEndpoint: $rpc)
  }
`;

const QUERY_GET_ORGANIZATION_WITH_NODES = `
  query GetOrganizationWithNodes($orgId: Int!) {
    organisation(id: $orgId) {
      id
      name
      nodes { id nodeAlias rpcEndpoint }
    }
  }
`;



//
let container: StartedPostgreSqlContainer;
let app: INestApplication;
let agent: TestAgent;

/*
// we generate the public key for three users
const sigEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
const firstUserPrivateKey = Secp256k1PrivateSignatureKey.gen();
const firstUserPublicKey = firstUserPrivateKey.getPublicKey();
const firstUserEncodedPublicKey = sigEncoder.encodePublicKey(firstUserPublicKey);


const secondUserPrivateKey = Secp256k1PrivateSignatureKey.gen();
const secondUserPublicKey = secondUserPrivateKey.getPublicKey();
const secondUserEncodedPublicKey = sigEncoder.encodePublicKey(secondUserPublicKey);

const thirdUserPrivateKey = Secp256k1PrivateSignatureKey.gen();
const thirdUserPublicKey = thirdUserPrivateKey.getPublicKey();
const thirdUserEncodedPublicKey = sigEncoder.encodePublicKey(thirdUserPublicKey);

 */

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
		.overrideProvider(OperatorConfigService)
		.useValue(new OperatorTestConfig())
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

/*
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

	async addUserToOrg(orgId: number, userPublicKey: string) {
		return this.sendRequest(MUTATION_ADD_USER_IN_ORGANIZATION, {
			orgId,
			userPublicKey,
		});
	}

	async createApiKey(applicationId: number, name: string, activeUntil: string) {
		return this.sendRequest(MUTATION_CREATE_API_KEY, {
			applicationId,
			name,
			activeUntil,
		});
	}

	async importNodeInOrg(orgId: number, alias: string, rpc: string) {
		return this.sendRequest(MUTATION_IMPORT_NODE, {
			orgId,
			alias,
			rpc,
		});
	}

	async getOrgWithNodes(orgId: number) {
		return this.sendRequest(QUERY_GET_ORGANIZATION_WITH_NODES, { orgId });
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
		let firstOrgId;
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
			firstOrgId = data.createOrganisation.id;
			const organizationName = data.createOrganisation.name;
			expect(typeof firstOrgId).toEqual('number')
			expect(firstOrgId).toBeGreaterThanOrEqual(1)
			expect(organizationName).toEqual(CARMENTIS_ORGANIZATION_NAME)
		});


		const FIRST_APP_NAME = "first application";
		let fileSignApplicationId;
		it("should create an carmentis's application as first user", async () => {
			// create an application
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApp(FIRST_APP_NAME, firstOrgId);
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
				.getOrgName(firstOrgId);
			const data = GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(data.organisation.name).toEqual(CARMENTIS_ORGANIZATION_NAME);
		})

		it('should NOT access an organization when NOT a member', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.getOrgName(firstOrgId);
			GqlResponseChecker.fromResponse(response).expectForbidden();
		})


		const SECOND_ORG_NAME = "Other"
		let secondOrgID;
		it('should create an organization as second user', async () => {
			// create the organization
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createOrg(SECOND_ORG_NAME);
			const data = GqlResponseChecker.fromResponse(response)
				.expectDefinedBody()
				.expectNoError()
				.expectDefinedData()
				.getData();
			secondOrgID = data.createOrganisation.id;
		});

		// TODO: it (second user) should create a member in the second organization
		
		// implement: third user cannot authenticate before registration
		it('third user should NOT authenticate when not registered yet', async () => {
			const challengeResponse = await GqlQuery.noAuth().getLoginChallenge();
			GqlResponseChecker.fromResponse(challengeResponse).expectNoError();
			const challenge = challengeResponse.body.data.getChallenge.challenge;
			const signature = thirdUserPrivateKey.sign(sigEncoder.decodeMessage(challenge));
			const encodedSignature = sigEncoder.encodeSignature(signature);
			const verifyResponse = await GqlQuery.noAuth().verifyChallenge(
				challenge,
				thirdUserEncodedPublicKey,
				encodedSignature,
			);
			GqlResponseChecker.fromResponse(verifyResponse).expectForbidden();
		});
		
		// implement: second user creates third user and adds them to second organization
		it('second user should create a member in the second organization', async () => {
			const createUserResponse = await GqlQuery.withAuth(secondUserAuthToken)
				.createUser(thirdUserEncodedPublicKey, 'Third', 'User', false);
			GqlResponseChecker.fromResponse(createUserResponse).expectNoError();
			const addMemberResponse = await GqlQuery.withAuth(secondUserAuthToken)
				.addUserToOrg(secondOrgID, thirdUserEncodedPublicKey);
			const data = GqlResponseChecker.fromResponse(addMemberResponse)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(data.addUserInOrganisation).toBe(true);
		});
		
		let thirdUserAuthToken;
		it('third user should authenticate', async () => {
			const challengeResponse = await GqlQuery.noAuth().getLoginChallenge();
			const challenge = challengeResponse.body.data.getChallenge.challenge;
			const signature = thirdUserPrivateKey.sign(sigEncoder.decodeMessage(challenge));
			const encodedSignature = sigEncoder.encodeSignature(signature);
			const verifyResponse = await GqlQuery.noAuth().verifyChallenge(
				challenge,
				thirdUserEncodedPublicKey,
				encodedSignature,
			);
			thirdUserAuthToken = verifyResponse.body.data.verifyChallenge.token;
			GqlResponseChecker.fromResponse(verifyResponse).expectNoError();
		});

		it('third user should create an application in the second organization', async () => {
			const response = await GqlQuery.withAuth(thirdUserAuthToken)
				.createApp('Third user app', secondOrgID);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		});
		
		it('should access an organization when NOT a member but IS admin', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.getOrgName(secondOrgID);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		})

		it('should create an application in organization when NOT a member but IS admin', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApp("Mon application", secondOrgID);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		})


		// implement: second user creates an application in the second organization and save id
		const SECOND_APP_NAME = "Second app";
		let secondAppId;
		it('second user should create an application in the second organization and save id', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createApp(SECOND_APP_NAME, secondOrgID);
			const data = GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData()
				.getData();
			secondAppId = data.createApplicationInOrganisation.id;
			expect(data.createApplicationInOrganisation.name).toBe(SECOND_APP_NAME);
		});

		it('should NOT create an application in organization when NOT a member and NOT admin', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createApp("Rejected application", firstOrgId);
			GqlResponseChecker.fromResponse(response).expectForbidden()
		})

		
		

		// implement: first user creates an API Key associated to the first application
		it('first user should create an API Key associated to the first application', async () => {
			const activeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApiKey(fileSignApplicationId, 'First app key', activeUntil);
			const data = GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(data.createApiKey).toHaveProperty('id');
			expect(data.createApiKey).toHaveProperty('name', 'First app key');
			expect(typeof data.createApiKey.key).toBe('string');
		});

		// implement: second user should NOT create an API Key associated to the first application (not member nor admin)
		it('second user should NOT create an API Key associated to the first application', async () => {
			const activeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.createApiKey(fileSignApplicationId, 'Forbidden key', activeUntil);
			GqlResponseChecker.fromResponse(response).expectForbidden();
		});

		// implement: first user creates an API key associated to the second application (is admin)
		it('first user should create an API key associated to the second application (is admin)', async () => {
			const activeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.createApiKey(secondAppId, 'Second app key', activeUntil);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		});

		it('first user should add a node entity in the first organization', async () => {
			const alias = 'first-org-node-1';
			const rpc = 'http://first-org-node-1:26657';
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.importNodeInOrg(firstOrgId, alias, rpc);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
			// verify node is present
			const getOrgResp = await GqlQuery.withAuth(firstUserAuthToken)
				.getOrgWithNodes(firstOrgId);
			const data = GqlResponseChecker.fromResponse(getOrgResp)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(Array.isArray(data.organisation.nodes)).toBe(true);
			expect(data.organisation.nodes.some(n => n.nodeAlias === alias)).toBe(true);
		});

		it('second user should NOT add a node entity in the first organization', async () => {
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.importNodeInOrg(firstOrgId, 'unauthorized-node', 'http://unauth:26657');
			GqlResponseChecker.fromResponse(response).expectForbidden();
		});

		it('second user should add a node entity in the second organization', async () => {
			const alias = 'second-org-node-second-user';
			const rpc = 'http://second-org-node-2:26657';
			const response = await GqlQuery.withAuth(secondUserAuthToken)
				.importNodeInOrg(secondOrgID, alias, rpc);
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		});

		it('first user (admin) should add a node entity in the second organization', async () => {
			const response = await GqlQuery.withAuth(firstUserAuthToken)
				.importNodeInOrg(secondOrgID, 'second-org-node-admin', 'http://second-org-node-admin:26657');
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
		});

		it('third user should add a node entity in the second organization', async () => {
			const alias = 'second-org-node-third-user';
			const response = await GqlQuery.withAuth(thirdUserAuthToken)
				.importNodeInOrg(secondOrgID, alias, 'http://second-org-node-3:26657');
			GqlResponseChecker.fromResponse(response)
				.expectNoError()
				.expectDefinedData();
			// verify via member user
			const getOrgResp = await GqlQuery.withAuth(secondUserAuthToken)
				.getOrgWithNodes(secondOrgID);
			const data = GqlResponseChecker.fromResponse(getOrgResp)
				.expectNoError()
				.expectDefinedData()
				.getData();
			expect(data.organisation.nodes.some(n => n.nodeAlias === alias)).toBe(true);
		});
	});






})

 */