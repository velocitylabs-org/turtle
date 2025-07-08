export const isDevelopment: boolean = import.meta.env.DEV
// export const isPreview: boolean =
export const isProduction: boolean = import.meta.env.PROD
export const projectId: string | undefined = import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECT_ID
export const vercelDomain: string | undefined = import.meta.env.VITE_PUBLIC_VERCEL_URL
export const environment: string | undefined = import.meta.env.VITE_PUBLIC_ENVIRONMENT

export const DWELLIR_KEY: string | undefined = import.meta.env.VITE_PUBLIC_DWELLIR_KEY
export const ALCHEMY_API_KEY = import.meta.env.VITE_PUBLIC_ALCHEMY_KEY || ''
export const OCELLOIDS_API_Key: string | undefined = import.meta.env
  .VITE_PUBLIC_OC_API_KEY_READ_WRITE

export const CACHE_REVALIDATE_IN_SECONDS = 180
export const AMOUNT_VS_FEE_RATIO: number = 10

export const ANALYTICS_DASHBOARD_BASE_URL: string =
  import.meta.env.VITE_ANALYTICS_DASHBOARD_BASE_URL || ''
export const VITE_ANALYTICS_WIDGET_AUTH_TOKEN: string =
  import.meta.env.VITE_ANALYTICS_DASHBOARD_BASE_URL || ''
