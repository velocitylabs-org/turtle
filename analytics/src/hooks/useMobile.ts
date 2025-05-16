import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export default function useIsMobile() {
  // Default to false for server-side rendering
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // This code only runs client-side
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkIfMobile()
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', checkIfMobile)
      return () => mql.removeEventListener('change', checkIfMobile)
    }
    // Older browsers (fallback)
    else {
      mql.addListener(checkIfMobile)
      return () => mql.removeListener(checkIfMobile)
    }
  }, [])

  return isMobile
}