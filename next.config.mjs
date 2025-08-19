/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    output: 'export',
    basePath: '/app',
    assetPrefix: '/app/',
    images: {
        unoptimized: true
    }
}

export default nextConfig