/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // for testing purposes allow all domains. TODO restrict to specific domains.
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /HeartbeatWorker\.js$/,
        use: 'null-loader', // or asset/source, depending on needs
      })
      config.externals.push({
        '@turtle/widget': 'Widget', // adapt to your actual package name/global
      })
    }
    return config
  },
}

export default nextConfig
