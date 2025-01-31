import { useEffect, useState } from 'react';

const WORKSPACE_API = process.env.WORKSPACE_API;

export function useFetch<T>(url: string, params: RequestInit | undefined) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await fetch(WORKSPACE_API + url, params);
				if (!response.ok) throw new Error(response.statusText);
				const result = await response.json();
				setData(result);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [url]);

	return { data, loading, error };
}
