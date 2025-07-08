export function validateAppRequest(req: Request): boolean {
  return validateRequest(req, process.env.AUTH_TOKEN)
}

export function validateWidgetRequest(req: Request): boolean {
  return validateRequest(req, process.env.WIDGET_AUTH_TOKEN)
}

function validateRequest(req: Request, envToken: string = '') {
  const auth = req.headers.get('authorization')
  return auth === envToken
}
