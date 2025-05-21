/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

const isDevelopment = process.env.NODE_ENV === 'development'
const vercelDomain = process.env.NEXT_PUBLIC_VERCEL_URL
const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''
const url = isDevelopment ? 'http://localhost:3000' : vercelUrl

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  // Related to this issue: https://github.com/vercel/next.js/issues/56887
  ...(!isProduction && { outputFileTracingRoot: '/' }),
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.experiments = { asyncWebAssembly: true, topLevelAwait: true, layers: true }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['@heroui/theme', 'lucide-react'],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: url },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // for testing purposes allow all domains. TODO restrict to specific domains.
      },
    ],
  },
  transpilePackages: ['@velocitylabs-org/turtle-ui', '@velocitylabs-org/turtle-registry'],
}

// Sentry is enabled only in production builds to ensure error tracking in the live environment.
// The Sentry SDK does not fully support Turbopack. In local development, running with the `--turbo` flag (e.g., using `next dev --turbo`)
// Therefore, to avoid these issues during development, Sentry initialization is skipped when running locally.
// In production, builds should be done without the `--turbo` flag, so that Sentry functions correctly.
// For more details, see: https://github.com/getsentry/sentry-javascript/issues/8105
const config =
  isProduction && process.env.DISABLE_SENTRY !== 'true'
    ? withSentryConfig(
        nextConfig,
        {
          // For all available options, see:
          // https://github.com/getsentry/sentry-webpack-plugin#options

          // Suppresses SDK logs
          silent: true,
          sourcemaps: {
            disable: process.env.SENTRY_DISABLE_SOURCEMAPS === 'true',
          },
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
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

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true', openAnalyzer: true })(
  config,
)
