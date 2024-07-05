export const isDevelopment: boolean = process.env.NODE_ENV === 'development'
export const isPreview: boolean = process.env.VERCEL_ENV === 'preview'
export const projectId: string | undefined = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
export const vercelDomain: string | undefined = process.env.NEXT_PUBLIC_VERCEL_URL
