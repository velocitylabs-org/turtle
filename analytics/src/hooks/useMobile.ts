import { useState } from 'react'

export default function useIsMobile() {
  const [isMobile] = useState<boolean>(false)

  return isMobile
}
