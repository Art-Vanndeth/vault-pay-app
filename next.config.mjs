/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    devIndicators: false,
    // Optimize bundle size
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    // Reduce Fast Refresh sensitivity
    onDemandEntries: {
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },

    // Optimize images
    images: {
        formats: ['image/webp', 'image/avif'],
        unoptimized: true, // Added from updates
    },

    // Webpack optimizations
    webpack: (config, {dev, isServer}) => {
        if (!dev && !isServer) {
            // Production optimizations
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            };
        }

        return config;
    },

    // Added from updates
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
