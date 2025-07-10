export function validateApiRequest(req: Request): boolean {
  return validateRequest(req, 'AUTH_TOKEN')
}

export function validateWidgetRequest(req: Request): boolean {
  return validateRequest(req, 'WIDGET_AUTH_TOKEN')
}

function validateRequest(req: Request, envToken: string = '') {
  const auth = req.headers.get('authorization')
  return auth === process.env[envToken]
}
