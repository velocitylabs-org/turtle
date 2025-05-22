export default function validateRequest(req: Request): boolean {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) return true

  const auth = req.headers.get('authorization')
  const expectedAuth = process.env.NEXT_PUBLIC_AUTH_TOKEN

  return auth === expectedAuth
}
