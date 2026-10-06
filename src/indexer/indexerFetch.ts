/**
 * Mutator used by the orval-generated indexer client (see orval.config.ts).
 *
 * The generated functions only know relative paths (`/api/v1/...`) and the
 * indexer differs per wallet, so the base URL travels with each call in the
 * `baseUrl` property of the request options (see IndexerService).
 */

export type IndexerRequestInit = RequestInit & { baseUrl?: string };

export class IndexerRequestError extends Error {
    constructor(
        readonly url: string,
        readonly status: number,
        readonly body: string,
    ) {
        super(`Indexer request ${url} failed with status ${status}`);
    }
}

export const indexerFetch = async <T>(url: string, options: IndexerRequestInit = {}): Promise<T> => {
    const { baseUrl, ...init } = options;
    if (!baseUrl) throw new Error(`No indexer base URL provided for request ${url}`);

    // Plain concatenation: `new URL(url, baseUrl)` would drop any path prefix of baseUrl.
    const target = `${baseUrl.replace(/\/+$/, '')}${url}`;
    const res = await fetch(target, init);

    const body = [204, 205, 304].includes(res.status) ? '' : await res.text();
    if (!res.ok) throw new IndexerRequestError(target, res.status, body);

    const data = body ? JSON.parse(body) : {};
    return { data, status: res.status, headers: res.headers } as T;
};
