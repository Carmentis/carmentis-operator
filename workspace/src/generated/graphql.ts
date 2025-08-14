import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type ApiKeyType = {
  activeUntil: Scalars['DateTime']['output'];
  application: ApplicationType;
  countUsages: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  partialKey: Scalars['String']['output'];
  usages: Array<ApiKeyUsageType>;
};


export type ApiKeyTypeCountUsagesArgs = {
  filterByUnauthorised: Scalars['Boolean']['input'];
};


export type ApiKeyTypeUsagesArgs = {
  filterByUnauthorized?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type ApiKeyUsageType = {
  id: Scalars['Float']['output'];
  ip: Scalars['String']['output'];
  requestMethod: Scalars['String']['output'];
  requestUrl: Scalars['String']['output'];
  responseStatus: Scalars['String']['output'];
  usedAt: Scalars['DateTime']['output'];
};

export type ApplicationType = {
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  domain?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isDraft: Scalars['Boolean']['output'];
  lastUpdateAt: Scalars['DateTime']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organisationId: Scalars['Int']['output'];
  published: Scalars['Boolean']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  version: Scalars['Int']['output'];
  virtualBlockchainId?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type ApplicationUpdateDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type ChallengeEntity = {
  challenge: Scalars['String']['output'];
};

export type ChallengeVerificationResponse = {
  token: Scalars['String']['output'];
};

export type Mutation = {
  addUserInOrganisation: Scalars['Boolean']['output'];
  changeOrganisationKeyPair: Scalars['Boolean']['output'];
  claimNodeInOrganisation: NodeEntity;
  createApiKey: RevealedApiKeyType;
  createApplicationInOrganisation: ApplicationType;
  createOrganisation: OrganisationEntity;
  createUser: UserEntity;
  deleteApiKey: Scalars['Boolean']['output'];
  deleteApplicationInOrganisation: Scalars['Boolean']['output'];
  deleteNodeInOrganisation: Scalars['Boolean']['output'];
  deleteOrganisation: OrganisationEntity;
  deleteUser: UserEntity;
  forceChainSync: Scalars['Boolean']['output'];
  importNodeInOrganisation: Scalars['Boolean']['output'];
  publishApplication: Scalars['Boolean']['output'];
  publishOrganisation: Scalars['Boolean']['output'];
  removeUserFromOrganisation: Scalars['Boolean']['output'];
  setupFirstAdministrator: Scalars['Boolean']['output'];
  updateApiKey: Scalars['Boolean']['output'];
  updateApplicationInOrganisation: ApplicationType;
  updateNodeInOrganisation: NodeEntity;
  updateOrganisation: OrganisationEntity;
  updateUserAdminStatus: UserEntity;
  verifyChallenge: ChallengeVerificationResponse;
};


export type MutationAddUserInOrganisationArgs = {
  organisationId: Scalars['Int']['input'];
  userPublicKey: Scalars['String']['input'];
};


export type MutationChangeOrganisationKeyPairArgs = {
  organisationId: Scalars['Int']['input'];
  privateKey: Scalars['String']['input'];
};


export type MutationClaimNodeInOrganisationArgs = {
  nodeId: Scalars['Int']['input'];
  organisationId: Scalars['Int']['input'];
};


export type MutationCreateApiKeyArgs = {
  activeUntil: Scalars['String']['input'];
  applicationId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateApplicationInOrganisationArgs = {
  applicationName: Scalars['String']['input'];
  organisationId: Scalars['Int']['input'];
};


export type MutationCreateOrganisationArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  firstname: Scalars['String']['input'];
  isAdmin: Scalars['Boolean']['input'];
  lastname: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
};


export type MutationDeleteApiKeyArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteApplicationInOrganisationArgs = {
  applicationId: Scalars['Int']['input'];
};


export type MutationDeleteNodeInOrganisationArgs = {
  nodeId: Scalars['Int']['input'];
  organisationId: Scalars['Int']['input'];
};


export type MutationDeleteOrganisationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  publicKey: Scalars['String']['input'];
};


export type MutationForceChainSyncArgs = {
  id: Scalars['Int']['input'];
};


export type MutationImportNodeInOrganisationArgs = {
  nodeAlias: Scalars['String']['input'];
  nodeRpcEndpoint: Scalars['String']['input'];
  organisationId: Scalars['Int']['input'];
};


export type MutationPublishApplicationArgs = {
  applicationId: Scalars['Int']['input'];
};


export type MutationPublishOrganisationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveUserFromOrganisationArgs = {
  organisationId: Scalars['Int']['input'];
  userPublicKey: Scalars['String']['input'];
};


export type MutationSetupFirstAdministratorArgs = {
  setupFirstAdmin: SetupFirstAdminDto;
};


export type MutationUpdateApiKeyArgs = {
  activeUntil?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateApplicationInOrganisationArgs = {
  applicationId: Scalars['Int']['input'];
  applicationUpdate: ApplicationUpdateDto;
};


export type MutationUpdateNodeInOrganisationArgs = {
  nodeAlias: Scalars['String']['input'];
  nodeId: Scalars['Int']['input'];
  nodeRpcEndpoint: Scalars['String']['input'];
  organisationId: Scalars['Int']['input'];
};


export type MutationUpdateOrganisationArgs = {
  city: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  website: Scalars['String']['input'];
};


export type MutationUpdateUserAdminStatusArgs = {
  isAdmin: Scalars['Boolean']['input'];
  publicKey: Scalars['String']['input'];
};


export type MutationVerifyChallengeArgs = {
  challenge: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
  signature: Scalars['String']['input'];
};

export type NodeEntity = {
  id: Scalars['Float']['output'];
  includedAt: Scalars['DateTime']['output'];
  isClaimable: Scalars['Boolean']['output'];
  nodeAlias: Scalars['String']['output'];
  rpcEndpoint: Scalars['String']['output'];
  virtualBlockchainId?: Maybe<Scalars['String']['output']>;
};

export type OrganisationChainStatusType = {
  hasEditedOrganization: Scalars['Boolean']['output'];
  hasTokenAccount: Scalars['Boolean']['output'];
  isPublishedOnChain: Scalars['Boolean']['output'];
};

export type OrganisationEntity = {
  balance: Scalars['String']['output'];
  chainStatus: OrganisationChainStatusType;
  city: Scalars['String']['output'];
  countryCode: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  hasTokenAccount: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  isAnchoredOnChain: Scalars['Boolean']['output'];
  isDraft: Scalars['Boolean']['output'];
  lastUpdateAt: Scalars['DateTime']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nodes: Array<NodeEntity>;
  publicSignatureKey: Scalars['String']['output'];
  published: Scalars['Boolean']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  transactions: Array<TransactionType>;
  users: Array<UserEntity>;
  version: Scalars['Int']['output'];
  virtualBlockchainId?: Maybe<Scalars['String']['output']>;
  website: Scalars['String']['output'];
};


export type OrganisationEntityTransactionsArgs = {
  fromHistoryHash?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
};

export type OrganisationStatsDto = {
  numberOfApplications: Scalars['Int']['output'];
  numberOfUsers: Scalars['Int']['output'];
};

export type Query = {
  getAllApiKeysOfApplication: Array<ApiKeyType>;
  getAllApiKeysOfOrganisation: Array<ApiKeyType>;
  getAllApplications: Array<ApplicationType>;
  getAllApplicationsInOrganisation: Array<ApplicationType>;
  getAllUsers: Array<UserEntity>;
  getApiKey: ApiKeyType;
  getApplicationInOrganisation: ApplicationType;
  getChallenge: ChallengeEntity;
  getCurrentUser: UserEntity;
  getLinkedNode: Scalars['String']['output'];
  getOrganisationStatistics: OrganisationStatsDto;
  getUserByPublicKey: UserEntity;
  isInitialised: Scalars['Boolean']['output'];
  organisation: OrganisationEntity;
  organisations: Array<OrganisationEntity>;
  searchUser: Array<UserEntity>;
};


export type QueryGetAllApiKeysOfApplicationArgs = {
  applicationId: Scalars['Int']['input'];
};


export type QueryGetAllApiKeysOfOrganisationArgs = {
  organisationId: Scalars['Int']['input'];
};


export type QueryGetAllApplicationsInOrganisationArgs = {
  organisationId: Scalars['Int']['input'];
};


export type QueryGetApiKeyArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetApplicationInOrganisationArgs = {
  applicationId: Scalars['Int']['input'];
};


export type QueryGetOrganisationStatisticsArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetUserByPublicKeyArgs = {
  publicKey: Scalars['String']['input'];
};


export type QueryOrganisationArgs = {
  id: Scalars['Int']['input'];
};


export type QuerySearchUserArgs = {
  search: Scalars['String']['input'];
};

export type RevealedApiKeyType = {
  activeUntil: Scalars['DateTime']['output'];
  application: ApplicationType;
  countUsages: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  partialKey: Scalars['String']['output'];
  usages: Array<ApiKeyUsageType>;
};


export type RevealedApiKeyTypeCountUsagesArgs = {
  filterByUnauthorised: Scalars['Boolean']['input'];
};


export type RevealedApiKeyTypeUsagesArgs = {
  filterByUnauthorized?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type SetupFirstAdminDto = {
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type TransactionType = {
  amount: Scalars['String']['output'];
  amountInAtomics: Scalars['Float']['output'];
  chainReference: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  linkedAccount: Scalars['String']['output'];
  previousHistoryHash: Scalars['String']['output'];
  transferredAt: Scalars['String']['output'];
};

export type UserEntity = {
  firstname: Scalars['String']['output'];
  isAdmin: Scalars['Boolean']['output'];
  lastname: Scalars['String']['output'];
  publicKey: Scalars['String']['output'];
};

export type GetInitialisationStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInitialisationStatusQuery = { isInitialised: boolean };

export type GetLinkedNodeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLinkedNodeQuery = { getLinkedNode: string };

export type GetAllApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllApplicationsQuery = { getAllApplications: Array<{ name: string, logoUrl?: string | null, virtualBlockchainId?: string | null, createdAt: any, organisationId: number, id: number }> };

export type SetupFirstAdministratorMutationVariables = Exact<{
  setupFirstAdmin: SetupFirstAdminDto;
}>;


export type SetupFirstAdministratorMutation = { setupFirstAdministrator: boolean };

export type UpdateNodeInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  nodeId: Scalars['Int']['input'];
  nodeAlias: Scalars['String']['input'];
  nodeRpcEndpoint: Scalars['String']['input'];
}>;


export type UpdateNodeInOrganisationMutation = { updateNodeInOrganisation: { id: number, nodeAlias: string, includedAt: any, virtualBlockchainId?: string | null, rpcEndpoint: string, isClaimable: boolean } };

export type GetChallengeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChallengeQuery = { getChallenge: { challenge: string } };

export type IsInitialisedQueryVariables = Exact<{ [key: string]: never; }>;


export type IsInitialisedQuery = { isInitialised: boolean };

export type VerifyChallengeMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
  signature: Scalars['String']['input'];
}>;


export type VerifyChallengeMutation = { verifyChallenge: { token: string } };

export type UserEntityFragment = { publicKey: string, isAdmin: boolean, firstname: string, lastname: string };

export type GetOrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganisationsQuery = { organisations: Array<{ id: number, name: string, publicSignatureKey: string, hasTokenAccount: boolean, createdAt: any, virtualBlockchainId?: string | null }> };

export type GetOrganisationQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetOrganisationQuery = { organisation: { id: number, name: string, publicSignatureKey: string, createdAt: any, logoUrl?: string | null, published: boolean, balance: string, isDraft: boolean, publishedAt?: any | null, city: string, website: string, countryCode: string, virtualBlockchainId?: string | null, version: number } };

export type GetOrganisationBalanceQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetOrganisationBalanceQuery = { organisation: { id: number, balance: string, hasTokenAccount: boolean } };

export type GetOrganisationStatisticsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetOrganisationStatisticsQuery = { getOrganisationStatistics: { numberOfApplications: number, numberOfUsers: number } };

export type CreateOrganisationMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateOrganisationMutation = { createOrganisation: { id: number, name: string, publicSignatureKey: string } };

export type UpdateOrganisationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  website: Scalars['String']['input'];
  city: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
}>;


export type UpdateOrganisationMutation = { updateOrganisation: { id: number } };

export type PublishOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
}>;


export type PublishOrganisationMutation = { publishOrganisation: boolean };

export type PublishApplicationMutationVariables = Exact<{
  applicationId: Scalars['Int']['input'];
}>;


export type PublishApplicationMutation = { publishApplication: boolean };

export type DeleteOrganisationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteOrganisationMutation = { deleteOrganisation: { id: number } };

export type ApiKeyDescriptionFragment = { id: number, isActive: boolean, activeUntil: any, name: string, partialKey: string, createdAt: any, application: { id: number, name: string } };

export type ApiKeyUsageFragment = { id: number, ip: string, requestMethod: string, requestUrl: string, responseStatus: string, usedAt: any };

export type GetApiKeyQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetApiKeyQuery = { getApiKey: { id: number, isActive: boolean, activeUntil: any, name: string, partialKey: string, createdAt: any, application: { id: number, name: string } } };

export type GetApiKeysQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetApiKeysQuery = { getAllApiKeysOfOrganisation: Array<{ id: number, isActive: boolean, activeUntil: any, name: string, partialKey: string, createdAt: any, application: { id: number, name: string } }> };

export type GetApiKeyUsageQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  filterByUnauthorised: Scalars['Boolean']['input'];
}>;


export type GetApiKeyUsageQuery = { getApiKey: { countUsages: number, id: number, isActive: boolean, activeUntil: any, name: string, partialKey: string, createdAt: any, usages: Array<{ id: number, ip: string, requestMethod: string, requestUrl: string, responseStatus: string, usedAt: any }>, application: { id: number, name: string } } };

export type UpdateKeyMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  activeUntil?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateKeyMutation = { updateApiKey: boolean };

export type ForceChainSyncMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ForceChainSyncMutation = { forceChainSync: boolean };

export type GetUsersInOrganisationQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetUsersInOrganisationQuery = { organisation: { users: Array<{ publicKey: string, isAdmin: boolean, firstname: string, lastname: string }> } };

export type AddExistingUserInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  userPublicKey: Scalars['String']['input'];
}>;


export type AddExistingUserInOrganisationMutation = { addUserInOrganisation: boolean };

export type RemoveUserInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  userPublicKey: Scalars['String']['input'];
}>;


export type RemoveUserInOrganisationMutation = { removeUserFromOrganisation: boolean };

export type ApplicationSummaryTypeFragment = { id: number, name: string, isDraft: boolean, publishedAt?: any | null, published: boolean, version: number };

export type ApplicationTypeFragment = { website?: string | null, description?: string | null, domain?: string | null, virtualBlockchainId?: string | null, logoUrl?: string | null, id: number, name: string, isDraft: boolean, publishedAt?: any | null, published: boolean, version: number };

export type GetAllApplicationsInOrganisationQueryVariables = Exact<{
  organisationId: Scalars['Int']['input'];
}>;


export type GetAllApplicationsInOrganisationQuery = { getAllApplicationsInOrganisation: Array<{ id: number, name: string, isDraft: boolean, publishedAt?: any | null, published: boolean, version: number }> };

export type GetApplicationInOrganisationQueryVariables = Exact<{
  applicationId: Scalars['Int']['input'];
}>;


export type GetApplicationInOrganisationQuery = { getApplicationInOrganisation: { website?: string | null, description?: string | null, domain?: string | null, virtualBlockchainId?: string | null, logoUrl?: string | null, id: number, name: string, isDraft: boolean, publishedAt?: any | null, published: boolean, version: number } };

export type CreateApplicationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  applicationName: Scalars['String']['input'];
}>;


export type CreateApplicationMutation = { createApplicationInOrganisation: { id: number } };

export type UpdateApplicationMutationVariables = Exact<{
  applicationId: Scalars['Int']['input'];
  application: ApplicationUpdateDto;
}>;


export type UpdateApplicationMutation = { updateApplicationInOrganisation: { id: number } };

export type DeleteApplicationMutationVariables = Exact<{
  applicationId: Scalars['Int']['input'];
}>;


export type DeleteApplicationMutation = { deleteApplicationInOrganisation: boolean };

export type GetAllApiKeysInApplicationQueryVariables = Exact<{
  applicationId: Scalars['Int']['input'];
}>;


export type GetAllApiKeysInApplicationQuery = { getAllApiKeysOfApplication: Array<{ id: number, isActive: boolean, activeUntil: any, name: string, partialKey: string, createdAt: any, application: { id: number, name: string } }> };

export type CreatedApiKeyFragment = { name: string, activeUntil: any, key: string };

export type CreateApiKeyInApplicationMutationVariables = Exact<{
  applicationId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  activeUntil: Scalars['String']['input'];
}>;


export type CreateApiKeyInApplicationMutation = { createApiKey: { name: string, activeUntil: any, key: string } };

export type ChangeOrganisationKeyMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  privateKey: Scalars['String']['input'];
}>;


export type ChangeOrganisationKeyMutation = { changeOrganisationKeyPair: boolean };

export type DeleteApiKeyMutationVariables = Exact<{
  keyId: Scalars['Int']['input'];
}>;


export type DeleteApiKeyMutation = { deleteApiKey: boolean };

export type TransactionFragment = { amount: string, linkedAccount: string, chainReference: string, previousHistoryHash: string, transferredAt: string, label: string, amountInAtomics: number, height: number };

export type GetTransactionsOfOrganisationQueryVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  fromHash?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTransactionsOfOrganisationQuery = { organisation: { hasTokenAccount: boolean, transactions: Array<{ amount: string, linkedAccount: string, chainReference: string, previousHistoryHash: string, transferredAt: string, label: string, amountInAtomics: number, height: number }> } };

export type HasPublishedAccountOnChainQueryVariables = Exact<{
  organisationId: Scalars['Int']['input'];
}>;


export type HasPublishedAccountOnChainQuery = { organisation: { hasTokenAccount: boolean } };

export type GetOrganisationChainStatusQueryVariables = Exact<{
  organisationId: Scalars['Int']['input'];
}>;


export type GetOrganisationChainStatusQuery = { organisation: { chainStatus: { hasTokenAccount: boolean, isPublishedOnChain: boolean, hasEditedOrganization: boolean } } };

export type NodeFragmentFragment = { id: number, nodeAlias: string, includedAt: any, virtualBlockchainId?: string | null, rpcEndpoint: string, isClaimable: boolean };

export type GetAllNodesQueryVariables = Exact<{
  organisationId: Scalars['Int']['input'];
}>;


export type GetAllNodesQuery = { organisation: { nodes: Array<{ id: number, nodeAlias: string, includedAt: any, virtualBlockchainId?: string | null, rpcEndpoint: string, isClaimable: boolean }> } };

export type ImportNodeInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  nodeAlias: Scalars['String']['input'];
  nodeRpcEndpoint: Scalars['String']['input'];
}>;


export type ImportNodeInOrganisationMutation = { importNodeInOrganisation: boolean };

export type DeleteNodeInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  nodeId: Scalars['Int']['input'];
}>;


export type DeleteNodeInOrganisationMutation = { deleteNodeInOrganisation: boolean };

export type ClaimNodeInOrganisationMutationVariables = Exact<{
  organisationId: Scalars['Int']['input'];
  nodeId: Scalars['Int']['input'];
}>;


export type ClaimNodeInOrganisationMutation = { claimNodeInOrganisation: { id: number, nodeAlias: string, includedAt: any, virtualBlockchainId?: string | null, rpcEndpoint: string, isClaimable: boolean } };

export type UserFragment = { publicKey: string, firstname: string, lastname: string, isAdmin: boolean };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { getCurrentUser: { publicKey: string, firstname: string, lastname: string, isAdmin: boolean } };

export type GetAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersQuery = { getAllUsers: Array<{ publicKey: string, firstname: string, lastname: string, isAdmin: boolean }> };

export type CreateUserMutationVariables = Exact<{
  publicKey: Scalars['String']['input'];
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  isAdmin: Scalars['Boolean']['input'];
}>;


export type CreateUserMutation = { createUser: { publicKey: string } };

export type SearchUserQueryVariables = Exact<{
  search: Scalars['String']['input'];
}>;


export type SearchUserQuery = { searchUser: Array<{ publicKey: string, firstname: string, lastname: string, isAdmin: boolean }> };

export type DeleteUserMutationVariables = Exact<{
  publicKey: Scalars['String']['input'];
}>;


export type DeleteUserMutation = { deleteUser: { publicKey: string } };

export type UpdateUserAdminMutationVariables = Exact<{
  publicKey: Scalars['String']['input'];
  isAdmin: Scalars['Boolean']['input'];
}>;


export type UpdateUserAdminMutation = { updateUserAdminStatus: { publicKey: string, firstname: string, lastname: string, isAdmin: boolean } };

export const UserEntityFragmentDoc = gql`
    fragment UserEntity on UserEntity {
  publicKey
  isAdmin
  firstname
  lastname
}
    `;
export const ApiKeyDescriptionFragmentDoc = gql`
    fragment ApiKeyDescription on ApiKeyType {
  id
  isActive
  activeUntil
  name
  partialKey
  createdAt
  application {
    id
    name
  }
}
    `;
export const ApiKeyUsageFragmentDoc = gql`
    fragment ApiKeyUsage on ApiKeyUsageType {
  id
  ip
  requestMethod
  requestUrl
  responseStatus
  usedAt
}
    `;
export const ApplicationSummaryTypeFragmentDoc = gql`
    fragment ApplicationSummaryType on ApplicationType {
  id
  name
  isDraft
  publishedAt
  published
  version
}
    `;
export const ApplicationTypeFragmentDoc = gql`
    fragment ApplicationType on ApplicationType {
  ...ApplicationSummaryType
  website
  description
  domain
  website
  virtualBlockchainId
  logoUrl
}
    ${ApplicationSummaryTypeFragmentDoc}`;
export const CreatedApiKeyFragmentDoc = gql`
    fragment CreatedApiKey on RevealedApiKeyType {
  name
  activeUntil
  key
}
    `;
export const TransactionFragmentDoc = gql`
    fragment Transaction on TransactionType {
  amount
  linkedAccount
  chainReference
  previousHistoryHash
  transferredAt
  label
  amountInAtomics
  height
}
    `;
export const NodeFragmentFragmentDoc = gql`
    fragment NodeFragment on NodeEntity {
  id
  nodeAlias
  includedAt
  virtualBlockchainId
  rpcEndpoint
  isClaimable
}
    `;
export const UserFragmentDoc = gql`
    fragment User on UserEntity {
  publicKey
  firstname
  lastname
  isAdmin
}
    `;
export const GetInitialisationStatusDocument = gql`
    query getInitialisationStatus {
  isInitialised
}
    `;

/**
 * __useGetInitialisationStatusQuery__
 *
 * To run a query within a React component, call `useGetInitialisationStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInitialisationStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInitialisationStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetInitialisationStatusQuery(baseOptions?: Apollo.QueryHookOptions<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>(GetInitialisationStatusDocument, options);
      }
export function useGetInitialisationStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>(GetInitialisationStatusDocument, options);
        }
export function useGetInitialisationStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>(GetInitialisationStatusDocument, options);
        }
export type GetInitialisationStatusQueryHookResult = ReturnType<typeof useGetInitialisationStatusQuery>;
export type GetInitialisationStatusLazyQueryHookResult = ReturnType<typeof useGetInitialisationStatusLazyQuery>;
export type GetInitialisationStatusSuspenseQueryHookResult = ReturnType<typeof useGetInitialisationStatusSuspenseQuery>;
export type GetInitialisationStatusQueryResult = Apollo.QueryResult<GetInitialisationStatusQuery, GetInitialisationStatusQueryVariables>;
export const GetLinkedNodeDocument = gql`
    query getLinkedNode {
  getLinkedNode
}
    `;

/**
 * __useGetLinkedNodeQuery__
 *
 * To run a query within a React component, call `useGetLinkedNodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLinkedNodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLinkedNodeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLinkedNodeQuery(baseOptions?: Apollo.QueryHookOptions<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>(GetLinkedNodeDocument, options);
      }
export function useGetLinkedNodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>(GetLinkedNodeDocument, options);
        }
export function useGetLinkedNodeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>(GetLinkedNodeDocument, options);
        }
export type GetLinkedNodeQueryHookResult = ReturnType<typeof useGetLinkedNodeQuery>;
export type GetLinkedNodeLazyQueryHookResult = ReturnType<typeof useGetLinkedNodeLazyQuery>;
export type GetLinkedNodeSuspenseQueryHookResult = ReturnType<typeof useGetLinkedNodeSuspenseQuery>;
export type GetLinkedNodeQueryResult = Apollo.QueryResult<GetLinkedNodeQuery, GetLinkedNodeQueryVariables>;
export const GetAllApplicationsDocument = gql`
    query getAllApplications {
  getAllApplications {
    name
    logoUrl
    virtualBlockchainId
    createdAt
    organisationId
    id
  }
}
    `;

/**
 * __useGetAllApplicationsQuery__
 *
 * To run a query within a React component, call `useGetAllApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllApplicationsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>(GetAllApplicationsDocument, options);
      }
export function useGetAllApplicationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>(GetAllApplicationsDocument, options);
        }
export function useGetAllApplicationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>(GetAllApplicationsDocument, options);
        }
export type GetAllApplicationsQueryHookResult = ReturnType<typeof useGetAllApplicationsQuery>;
export type GetAllApplicationsLazyQueryHookResult = ReturnType<typeof useGetAllApplicationsLazyQuery>;
export type GetAllApplicationsSuspenseQueryHookResult = ReturnType<typeof useGetAllApplicationsSuspenseQuery>;
export type GetAllApplicationsQueryResult = Apollo.QueryResult<GetAllApplicationsQuery, GetAllApplicationsQueryVariables>;
export const SetupFirstAdministratorDocument = gql`
    mutation setupFirstAdministrator($setupFirstAdmin: SetupFirstAdminDto!) {
  setupFirstAdministrator(setupFirstAdmin: $setupFirstAdmin)
}
    `;
export type SetupFirstAdministratorMutationFn = Apollo.MutationFunction<SetupFirstAdministratorMutation, SetupFirstAdministratorMutationVariables>;

/**
 * __useSetupFirstAdministratorMutation__
 *
 * To run a mutation, you first call `useSetupFirstAdministratorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupFirstAdministratorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupFirstAdministratorMutation, { data, loading, error }] = useSetupFirstAdministratorMutation({
 *   variables: {
 *      setupFirstAdmin: // value for 'setupFirstAdmin'
 *   },
 * });
 */
export function useSetupFirstAdministratorMutation(baseOptions?: Apollo.MutationHookOptions<SetupFirstAdministratorMutation, SetupFirstAdministratorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetupFirstAdministratorMutation, SetupFirstAdministratorMutationVariables>(SetupFirstAdministratorDocument, options);
      }
export type SetupFirstAdministratorMutationHookResult = ReturnType<typeof useSetupFirstAdministratorMutation>;
export type SetupFirstAdministratorMutationResult = Apollo.MutationResult<SetupFirstAdministratorMutation>;
export type SetupFirstAdministratorMutationOptions = Apollo.BaseMutationOptions<SetupFirstAdministratorMutation, SetupFirstAdministratorMutationVariables>;
export const UpdateNodeInOrganisationDocument = gql`
    mutation updateNodeInOrganisation($organisationId: Int!, $nodeId: Int!, $nodeAlias: String!, $nodeRpcEndpoint: String!) {
  updateNodeInOrganisation(
    organisationId: $organisationId
    nodeId: $nodeId
    nodeAlias: $nodeAlias
    nodeRpcEndpoint: $nodeRpcEndpoint
  ) {
    ...NodeFragment
  }
}
    ${NodeFragmentFragmentDoc}`;
export type UpdateNodeInOrganisationMutationFn = Apollo.MutationFunction<UpdateNodeInOrganisationMutation, UpdateNodeInOrganisationMutationVariables>;

/**
 * __useUpdateNodeInOrganisationMutation__
 *
 * To run a mutation, you first call `useUpdateNodeInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNodeInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNodeInOrganisationMutation, { data, loading, error }] = useUpdateNodeInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      nodeId: // value for 'nodeId'
 *      nodeAlias: // value for 'nodeAlias'
 *      nodeRpcEndpoint: // value for 'nodeRpcEndpoint'
 *   },
 * });
 */
export function useUpdateNodeInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNodeInOrganisationMutation, UpdateNodeInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNodeInOrganisationMutation, UpdateNodeInOrganisationMutationVariables>(UpdateNodeInOrganisationDocument, options);
      }
export type UpdateNodeInOrganisationMutationHookResult = ReturnType<typeof useUpdateNodeInOrganisationMutation>;
export type UpdateNodeInOrganisationMutationResult = Apollo.MutationResult<UpdateNodeInOrganisationMutation>;
export type UpdateNodeInOrganisationMutationOptions = Apollo.BaseMutationOptions<UpdateNodeInOrganisationMutation, UpdateNodeInOrganisationMutationVariables>;
export const GetChallengeDocument = gql`
    query getChallenge {
  getChallenge {
    challenge
  }
}
    `;

/**
 * __useGetChallengeQuery__
 *
 * To run a query within a React component, call `useGetChallengeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChallengeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChallengeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetChallengeQuery(baseOptions?: Apollo.QueryHookOptions<GetChallengeQuery, GetChallengeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChallengeQuery, GetChallengeQueryVariables>(GetChallengeDocument, options);
      }
export function useGetChallengeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChallengeQuery, GetChallengeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChallengeQuery, GetChallengeQueryVariables>(GetChallengeDocument, options);
        }
export function useGetChallengeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChallengeQuery, GetChallengeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChallengeQuery, GetChallengeQueryVariables>(GetChallengeDocument, options);
        }
export type GetChallengeQueryHookResult = ReturnType<typeof useGetChallengeQuery>;
export type GetChallengeLazyQueryHookResult = ReturnType<typeof useGetChallengeLazyQuery>;
export type GetChallengeSuspenseQueryHookResult = ReturnType<typeof useGetChallengeSuspenseQuery>;
export type GetChallengeQueryResult = Apollo.QueryResult<GetChallengeQuery, GetChallengeQueryVariables>;
export const IsInitialisedDocument = gql`
    query isInitialised {
  isInitialised
}
    `;

/**
 * __useIsInitialisedQuery__
 *
 * To run a query within a React component, call `useIsInitialisedQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsInitialisedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsInitialisedQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsInitialisedQuery(baseOptions?: Apollo.QueryHookOptions<IsInitialisedQuery, IsInitialisedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsInitialisedQuery, IsInitialisedQueryVariables>(IsInitialisedDocument, options);
      }
export function useIsInitialisedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsInitialisedQuery, IsInitialisedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsInitialisedQuery, IsInitialisedQueryVariables>(IsInitialisedDocument, options);
        }
export function useIsInitialisedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<IsInitialisedQuery, IsInitialisedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<IsInitialisedQuery, IsInitialisedQueryVariables>(IsInitialisedDocument, options);
        }
export type IsInitialisedQueryHookResult = ReturnType<typeof useIsInitialisedQuery>;
export type IsInitialisedLazyQueryHookResult = ReturnType<typeof useIsInitialisedLazyQuery>;
export type IsInitialisedSuspenseQueryHookResult = ReturnType<typeof useIsInitialisedSuspenseQuery>;
export type IsInitialisedQueryResult = Apollo.QueryResult<IsInitialisedQuery, IsInitialisedQueryVariables>;
export const VerifyChallengeDocument = gql`
    mutation verifyChallenge($challenge: String!, $publicKey: String!, $signature: String!) {
  verifyChallenge(
    challenge: $challenge
    publicKey: $publicKey
    signature: $signature
  ) {
    token
  }
}
    `;
export type VerifyChallengeMutationFn = Apollo.MutationFunction<VerifyChallengeMutation, VerifyChallengeMutationVariables>;

/**
 * __useVerifyChallengeMutation__
 *
 * To run a mutation, you first call `useVerifyChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyChallengeMutation, { data, loading, error }] = useVerifyChallengeMutation({
 *   variables: {
 *      challenge: // value for 'challenge'
 *      publicKey: // value for 'publicKey'
 *      signature: // value for 'signature'
 *   },
 * });
 */
export function useVerifyChallengeMutation(baseOptions?: Apollo.MutationHookOptions<VerifyChallengeMutation, VerifyChallengeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyChallengeMutation, VerifyChallengeMutationVariables>(VerifyChallengeDocument, options);
      }
export type VerifyChallengeMutationHookResult = ReturnType<typeof useVerifyChallengeMutation>;
export type VerifyChallengeMutationResult = Apollo.MutationResult<VerifyChallengeMutation>;
export type VerifyChallengeMutationOptions = Apollo.BaseMutationOptions<VerifyChallengeMutation, VerifyChallengeMutationVariables>;
export const GetOrganisationsDocument = gql`
    query GetOrganisations {
  organisations {
    id
    name
    publicSignatureKey
    hasTokenAccount
    createdAt
    virtualBlockchainId
  }
}
    `;

/**
 * __useGetOrganisationsQuery__
 *
 * To run a query within a React component, call `useGetOrganisationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganisationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganisationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrganisationsQuery(baseOptions?: Apollo.QueryHookOptions<GetOrganisationsQuery, GetOrganisationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganisationsQuery, GetOrganisationsQueryVariables>(GetOrganisationsDocument, options);
      }
export function useGetOrganisationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganisationsQuery, GetOrganisationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganisationsQuery, GetOrganisationsQueryVariables>(GetOrganisationsDocument, options);
        }
export function useGetOrganisationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganisationsQuery, GetOrganisationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganisationsQuery, GetOrganisationsQueryVariables>(GetOrganisationsDocument, options);
        }
export type GetOrganisationsQueryHookResult = ReturnType<typeof useGetOrganisationsQuery>;
export type GetOrganisationsLazyQueryHookResult = ReturnType<typeof useGetOrganisationsLazyQuery>;
export type GetOrganisationsSuspenseQueryHookResult = ReturnType<typeof useGetOrganisationsSuspenseQuery>;
export type GetOrganisationsQueryResult = Apollo.QueryResult<GetOrganisationsQuery, GetOrganisationsQueryVariables>;
export const GetOrganisationDocument = gql`
    query GetOrganisation($id: Int!) {
  organisation(id: $id) {
    id
    name
    publicSignatureKey
    createdAt
    logoUrl
    published
    balance
    isDraft
    publishedAt
    city
    website
    countryCode
    virtualBlockchainId
    version
  }
}
    `;

/**
 * __useGetOrganisationQuery__
 *
 * To run a query within a React component, call `useGetOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganisationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrganisationQuery(baseOptions: Apollo.QueryHookOptions<GetOrganisationQuery, GetOrganisationQueryVariables> & ({ variables: GetOrganisationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganisationQuery, GetOrganisationQueryVariables>(GetOrganisationDocument, options);
      }
export function useGetOrganisationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganisationQuery, GetOrganisationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganisationQuery, GetOrganisationQueryVariables>(GetOrganisationDocument, options);
        }
export function useGetOrganisationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganisationQuery, GetOrganisationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganisationQuery, GetOrganisationQueryVariables>(GetOrganisationDocument, options);
        }
export type GetOrganisationQueryHookResult = ReturnType<typeof useGetOrganisationQuery>;
export type GetOrganisationLazyQueryHookResult = ReturnType<typeof useGetOrganisationLazyQuery>;
export type GetOrganisationSuspenseQueryHookResult = ReturnType<typeof useGetOrganisationSuspenseQuery>;
export type GetOrganisationQueryResult = Apollo.QueryResult<GetOrganisationQuery, GetOrganisationQueryVariables>;
export const GetOrganisationBalanceDocument = gql`
    query GetOrganisationBalance($id: Int!) {
  organisation(id: $id) {
    id
    balance
    hasTokenAccount
  }
}
    `;

/**
 * __useGetOrganisationBalanceQuery__
 *
 * To run a query within a React component, call `useGetOrganisationBalanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganisationBalanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganisationBalanceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrganisationBalanceQuery(baseOptions: Apollo.QueryHookOptions<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables> & ({ variables: GetOrganisationBalanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>(GetOrganisationBalanceDocument, options);
      }
export function useGetOrganisationBalanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>(GetOrganisationBalanceDocument, options);
        }
export function useGetOrganisationBalanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>(GetOrganisationBalanceDocument, options);
        }
export type GetOrganisationBalanceQueryHookResult = ReturnType<typeof useGetOrganisationBalanceQuery>;
export type GetOrganisationBalanceLazyQueryHookResult = ReturnType<typeof useGetOrganisationBalanceLazyQuery>;
export type GetOrganisationBalanceSuspenseQueryHookResult = ReturnType<typeof useGetOrganisationBalanceSuspenseQuery>;
export type GetOrganisationBalanceQueryResult = Apollo.QueryResult<GetOrganisationBalanceQuery, GetOrganisationBalanceQueryVariables>;
export const GetOrganisationStatisticsDocument = gql`
    query GetOrganisationStatistics($id: Int!) {
  getOrganisationStatistics(id: $id) {
    numberOfApplications
    numberOfUsers
  }
}
    `;

/**
 * __useGetOrganisationStatisticsQuery__
 *
 * To run a query within a React component, call `useGetOrganisationStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganisationStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganisationStatisticsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrganisationStatisticsQuery(baseOptions: Apollo.QueryHookOptions<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables> & ({ variables: GetOrganisationStatisticsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>(GetOrganisationStatisticsDocument, options);
      }
export function useGetOrganisationStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>(GetOrganisationStatisticsDocument, options);
        }
export function useGetOrganisationStatisticsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>(GetOrganisationStatisticsDocument, options);
        }
export type GetOrganisationStatisticsQueryHookResult = ReturnType<typeof useGetOrganisationStatisticsQuery>;
export type GetOrganisationStatisticsLazyQueryHookResult = ReturnType<typeof useGetOrganisationStatisticsLazyQuery>;
export type GetOrganisationStatisticsSuspenseQueryHookResult = ReturnType<typeof useGetOrganisationStatisticsSuspenseQuery>;
export type GetOrganisationStatisticsQueryResult = Apollo.QueryResult<GetOrganisationStatisticsQuery, GetOrganisationStatisticsQueryVariables>;
export const CreateOrganisationDocument = gql`
    mutation CreateOrganisation($name: String!) {
  createOrganisation(name: $name) {
    id
    name
    publicSignatureKey
  }
}
    `;
export type CreateOrganisationMutationFn = Apollo.MutationFunction<CreateOrganisationMutation, CreateOrganisationMutationVariables>;

/**
 * __useCreateOrganisationMutation__
 *
 * To run a mutation, you first call `useCreateOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganisationMutation, { data, loading, error }] = useCreateOrganisationMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrganisationMutation, CreateOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrganisationMutation, CreateOrganisationMutationVariables>(CreateOrganisationDocument, options);
      }
export type CreateOrganisationMutationHookResult = ReturnType<typeof useCreateOrganisationMutation>;
export type CreateOrganisationMutationResult = Apollo.MutationResult<CreateOrganisationMutation>;
export type CreateOrganisationMutationOptions = Apollo.BaseMutationOptions<CreateOrganisationMutation, CreateOrganisationMutationVariables>;
export const UpdateOrganisationDocument = gql`
    mutation UpdateOrganisation($id: Int!, $name: String!, $website: String!, $city: String!, $countryCode: String!) {
  updateOrganisation(
    id: $id
    name: $name
    website: $website
    city: $city
    countryCode: $countryCode
  ) {
    id
  }
}
    `;
export type UpdateOrganisationMutationFn = Apollo.MutationFunction<UpdateOrganisationMutation, UpdateOrganisationMutationVariables>;

/**
 * __useUpdateOrganisationMutation__
 *
 * To run a mutation, you first call `useUpdateOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganisationMutation, { data, loading, error }] = useUpdateOrganisationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      website: // value for 'website'
 *      city: // value for 'city'
 *      countryCode: // value for 'countryCode'
 *   },
 * });
 */
export function useUpdateOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOrganisationMutation, UpdateOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOrganisationMutation, UpdateOrganisationMutationVariables>(UpdateOrganisationDocument, options);
      }
export type UpdateOrganisationMutationHookResult = ReturnType<typeof useUpdateOrganisationMutation>;
export type UpdateOrganisationMutationResult = Apollo.MutationResult<UpdateOrganisationMutation>;
export type UpdateOrganisationMutationOptions = Apollo.BaseMutationOptions<UpdateOrganisationMutation, UpdateOrganisationMutationVariables>;
export const PublishOrganisationDocument = gql`
    mutation PublishOrganisation($organisationId: Int!) {
  publishOrganisation(id: $organisationId)
}
    `;
export type PublishOrganisationMutationFn = Apollo.MutationFunction<PublishOrganisationMutation, PublishOrganisationMutationVariables>;

/**
 * __usePublishOrganisationMutation__
 *
 * To run a mutation, you first call `usePublishOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishOrganisationMutation, { data, loading, error }] = usePublishOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *   },
 * });
 */
export function usePublishOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<PublishOrganisationMutation, PublishOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishOrganisationMutation, PublishOrganisationMutationVariables>(PublishOrganisationDocument, options);
      }
export type PublishOrganisationMutationHookResult = ReturnType<typeof usePublishOrganisationMutation>;
export type PublishOrganisationMutationResult = Apollo.MutationResult<PublishOrganisationMutation>;
export type PublishOrganisationMutationOptions = Apollo.BaseMutationOptions<PublishOrganisationMutation, PublishOrganisationMutationVariables>;
export const PublishApplicationDocument = gql`
    mutation PublishApplication($applicationId: Int!) {
  publishApplication(applicationId: $applicationId)
}
    `;
export type PublishApplicationMutationFn = Apollo.MutationFunction<PublishApplicationMutation, PublishApplicationMutationVariables>;

/**
 * __usePublishApplicationMutation__
 *
 * To run a mutation, you first call `usePublishApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishApplicationMutation, { data, loading, error }] = usePublishApplicationMutation({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function usePublishApplicationMutation(baseOptions?: Apollo.MutationHookOptions<PublishApplicationMutation, PublishApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishApplicationMutation, PublishApplicationMutationVariables>(PublishApplicationDocument, options);
      }
export type PublishApplicationMutationHookResult = ReturnType<typeof usePublishApplicationMutation>;
export type PublishApplicationMutationResult = Apollo.MutationResult<PublishApplicationMutation>;
export type PublishApplicationMutationOptions = Apollo.BaseMutationOptions<PublishApplicationMutation, PublishApplicationMutationVariables>;
export const DeleteOrganisationDocument = gql`
    mutation DeleteOrganisation($id: Int!) {
  deleteOrganisation(id: $id) {
    id
  }
}
    `;
export type DeleteOrganisationMutationFn = Apollo.MutationFunction<DeleteOrganisationMutation, DeleteOrganisationMutationVariables>;

/**
 * __useDeleteOrganisationMutation__
 *
 * To run a mutation, you first call `useDeleteOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganisationMutation, { data, loading, error }] = useDeleteOrganisationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOrganisationMutation, DeleteOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOrganisationMutation, DeleteOrganisationMutationVariables>(DeleteOrganisationDocument, options);
      }
export type DeleteOrganisationMutationHookResult = ReturnType<typeof useDeleteOrganisationMutation>;
export type DeleteOrganisationMutationResult = Apollo.MutationResult<DeleteOrganisationMutation>;
export type DeleteOrganisationMutationOptions = Apollo.BaseMutationOptions<DeleteOrganisationMutation, DeleteOrganisationMutationVariables>;
export const GetApiKeyDocument = gql`
    query GetApiKey($id: Int!) {
  getApiKey(id: $id) {
    ...ApiKeyDescription
  }
}
    ${ApiKeyDescriptionFragmentDoc}`;

/**
 * __useGetApiKeyQuery__
 *
 * To run a query within a React component, call `useGetApiKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeyQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetApiKeyQuery(baseOptions: Apollo.QueryHookOptions<GetApiKeyQuery, GetApiKeyQueryVariables> & ({ variables: GetApiKeyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeyQuery, GetApiKeyQueryVariables>(GetApiKeyDocument, options);
      }
export function useGetApiKeyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeyQuery, GetApiKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeyQuery, GetApiKeyQueryVariables>(GetApiKeyDocument, options);
        }
export function useGetApiKeySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApiKeyQuery, GetApiKeyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApiKeyQuery, GetApiKeyQueryVariables>(GetApiKeyDocument, options);
        }
export type GetApiKeyQueryHookResult = ReturnType<typeof useGetApiKeyQuery>;
export type GetApiKeyLazyQueryHookResult = ReturnType<typeof useGetApiKeyLazyQuery>;
export type GetApiKeySuspenseQueryHookResult = ReturnType<typeof useGetApiKeySuspenseQuery>;
export type GetApiKeyQueryResult = Apollo.QueryResult<GetApiKeyQuery, GetApiKeyQueryVariables>;
export const GetApiKeysDocument = gql`
    query GetApiKeys($id: Int!) {
  getAllApiKeysOfOrganisation(organisationId: $id) {
    ...ApiKeyDescription
  }
}
    ${ApiKeyDescriptionFragmentDoc}`;

/**
 * __useGetApiKeysQuery__
 *
 * To run a query within a React component, call `useGetApiKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeysQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetApiKeysQuery(baseOptions: Apollo.QueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables> & ({ variables: GetApiKeysQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
      }
export function useGetApiKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
        }
export function useGetApiKeysSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
        }
export type GetApiKeysQueryHookResult = ReturnType<typeof useGetApiKeysQuery>;
export type GetApiKeysLazyQueryHookResult = ReturnType<typeof useGetApiKeysLazyQuery>;
export type GetApiKeysSuspenseQueryHookResult = ReturnType<typeof useGetApiKeysSuspenseQuery>;
export type GetApiKeysQueryResult = Apollo.QueryResult<GetApiKeysQuery, GetApiKeysQueryVariables>;
export const GetApiKeyUsageDocument = gql`
    query GetApiKeyUsage($id: Int!, $offset: Int!, $limit: Int!, $filterByUnauthorised: Boolean!) {
  getApiKey(id: $id) {
    countUsages(filterByUnauthorised: $filterByUnauthorised)
  }
  getApiKey(id: $id) {
    ...ApiKeyDescription
    usages(
      limit: $limit
      offset: $offset
      filterByUnauthorized: $filterByUnauthorised
    ) {
      ...ApiKeyUsage
    }
  }
}
    ${ApiKeyDescriptionFragmentDoc}
${ApiKeyUsageFragmentDoc}`;

/**
 * __useGetApiKeyUsageQuery__
 *
 * To run a query within a React component, call `useGetApiKeyUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeyUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeyUsageQuery({
 *   variables: {
 *      id: // value for 'id'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      filterByUnauthorised: // value for 'filterByUnauthorised'
 *   },
 * });
 */
export function useGetApiKeyUsageQuery(baseOptions: Apollo.QueryHookOptions<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables> & ({ variables: GetApiKeyUsageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>(GetApiKeyUsageDocument, options);
      }
export function useGetApiKeyUsageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>(GetApiKeyUsageDocument, options);
        }
export function useGetApiKeyUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>(GetApiKeyUsageDocument, options);
        }
export type GetApiKeyUsageQueryHookResult = ReturnType<typeof useGetApiKeyUsageQuery>;
export type GetApiKeyUsageLazyQueryHookResult = ReturnType<typeof useGetApiKeyUsageLazyQuery>;
export type GetApiKeyUsageSuspenseQueryHookResult = ReturnType<typeof useGetApiKeyUsageSuspenseQuery>;
export type GetApiKeyUsageQueryResult = Apollo.QueryResult<GetApiKeyUsageQuery, GetApiKeyUsageQueryVariables>;
export const UpdateKeyDocument = gql`
    mutation UpdateKey($id: Int!, $name: String!, $isActive: Boolean!, $activeUntil: String) {
  updateApiKey(
    id: $id
    name: $name
    isActive: $isActive
    activeUntil: $activeUntil
  )
}
    `;
export type UpdateKeyMutationFn = Apollo.MutationFunction<UpdateKeyMutation, UpdateKeyMutationVariables>;

/**
 * __useUpdateKeyMutation__
 *
 * To run a mutation, you first call `useUpdateKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateKeyMutation, { data, loading, error }] = useUpdateKeyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      isActive: // value for 'isActive'
 *      activeUntil: // value for 'activeUntil'
 *   },
 * });
 */
export function useUpdateKeyMutation(baseOptions?: Apollo.MutationHookOptions<UpdateKeyMutation, UpdateKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateKeyMutation, UpdateKeyMutationVariables>(UpdateKeyDocument, options);
      }
export type UpdateKeyMutationHookResult = ReturnType<typeof useUpdateKeyMutation>;
export type UpdateKeyMutationResult = Apollo.MutationResult<UpdateKeyMutation>;
export type UpdateKeyMutationOptions = Apollo.BaseMutationOptions<UpdateKeyMutation, UpdateKeyMutationVariables>;
export const ForceChainSyncDocument = gql`
    mutation forceChainSync($id: Int!) {
  forceChainSync(id: $id)
}
    `;
export type ForceChainSyncMutationFn = Apollo.MutationFunction<ForceChainSyncMutation, ForceChainSyncMutationVariables>;

/**
 * __useForceChainSyncMutation__
 *
 * To run a mutation, you first call `useForceChainSyncMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForceChainSyncMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forceChainSyncMutation, { data, loading, error }] = useForceChainSyncMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useForceChainSyncMutation(baseOptions?: Apollo.MutationHookOptions<ForceChainSyncMutation, ForceChainSyncMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForceChainSyncMutation, ForceChainSyncMutationVariables>(ForceChainSyncDocument, options);
      }
export type ForceChainSyncMutationHookResult = ReturnType<typeof useForceChainSyncMutation>;
export type ForceChainSyncMutationResult = Apollo.MutationResult<ForceChainSyncMutation>;
export type ForceChainSyncMutationOptions = Apollo.BaseMutationOptions<ForceChainSyncMutation, ForceChainSyncMutationVariables>;
export const GetUsersInOrganisationDocument = gql`
    query GetUsersInOrganisation($id: Int!) {
  organisation(id: $id) {
    users {
      ...UserEntity
    }
  }
}
    ${UserEntityFragmentDoc}`;

/**
 * __useGetUsersInOrganisationQuery__
 *
 * To run a query within a React component, call `useGetUsersInOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersInOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersInOrganisationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUsersInOrganisationQuery(baseOptions: Apollo.QueryHookOptions<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables> & ({ variables: GetUsersInOrganisationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>(GetUsersInOrganisationDocument, options);
      }
export function useGetUsersInOrganisationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>(GetUsersInOrganisationDocument, options);
        }
export function useGetUsersInOrganisationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>(GetUsersInOrganisationDocument, options);
        }
export type GetUsersInOrganisationQueryHookResult = ReturnType<typeof useGetUsersInOrganisationQuery>;
export type GetUsersInOrganisationLazyQueryHookResult = ReturnType<typeof useGetUsersInOrganisationLazyQuery>;
export type GetUsersInOrganisationSuspenseQueryHookResult = ReturnType<typeof useGetUsersInOrganisationSuspenseQuery>;
export type GetUsersInOrganisationQueryResult = Apollo.QueryResult<GetUsersInOrganisationQuery, GetUsersInOrganisationQueryVariables>;
export const AddExistingUserInOrganisationDocument = gql`
    mutation AddExistingUserInOrganisation($organisationId: Int!, $userPublicKey: String!) {
  addUserInOrganisation(
    organisationId: $organisationId
    userPublicKey: $userPublicKey
  )
}
    `;
export type AddExistingUserInOrganisationMutationFn = Apollo.MutationFunction<AddExistingUserInOrganisationMutation, AddExistingUserInOrganisationMutationVariables>;

/**
 * __useAddExistingUserInOrganisationMutation__
 *
 * To run a mutation, you first call `useAddExistingUserInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddExistingUserInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addExistingUserInOrganisationMutation, { data, loading, error }] = useAddExistingUserInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      userPublicKey: // value for 'userPublicKey'
 *   },
 * });
 */
export function useAddExistingUserInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<AddExistingUserInOrganisationMutation, AddExistingUserInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddExistingUserInOrganisationMutation, AddExistingUserInOrganisationMutationVariables>(AddExistingUserInOrganisationDocument, options);
      }
export type AddExistingUserInOrganisationMutationHookResult = ReturnType<typeof useAddExistingUserInOrganisationMutation>;
export type AddExistingUserInOrganisationMutationResult = Apollo.MutationResult<AddExistingUserInOrganisationMutation>;
export type AddExistingUserInOrganisationMutationOptions = Apollo.BaseMutationOptions<AddExistingUserInOrganisationMutation, AddExistingUserInOrganisationMutationVariables>;
export const RemoveUserInOrganisationDocument = gql`
    mutation removeUserInOrganisation($organisationId: Int!, $userPublicKey: String!) {
  removeUserFromOrganisation(
    organisationId: $organisationId
    userPublicKey: $userPublicKey
  )
}
    `;
export type RemoveUserInOrganisationMutationFn = Apollo.MutationFunction<RemoveUserInOrganisationMutation, RemoveUserInOrganisationMutationVariables>;

/**
 * __useRemoveUserInOrganisationMutation__
 *
 * To run a mutation, you first call `useRemoveUserInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserInOrganisationMutation, { data, loading, error }] = useRemoveUserInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      userPublicKey: // value for 'userPublicKey'
 *   },
 * });
 */
export function useRemoveUserInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<RemoveUserInOrganisationMutation, RemoveUserInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveUserInOrganisationMutation, RemoveUserInOrganisationMutationVariables>(RemoveUserInOrganisationDocument, options);
      }
export type RemoveUserInOrganisationMutationHookResult = ReturnType<typeof useRemoveUserInOrganisationMutation>;
export type RemoveUserInOrganisationMutationResult = Apollo.MutationResult<RemoveUserInOrganisationMutation>;
export type RemoveUserInOrganisationMutationOptions = Apollo.BaseMutationOptions<RemoveUserInOrganisationMutation, RemoveUserInOrganisationMutationVariables>;
export const GetAllApplicationsInOrganisationDocument = gql`
    query getAllApplicationsInOrganisation($organisationId: Int!) {
  getAllApplicationsInOrganisation(organisationId: $organisationId) {
    ...ApplicationSummaryType
  }
}
    ${ApplicationSummaryTypeFragmentDoc}`;

/**
 * __useGetAllApplicationsInOrganisationQuery__
 *
 * To run a query within a React component, call `useGetAllApplicationsInOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllApplicationsInOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllApplicationsInOrganisationQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *   },
 * });
 */
export function useGetAllApplicationsInOrganisationQuery(baseOptions: Apollo.QueryHookOptions<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables> & ({ variables: GetAllApplicationsInOrganisationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>(GetAllApplicationsInOrganisationDocument, options);
      }
export function useGetAllApplicationsInOrganisationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>(GetAllApplicationsInOrganisationDocument, options);
        }
export function useGetAllApplicationsInOrganisationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>(GetAllApplicationsInOrganisationDocument, options);
        }
export type GetAllApplicationsInOrganisationQueryHookResult = ReturnType<typeof useGetAllApplicationsInOrganisationQuery>;
export type GetAllApplicationsInOrganisationLazyQueryHookResult = ReturnType<typeof useGetAllApplicationsInOrganisationLazyQuery>;
export type GetAllApplicationsInOrganisationSuspenseQueryHookResult = ReturnType<typeof useGetAllApplicationsInOrganisationSuspenseQuery>;
export type GetAllApplicationsInOrganisationQueryResult = Apollo.QueryResult<GetAllApplicationsInOrganisationQuery, GetAllApplicationsInOrganisationQueryVariables>;
export const GetApplicationInOrganisationDocument = gql`
    query getApplicationInOrganisation($applicationId: Int!) {
  getApplicationInOrganisation(applicationId: $applicationId) {
    ...ApplicationType
  }
}
    ${ApplicationTypeFragmentDoc}`;

/**
 * __useGetApplicationInOrganisationQuery__
 *
 * To run a query within a React component, call `useGetApplicationInOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationInOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationInOrganisationQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useGetApplicationInOrganisationQuery(baseOptions: Apollo.QueryHookOptions<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables> & ({ variables: GetApplicationInOrganisationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>(GetApplicationInOrganisationDocument, options);
      }
export function useGetApplicationInOrganisationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>(GetApplicationInOrganisationDocument, options);
        }
export function useGetApplicationInOrganisationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>(GetApplicationInOrganisationDocument, options);
        }
export type GetApplicationInOrganisationQueryHookResult = ReturnType<typeof useGetApplicationInOrganisationQuery>;
export type GetApplicationInOrganisationLazyQueryHookResult = ReturnType<typeof useGetApplicationInOrganisationLazyQuery>;
export type GetApplicationInOrganisationSuspenseQueryHookResult = ReturnType<typeof useGetApplicationInOrganisationSuspenseQuery>;
export type GetApplicationInOrganisationQueryResult = Apollo.QueryResult<GetApplicationInOrganisationQuery, GetApplicationInOrganisationQueryVariables>;
export const CreateApplicationDocument = gql`
    mutation createApplication($organisationId: Int!, $applicationName: String!) {
  createApplicationInOrganisation(
    organisationId: $organisationId
    applicationName: $applicationName
  ) {
    id
  }
}
    `;
export type CreateApplicationMutationFn = Apollo.MutationFunction<CreateApplicationMutation, CreateApplicationMutationVariables>;

/**
 * __useCreateApplicationMutation__
 *
 * To run a mutation, you first call `useCreateApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationMutation, { data, loading, error }] = useCreateApplicationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      applicationName: // value for 'applicationName'
 *   },
 * });
 */
export function useCreateApplicationMutation(baseOptions?: Apollo.MutationHookOptions<CreateApplicationMutation, CreateApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateApplicationMutation, CreateApplicationMutationVariables>(CreateApplicationDocument, options);
      }
export type CreateApplicationMutationHookResult = ReturnType<typeof useCreateApplicationMutation>;
export type CreateApplicationMutationResult = Apollo.MutationResult<CreateApplicationMutation>;
export type CreateApplicationMutationOptions = Apollo.BaseMutationOptions<CreateApplicationMutation, CreateApplicationMutationVariables>;
export const UpdateApplicationDocument = gql`
    mutation updateApplication($applicationId: Int!, $application: ApplicationUpdateDto!) {
  updateApplicationInOrganisation(
    applicationId: $applicationId
    applicationUpdate: $application
  ) {
    id
  }
}
    `;
export type UpdateApplicationMutationFn = Apollo.MutationFunction<UpdateApplicationMutation, UpdateApplicationMutationVariables>;

/**
 * __useUpdateApplicationMutation__
 *
 * To run a mutation, you first call `useUpdateApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApplicationMutation, { data, loading, error }] = useUpdateApplicationMutation({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *      application: // value for 'application'
 *   },
 * });
 */
export function useUpdateApplicationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateApplicationMutation, UpdateApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateApplicationMutation, UpdateApplicationMutationVariables>(UpdateApplicationDocument, options);
      }
export type UpdateApplicationMutationHookResult = ReturnType<typeof useUpdateApplicationMutation>;
export type UpdateApplicationMutationResult = Apollo.MutationResult<UpdateApplicationMutation>;
export type UpdateApplicationMutationOptions = Apollo.BaseMutationOptions<UpdateApplicationMutation, UpdateApplicationMutationVariables>;
export const DeleteApplicationDocument = gql`
    mutation deleteApplication($applicationId: Int!) {
  deleteApplicationInOrganisation(applicationId: $applicationId)
}
    `;
export type DeleteApplicationMutationFn = Apollo.MutationFunction<DeleteApplicationMutation, DeleteApplicationMutationVariables>;

/**
 * __useDeleteApplicationMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationMutation, { data, loading, error }] = useDeleteApplicationMutation({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useDeleteApplicationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApplicationMutation, DeleteApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApplicationMutation, DeleteApplicationMutationVariables>(DeleteApplicationDocument, options);
      }
export type DeleteApplicationMutationHookResult = ReturnType<typeof useDeleteApplicationMutation>;
export type DeleteApplicationMutationResult = Apollo.MutationResult<DeleteApplicationMutation>;
export type DeleteApplicationMutationOptions = Apollo.BaseMutationOptions<DeleteApplicationMutation, DeleteApplicationMutationVariables>;
export const GetAllApiKeysInApplicationDocument = gql`
    query getAllApiKeysInApplication($applicationId: Int!) {
  getAllApiKeysOfApplication(applicationId: $applicationId) {
    ...ApiKeyDescription
  }
}
    ${ApiKeyDescriptionFragmentDoc}`;

/**
 * __useGetAllApiKeysInApplicationQuery__
 *
 * To run a query within a React component, call `useGetAllApiKeysInApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllApiKeysInApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllApiKeysInApplicationQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useGetAllApiKeysInApplicationQuery(baseOptions: Apollo.QueryHookOptions<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables> & ({ variables: GetAllApiKeysInApplicationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>(GetAllApiKeysInApplicationDocument, options);
      }
export function useGetAllApiKeysInApplicationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>(GetAllApiKeysInApplicationDocument, options);
        }
export function useGetAllApiKeysInApplicationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>(GetAllApiKeysInApplicationDocument, options);
        }
export type GetAllApiKeysInApplicationQueryHookResult = ReturnType<typeof useGetAllApiKeysInApplicationQuery>;
export type GetAllApiKeysInApplicationLazyQueryHookResult = ReturnType<typeof useGetAllApiKeysInApplicationLazyQuery>;
export type GetAllApiKeysInApplicationSuspenseQueryHookResult = ReturnType<typeof useGetAllApiKeysInApplicationSuspenseQuery>;
export type GetAllApiKeysInApplicationQueryResult = Apollo.QueryResult<GetAllApiKeysInApplicationQuery, GetAllApiKeysInApplicationQueryVariables>;
export const CreateApiKeyInApplicationDocument = gql`
    mutation createApiKeyInApplication($applicationId: Int!, $name: String!, $activeUntil: String!) {
  createApiKey(
    applicationId: $applicationId
    name: $name
    activeUntil: $activeUntil
  ) {
    ...CreatedApiKey
  }
}
    ${CreatedApiKeyFragmentDoc}`;
export type CreateApiKeyInApplicationMutationFn = Apollo.MutationFunction<CreateApiKeyInApplicationMutation, CreateApiKeyInApplicationMutationVariables>;

/**
 * __useCreateApiKeyInApplicationMutation__
 *
 * To run a mutation, you first call `useCreateApiKeyInApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApiKeyInApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApiKeyInApplicationMutation, { data, loading, error }] = useCreateApiKeyInApplicationMutation({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *      name: // value for 'name'
 *      activeUntil: // value for 'activeUntil'
 *   },
 * });
 */
export function useCreateApiKeyInApplicationMutation(baseOptions?: Apollo.MutationHookOptions<CreateApiKeyInApplicationMutation, CreateApiKeyInApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateApiKeyInApplicationMutation, CreateApiKeyInApplicationMutationVariables>(CreateApiKeyInApplicationDocument, options);
      }
export type CreateApiKeyInApplicationMutationHookResult = ReturnType<typeof useCreateApiKeyInApplicationMutation>;
export type CreateApiKeyInApplicationMutationResult = Apollo.MutationResult<CreateApiKeyInApplicationMutation>;
export type CreateApiKeyInApplicationMutationOptions = Apollo.BaseMutationOptions<CreateApiKeyInApplicationMutation, CreateApiKeyInApplicationMutationVariables>;
export const ChangeOrganisationKeyDocument = gql`
    mutation changeOrganisationKey($organisationId: Int!, $privateKey: String!) {
  changeOrganisationKeyPair(
    organisationId: $organisationId
    privateKey: $privateKey
  )
}
    `;
export type ChangeOrganisationKeyMutationFn = Apollo.MutationFunction<ChangeOrganisationKeyMutation, ChangeOrganisationKeyMutationVariables>;

/**
 * __useChangeOrganisationKeyMutation__
 *
 * To run a mutation, you first call `useChangeOrganisationKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeOrganisationKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeOrganisationKeyMutation, { data, loading, error }] = useChangeOrganisationKeyMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      privateKey: // value for 'privateKey'
 *   },
 * });
 */
export function useChangeOrganisationKeyMutation(baseOptions?: Apollo.MutationHookOptions<ChangeOrganisationKeyMutation, ChangeOrganisationKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeOrganisationKeyMutation, ChangeOrganisationKeyMutationVariables>(ChangeOrganisationKeyDocument, options);
      }
export type ChangeOrganisationKeyMutationHookResult = ReturnType<typeof useChangeOrganisationKeyMutation>;
export type ChangeOrganisationKeyMutationResult = Apollo.MutationResult<ChangeOrganisationKeyMutation>;
export type ChangeOrganisationKeyMutationOptions = Apollo.BaseMutationOptions<ChangeOrganisationKeyMutation, ChangeOrganisationKeyMutationVariables>;
export const DeleteApiKeyDocument = gql`
    mutation deleteApiKey($keyId: Int!) {
  deleteApiKey(id: $keyId)
}
    `;
export type DeleteApiKeyMutationFn = Apollo.MutationFunction<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;

/**
 * __useDeleteApiKeyMutation__
 *
 * To run a mutation, you first call `useDeleteApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApiKeyMutation, { data, loading, error }] = useDeleteApiKeyMutation({
 *   variables: {
 *      keyId: // value for 'keyId'
 *   },
 * });
 */
export function useDeleteApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>(DeleteApiKeyDocument, options);
      }
export type DeleteApiKeyMutationHookResult = ReturnType<typeof useDeleteApiKeyMutation>;
export type DeleteApiKeyMutationResult = Apollo.MutationResult<DeleteApiKeyMutation>;
export type DeleteApiKeyMutationOptions = Apollo.BaseMutationOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;
export const GetTransactionsOfOrganisationDocument = gql`
    query getTransactionsOfOrganisation($organisationId: Int!, $limit: Int!, $fromHash: String) {
  organisation(id: $organisationId) {
    hasTokenAccount
    transactions(limit: $limit, fromHistoryHash: $fromHash) {
      ...Transaction
    }
  }
}
    ${TransactionFragmentDoc}`;

/**
 * __useGetTransactionsOfOrganisationQuery__
 *
 * To run a query within a React component, call `useGetTransactionsOfOrganisationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsOfOrganisationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsOfOrganisationQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      limit: // value for 'limit'
 *      fromHash: // value for 'fromHash'
 *   },
 * });
 */
export function useGetTransactionsOfOrganisationQuery(baseOptions: Apollo.QueryHookOptions<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables> & ({ variables: GetTransactionsOfOrganisationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>(GetTransactionsOfOrganisationDocument, options);
      }
export function useGetTransactionsOfOrganisationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>(GetTransactionsOfOrganisationDocument, options);
        }
export function useGetTransactionsOfOrganisationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>(GetTransactionsOfOrganisationDocument, options);
        }
export type GetTransactionsOfOrganisationQueryHookResult = ReturnType<typeof useGetTransactionsOfOrganisationQuery>;
export type GetTransactionsOfOrganisationLazyQueryHookResult = ReturnType<typeof useGetTransactionsOfOrganisationLazyQuery>;
export type GetTransactionsOfOrganisationSuspenseQueryHookResult = ReturnType<typeof useGetTransactionsOfOrganisationSuspenseQuery>;
export type GetTransactionsOfOrganisationQueryResult = Apollo.QueryResult<GetTransactionsOfOrganisationQuery, GetTransactionsOfOrganisationQueryVariables>;
export const HasPublishedAccountOnChainDocument = gql`
    query hasPublishedAccountOnChain($organisationId: Int!) {
  organisation(id: $organisationId) {
    hasTokenAccount
  }
}
    `;

/**
 * __useHasPublishedAccountOnChainQuery__
 *
 * To run a query within a React component, call `useHasPublishedAccountOnChainQuery` and pass it any options that fit your needs.
 * When your component renders, `useHasPublishedAccountOnChainQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHasPublishedAccountOnChainQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *   },
 * });
 */
export function useHasPublishedAccountOnChainQuery(baseOptions: Apollo.QueryHookOptions<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables> & ({ variables: HasPublishedAccountOnChainQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>(HasPublishedAccountOnChainDocument, options);
      }
export function useHasPublishedAccountOnChainLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>(HasPublishedAccountOnChainDocument, options);
        }
export function useHasPublishedAccountOnChainSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>(HasPublishedAccountOnChainDocument, options);
        }
export type HasPublishedAccountOnChainQueryHookResult = ReturnType<typeof useHasPublishedAccountOnChainQuery>;
export type HasPublishedAccountOnChainLazyQueryHookResult = ReturnType<typeof useHasPublishedAccountOnChainLazyQuery>;
export type HasPublishedAccountOnChainSuspenseQueryHookResult = ReturnType<typeof useHasPublishedAccountOnChainSuspenseQuery>;
export type HasPublishedAccountOnChainQueryResult = Apollo.QueryResult<HasPublishedAccountOnChainQuery, HasPublishedAccountOnChainQueryVariables>;
export const GetOrganisationChainStatusDocument = gql`
    query getOrganisationChainStatus($organisationId: Int!) {
  organisation(id: $organisationId) {
    chainStatus {
      hasTokenAccount
      isPublishedOnChain
      hasEditedOrganization
    }
  }
}
    `;

/**
 * __useGetOrganisationChainStatusQuery__
 *
 * To run a query within a React component, call `useGetOrganisationChainStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganisationChainStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganisationChainStatusQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *   },
 * });
 */
export function useGetOrganisationChainStatusQuery(baseOptions: Apollo.QueryHookOptions<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables> & ({ variables: GetOrganisationChainStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>(GetOrganisationChainStatusDocument, options);
      }
export function useGetOrganisationChainStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>(GetOrganisationChainStatusDocument, options);
        }
export function useGetOrganisationChainStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>(GetOrganisationChainStatusDocument, options);
        }
export type GetOrganisationChainStatusQueryHookResult = ReturnType<typeof useGetOrganisationChainStatusQuery>;
export type GetOrganisationChainStatusLazyQueryHookResult = ReturnType<typeof useGetOrganisationChainStatusLazyQuery>;
export type GetOrganisationChainStatusSuspenseQueryHookResult = ReturnType<typeof useGetOrganisationChainStatusSuspenseQuery>;
export type GetOrganisationChainStatusQueryResult = Apollo.QueryResult<GetOrganisationChainStatusQuery, GetOrganisationChainStatusQueryVariables>;
export const GetAllNodesDocument = gql`
    query getAllNodes($organisationId: Int!) {
  organisation(id: $organisationId) {
    nodes {
      ...NodeFragment
    }
  }
}
    ${NodeFragmentFragmentDoc}`;

/**
 * __useGetAllNodesQuery__
 *
 * To run a query within a React component, call `useGetAllNodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllNodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllNodesQuery({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *   },
 * });
 */
export function useGetAllNodesQuery(baseOptions: Apollo.QueryHookOptions<GetAllNodesQuery, GetAllNodesQueryVariables> & ({ variables: GetAllNodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllNodesQuery, GetAllNodesQueryVariables>(GetAllNodesDocument, options);
      }
export function useGetAllNodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllNodesQuery, GetAllNodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllNodesQuery, GetAllNodesQueryVariables>(GetAllNodesDocument, options);
        }
export function useGetAllNodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllNodesQuery, GetAllNodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllNodesQuery, GetAllNodesQueryVariables>(GetAllNodesDocument, options);
        }
export type GetAllNodesQueryHookResult = ReturnType<typeof useGetAllNodesQuery>;
export type GetAllNodesLazyQueryHookResult = ReturnType<typeof useGetAllNodesLazyQuery>;
export type GetAllNodesSuspenseQueryHookResult = ReturnType<typeof useGetAllNodesSuspenseQuery>;
export type GetAllNodesQueryResult = Apollo.QueryResult<GetAllNodesQuery, GetAllNodesQueryVariables>;
export const ImportNodeInOrganisationDocument = gql`
    mutation importNodeInOrganisation($organisationId: Int!, $nodeAlias: String!, $nodeRpcEndpoint: String!) {
  importNodeInOrganisation(
    organisationId: $organisationId
    nodeAlias: $nodeAlias
    nodeRpcEndpoint: $nodeRpcEndpoint
  )
}
    `;
export type ImportNodeInOrganisationMutationFn = Apollo.MutationFunction<ImportNodeInOrganisationMutation, ImportNodeInOrganisationMutationVariables>;

/**
 * __useImportNodeInOrganisationMutation__
 *
 * To run a mutation, you first call `useImportNodeInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportNodeInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importNodeInOrganisationMutation, { data, loading, error }] = useImportNodeInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      nodeAlias: // value for 'nodeAlias'
 *      nodeRpcEndpoint: // value for 'nodeRpcEndpoint'
 *   },
 * });
 */
export function useImportNodeInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<ImportNodeInOrganisationMutation, ImportNodeInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImportNodeInOrganisationMutation, ImportNodeInOrganisationMutationVariables>(ImportNodeInOrganisationDocument, options);
      }
export type ImportNodeInOrganisationMutationHookResult = ReturnType<typeof useImportNodeInOrganisationMutation>;
export type ImportNodeInOrganisationMutationResult = Apollo.MutationResult<ImportNodeInOrganisationMutation>;
export type ImportNodeInOrganisationMutationOptions = Apollo.BaseMutationOptions<ImportNodeInOrganisationMutation, ImportNodeInOrganisationMutationVariables>;
export const DeleteNodeInOrganisationDocument = gql`
    mutation deleteNodeInOrganisation($organisationId: Int!, $nodeId: Int!) {
  deleteNodeInOrganisation(organisationId: $organisationId, nodeId: $nodeId)
}
    `;
export type DeleteNodeInOrganisationMutationFn = Apollo.MutationFunction<DeleteNodeInOrganisationMutation, DeleteNodeInOrganisationMutationVariables>;

/**
 * __useDeleteNodeInOrganisationMutation__
 *
 * To run a mutation, you first call `useDeleteNodeInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNodeInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNodeInOrganisationMutation, { data, loading, error }] = useDeleteNodeInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      nodeId: // value for 'nodeId'
 *   },
 * });
 */
export function useDeleteNodeInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteNodeInOrganisationMutation, DeleteNodeInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteNodeInOrganisationMutation, DeleteNodeInOrganisationMutationVariables>(DeleteNodeInOrganisationDocument, options);
      }
export type DeleteNodeInOrganisationMutationHookResult = ReturnType<typeof useDeleteNodeInOrganisationMutation>;
export type DeleteNodeInOrganisationMutationResult = Apollo.MutationResult<DeleteNodeInOrganisationMutation>;
export type DeleteNodeInOrganisationMutationOptions = Apollo.BaseMutationOptions<DeleteNodeInOrganisationMutation, DeleteNodeInOrganisationMutationVariables>;
export const ClaimNodeInOrganisationDocument = gql`
    mutation claimNodeInOrganisation($organisationId: Int!, $nodeId: Int!) {
  claimNodeInOrganisation(organisationId: $organisationId, nodeId: $nodeId) {
    ...NodeFragment
  }
}
    ${NodeFragmentFragmentDoc}`;
export type ClaimNodeInOrganisationMutationFn = Apollo.MutationFunction<ClaimNodeInOrganisationMutation, ClaimNodeInOrganisationMutationVariables>;

/**
 * __useClaimNodeInOrganisationMutation__
 *
 * To run a mutation, you first call `useClaimNodeInOrganisationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClaimNodeInOrganisationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [claimNodeInOrganisationMutation, { data, loading, error }] = useClaimNodeInOrganisationMutation({
 *   variables: {
 *      organisationId: // value for 'organisationId'
 *      nodeId: // value for 'nodeId'
 *   },
 * });
 */
export function useClaimNodeInOrganisationMutation(baseOptions?: Apollo.MutationHookOptions<ClaimNodeInOrganisationMutation, ClaimNodeInOrganisationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ClaimNodeInOrganisationMutation, ClaimNodeInOrganisationMutationVariables>(ClaimNodeInOrganisationDocument, options);
      }
export type ClaimNodeInOrganisationMutationHookResult = ReturnType<typeof useClaimNodeInOrganisationMutation>;
export type ClaimNodeInOrganisationMutationResult = Apollo.MutationResult<ClaimNodeInOrganisationMutation>;
export type ClaimNodeInOrganisationMutationOptions = Apollo.BaseMutationOptions<ClaimNodeInOrganisationMutation, ClaimNodeInOrganisationMutationVariables>;
export const GetCurrentUserDocument = gql`
    query getCurrentUser {
  getCurrentUser {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export function useGetCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserSuspenseQueryHookResult = ReturnType<typeof useGetCurrentUserSuspenseQuery>;
export type GetCurrentUserQueryResult = Apollo.QueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const GetAllUsersDocument = gql`
    query getAllUsers {
  getAllUsers {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useGetAllUsersQuery__
 *
 * To run a query within a React component, call `useGetAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
      }
export function useGetAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
export function useGetAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
export type GetAllUsersQueryHookResult = ReturnType<typeof useGetAllUsersQuery>;
export type GetAllUsersLazyQueryHookResult = ReturnType<typeof useGetAllUsersLazyQuery>;
export type GetAllUsersSuspenseQueryHookResult = ReturnType<typeof useGetAllUsersSuspenseQuery>;
export type GetAllUsersQueryResult = Apollo.QueryResult<GetAllUsersQuery, GetAllUsersQueryVariables>;
export const CreateUserDocument = gql`
    mutation createUser($publicKey: String!, $firstname: String!, $lastname: String!, $isAdmin: Boolean!) {
  createUser(
    publicKey: $publicKey
    firstname: $firstname
    lastname: $lastname
    isAdmin: $isAdmin
  ) {
    publicKey
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      publicKey: // value for 'publicKey'
 *      firstname: // value for 'firstname'
 *      lastname: // value for 'lastname'
 *      isAdmin: // value for 'isAdmin'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const SearchUserDocument = gql`
    query searchUser($search: String!) {
  searchUser(search: $search) {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useSearchUserQuery__
 *
 * To run a query within a React component, call `useSearchUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUserQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useSearchUserQuery(baseOptions: Apollo.QueryHookOptions<SearchUserQuery, SearchUserQueryVariables> & ({ variables: SearchUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
      }
export function useSearchUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
        }
export function useSearchUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
        }
export type SearchUserQueryHookResult = ReturnType<typeof useSearchUserQuery>;
export type SearchUserLazyQueryHookResult = ReturnType<typeof useSearchUserLazyQuery>;
export type SearchUserSuspenseQueryHookResult = ReturnType<typeof useSearchUserSuspenseQuery>;
export type SearchUserQueryResult = Apollo.QueryResult<SearchUserQuery, SearchUserQueryVariables>;
export const DeleteUserDocument = gql`
    mutation deleteUser($publicKey: String!) {
  deleteUser(publicKey: $publicKey) {
    publicKey
  }
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      publicKey: // value for 'publicKey'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateUserAdminDocument = gql`
    mutation updateUserAdmin($publicKey: String!, $isAdmin: Boolean!) {
  updateUserAdminStatus(publicKey: $publicKey, isAdmin: $isAdmin) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type UpdateUserAdminMutationFn = Apollo.MutationFunction<UpdateUserAdminMutation, UpdateUserAdminMutationVariables>;

/**
 * __useUpdateUserAdminMutation__
 *
 * To run a mutation, you first call `useUpdateUserAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserAdminMutation, { data, loading, error }] = useUpdateUserAdminMutation({
 *   variables: {
 *      publicKey: // value for 'publicKey'
 *      isAdmin: // value for 'isAdmin'
 *   },
 * });
 */
export function useUpdateUserAdminMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserAdminMutation, UpdateUserAdminMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserAdminMutation, UpdateUserAdminMutationVariables>(UpdateUserAdminDocument, options);
      }
export type UpdateUserAdminMutationHookResult = ReturnType<typeof useUpdateUserAdminMutation>;
export type UpdateUserAdminMutationResult = Apollo.MutationResult<UpdateUserAdminMutation>;
export type UpdateUserAdminMutationOptions = Apollo.BaseMutationOptions<UpdateUserAdminMutation, UpdateUserAdminMutationVariables>;