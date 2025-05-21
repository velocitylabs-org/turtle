// Safely extracts the src property from a logoURI object
export function getSrcFromLogo(logoObject: { logoURI: string | Record<string, string> }): string {
  if (!logoObject?.logoURI) return ''

  if (typeof logoObject.logoURI === 'string') {
    return logoObject.logoURI
  }

  return (logoObject.logoURI as Record<string, string>).src
}
