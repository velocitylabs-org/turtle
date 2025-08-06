/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

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
    }
    return config
  },
}

const config =
  isProduction && process.env.SENTRY_DISABLE !== 'true'
    ? withSentryConfig(
        nextConfig,
        {
          // For all available options, see:
          // https://github.com/getsentry/sentry-webpack-plugin#options

          // Suppresses logs, not source maps
          silent: true,
          sourcemaps: {
            disable: process.env.SENTRY_DISABLE_SOURCEMAPS === 'true',
          },
          org: 'noah-joeris', // TODO: replace with actual organization
          project: 'javascript-nextjs', // TODO: replace with actual project name
        },
        {
          // For all available options, see:
          // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

          // Upload a larger set of source maps for prettier stack traces (increases build time)
          widenClientFileUpload: true,

          // Transpiles SDK to be compatible with IE11 (increases bundle size)
          transpileClientSDK: true,

          // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
          // This can increase your server load as well as your hosting bill.
          // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
          // side errors will fail.
          tunnelRoute: '/monitoring',

          // Hides source maps from generated client bundles
          hideSourceMaps: true,

          // Automatically tree-shake Sentry logger statements to reduce bundle size
          disableLogger: true,

          // Enables automatic instrumentation of Vercel Cron Monitors.
          // See the following for more information:
          // https://docs.sentry.io/product/crons/
          // https://vercel.com/docs/cron-jobs
          automaticVercelMonitors: true,
        },
      )
    : nextConfig

export default config
