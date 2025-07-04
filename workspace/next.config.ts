import type { NextConfig } from "next";

import {makeEnvPublic} from "next-runtime-env";

makeEnvPublic("OPERATOR_URL")

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_OPERATOR_URL: process.env.OPERATOR_URL,
		NEXT_PUBLIC_WORKSPACE_API: process.env.OPERATOR_URL + '/workspace/api',
		APP_VERSION: process.env.npm_package_version
	},
	async headers() {
		return [
			{
				// matching all API routes
				source: "/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
					{ key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
					{ key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version" },
				]
			}
		]
	}
};

export default nextConfig;


