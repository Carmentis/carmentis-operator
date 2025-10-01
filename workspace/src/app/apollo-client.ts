'use client';

import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { env } from 'next-runtime-env';
import { useToast } from '@/app/layout';

const api = env('NEXT_PUBLIC_OPERATOR_URL')
console.log("API:", api);
const httpLink = new HttpLink({
	uri: `${api}/graphql`//'/api/graphql',
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
	const toast = useToast();
	if (graphQLErrors) {
		for (const err of graphQLErrors) {

			if ('code' in err && err.code === 'FORBIDDEN') {
				if (typeof window !== 'undefined') {
					window.location = '/'
				}
				return;
			}
			if (err.message) {
				toast.error(err.message)
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
			fetchPolicy: 'cache-and-network',
			pollInterval: 3000,
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