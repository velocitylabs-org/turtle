// Safely extracts the src property from a logoURI object
export function getSrcFromLogo(logoObject: { logoURI?: unknown } | unknown): string {
  if (!logoObject) return '';
  
  // If the parameter is directly a logoURI object
  if (typeof logoObject === 'object') {
    if ('logoURI' in logoObject && logoObject.logoURI) {
      const logoURI = logoObject.logoURI;
      if (typeof logoURI === 'object' && logoURI !== null && 'src' in logoURI) {
        return logoURI.src as string;
      }
    }

    else if ('src' in logoObject) {
      return logoObject.src as string;
    }
  }
  
  return '';
}
