import * as React from 'react'
import HeroUiProvider from './HeroUiProvider'
import ReownProvider from './ReownAppKit'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReownProvider>
      <HeroUiProvider>{children}</HeroUiProvider>
    </ReownProvider>
  )
}
