'use client';

import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

console.log("API:", process.env.NEXT_PUBLIC_OPERATOR_URL)
const httpLink = new HttpLink({
	uri: `${process.env.NEXT_PUBLIC_OPERATOR_URL }/graphql`//'/api/graphql',
});

const authLink = setContext((_, { headers }) => {
	const token = typeof window !== 'undefined' ? localStorage.getItem('carmentis-token') : null;
	return {
		headers: {
			...headers,
			Authorization: token ? `Bearer ${token}` : '',
		},
	};
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		for (const err of graphQLErrors) {
			console.log(err)
			if (err.extensions?.code === 'FORBIDDEN') {
				if (typeof window !== 'undefined') {
					window.location = '/'
				}
				return;
			}
		}
	}

	if (networkError) {
		console.error('Network error:', networkError);
	}
});

const link = ApolloLink.from([errorLink, authLink, httpLink]);
export const apolloClient = new ApolloClient({
	link,
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: 'no-cache',
		},
		query: {
			fetchPolicy: 'no-cache',
			errorPolicy: 'all',
		},
		mutate: {
			errorPolicy: 'all',
		},
	}
});