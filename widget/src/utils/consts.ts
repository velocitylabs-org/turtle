export const isDevelopment: boolean = import.meta.env.DEV
// export const isPreview: boolean =
export const isProduction: boolean = import.meta.env.PROD
export const projectId: string | undefined = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
export const vercelDomain: string | undefined = import.meta.env.VITE_PUBLIC_VERCEL_URL
export const environment: string | undefined = import.meta.env.VITE_PUBLIC_ENVIRONMENT
