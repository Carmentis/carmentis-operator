import type { NextConfig } from "next";


const nextConfig: NextConfig = {
    crossOrigin: 'anonymous',
    env: {
        PUBLIC_NEXT_WORKSPACE_API_BASE_URL: process.env.PUBLIC_NEXT_WORKSPACE_API_BASE_URL,
    },
};

export default nextConfig;


