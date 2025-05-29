export default function validateRequest(req: Request): boolean {
  const auth = req.headers.get('authorization')
  const expectedAuth = process.env.AUTH_TOKEN

  return auth === expectedAuth
}
