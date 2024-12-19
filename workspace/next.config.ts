import type { NextConfig } from "next";


const nextConfig: NextConfig = {
    crossOrigin: 'anonymous',
    env: {
        NEXT_PUBLIC_WORKSPACE_API_BASE_URL: process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL,
    },
};

export default nextConfig;


