import * as React from 'react'
import HeroUiProvider from './HeroUiProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUiProvider>{children}</HeroUiProvider>
}
