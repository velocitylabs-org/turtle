import type React from 'react'
import { useEffect, useState } from 'react'

interface DelayProps {
  /** The delay period in milliseconds */
  millis: number
  /** Children component(s) */
  children?: React.ReactNode
}

export default function Delayed({ millis, children }: DelayProps) {
  const [shouldShow, setShouldShow] = useState<boolean>(false)

  // Should show when the delay timeout is reached
  useEffect(() => {
    const timer = setTimeout(() => setShouldShow(true), millis)
    return () => clearTimeout(timer)
  }, [millis])

  // Render
  return shouldShow ? children : null
}
