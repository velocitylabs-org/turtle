import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export const isMobileDevice = (userAgent: string): boolean => {
  return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent)
}

export default function useIsMobile() {
  // Default to false for server-side rendering
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // This code only runs client-side
    const checkIfMobile = () => {
      // First check if it's a mobile device by user agent
      const userAgent = navigator.userAgent
      const isMobileByUserAgent = isMobileDevice(userAgent)

      // Then check viewport width
      const isMobileByViewport = window.innerWidth < MOBILE_BREAKPOINT

      // Consider it mobile if either condition is true
      // User agent takes precedence for actual mobile devices
      setIsMobile(isMobileByUserAgent || isMobileByViewport)
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
