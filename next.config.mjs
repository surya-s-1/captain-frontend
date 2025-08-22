/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    basePath: '/app',
    assetPrefix: '/app/',
    output: 'export',
    images: {
        unoptimized: true
    }
}

export default nextConfig