export const isDevelopment: boolean = process.env.NODE_ENV === 'development'
export const isPreview: boolean = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
export const isProduction: boolean = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
export const projectId: string | undefined = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
export const vercelDomain: string | undefined = process.env.NEXT_PUBLIC_VERCEL_URL
export const environment: string | undefined = process.env.NEXT_PUBLIC_ENVIRONMENT

export const isMobileDevice = (userAgent: string): boolean => {
  return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent)
}
