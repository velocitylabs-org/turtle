import React, { useEffect, useState } from 'react'

interface DelayProps {
  /** The delay period in milliseconds */
  millis: number
  /** Children component(s) */
  children?: React.ReactNode
}

const Delayed: React.FC<DelayProps> = ({ millis, children }) => {
  const [shouldShow, setShouldShow] = useState<boolean>(false)

  // Should show when the delay timeout is reached
  useEffect(() => {
    const timer = setTimeout(() => setShouldShow(true), millis)
    return () => clearTimeout(timer)
  }, [millis])

  // Render
  return shouldShow ? children : null
}

export default Delayed
