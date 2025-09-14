/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            }
        ]
    }
}

export default nextConfig