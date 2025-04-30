import * as React from 'react'
import ReownProvider from './ReownProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReownProvider>{children}</ReownProvider>
}
