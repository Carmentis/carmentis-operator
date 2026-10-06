import { defineConfig } from 'orval';

export default defineConfig({
    indexer: {
        output: {
            mode: 'tags-split',
            target: './src/generated/api.ts',
            schemas: './src/generated/models',

            client: 'fetch',
            httpClient: 'fetch',
            clean: true,
            override: {
                // The indexer URL depends on the wallet: see src/indexer/indexerFetch.ts
                mutator: {
                    path: './src/indexer/indexerFetch.ts',
                    name: 'indexerFetch',
                },
            },
        },
        input: {
            target: 'https://indexer.server4.devnet.carmentis.io/swagger-json',
        },
    },
});
