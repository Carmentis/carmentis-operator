import { useAsyncFn } from 'react-use';

export function useNodeCardLogic() {
	const [{loading: deleting, error: deletionError}, deleteNode] = useAsyncFn(async () => {

	})

	return { deleting, deleteNode, deletionError }
}