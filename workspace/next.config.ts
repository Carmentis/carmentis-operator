import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_OPERATOR_URL: process.env.OPERATOR_URL,
		NEXT_PUBLIC_WORKSPACE_API: process.env.OPERATOR_URL + '/workspace/api',
		APP_VERSION: process.env.npm_package_version
	}
};

export default nextConfig;


