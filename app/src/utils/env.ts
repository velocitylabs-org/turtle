export const isDevelopment: boolean = process.env.NODE_ENV === 'development'
export const isProduction: boolean = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
export const projectId: string | undefined = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
export const vercelDomain: string | undefined = process.env.NEXT_PUBLIC_VERCEL_URL
