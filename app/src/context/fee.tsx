'use client'

import { createContext, useState } from 'react'

export const FeeContext = createContext<{
  canPayFees: boolean
  setCanPayFeesGlobally: (canPayFees: boolean) => void
  canPayAdditionalFees: boolean
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees: boolean) => void
}>({
  canPayFees: false,
  setCanPayFeesGlobally: () => {},
  canPayAdditionalFees: false,
  setCanPayAdditionalFeesGlobally: () => {},
})

export const FeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [canPayFees, setCanPayFees] = useState(false)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState(false)

  return (
    <FeeContext.Provider
      value={{
        canPayFees,
        setCanPayFeesGlobally: setCanPayFees,
        canPayAdditionalFees,
        setCanPayAdditionalFeesGlobally: setCanPayAdditionalFees,
      }}
    >
      {children}
    </FeeContext.Provider>
  )
}

export default FeeProvider
