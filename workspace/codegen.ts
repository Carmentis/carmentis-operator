import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: `../operator/src/schema.gql`,
	documents: ['src/**/*.graphql'],
	generates: {
		'src/generated/graphql.ts': {
			plugins: [
				'typescript',
				'typescript-operations',
				'typescript-react-apollo',
			],
			config: {
				withHooks: true,
				skipTypename: true,
			},
		},
	},
};

export default config;