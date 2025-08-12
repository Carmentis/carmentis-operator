import { useGetLinkedNodeQuery } from '@/generated/graphql';

export default function useNodeEndpoint() {
	return useGetLinkedNodeQuery();
}