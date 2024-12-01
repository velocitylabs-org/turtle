import React, { useEffect, useState } from 'react'

interface DelayProps {
  /** The delay period in milliseconds */
  millis: number
  /** Children component(s) */
  children?: React.ReactNode
}

const Delayed: React.FC<DelayProps> = ({ millis, children }) => {
  const [shouldShow, setShouldShow] = useState<boolean>(false)

  // Show when it reaches the delay timeout
  useEffect(() => {
    setTimeout(() => {
      setShouldShow(true)
    }, millis)
  }, [millis, children])

  // Render
  return shouldShow ? children : <></>
}

export default Delayed
