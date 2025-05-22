export default function validateRequest(req: Request): boolean {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) return true

  const auth = req.headers.get('authorization')
  const expectedAuth = process.env.NEXT_PUBLIC_AUTH_TOKEN

  if (!auth || !expectedAuth) {
    return false
  }

  const origin = req.headers.get('origin')
  if (!origin) {
    return false
  }

  const allowedOrigins =
    process.env.TRANSACTION_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []
  if (!allowedOrigins.length) {
    return false
  }

  const isAllowedOrigin = allowedOrigins.includes(origin)
  const isValidAuth = auth === expectedAuth

  return isValidAuth && isAllowedOrigin
}
