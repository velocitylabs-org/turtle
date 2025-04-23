import * as React from 'react'
import HeroUiProvider from './HeroUiProvider'
import ReownProvider from './ReownProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReownProvider>
      <HeroUiProvider>{children}</HeroUiProvider>
    </ReownProvider>
  )
}
