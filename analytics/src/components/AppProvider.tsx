'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type React from 'react'
import { Suspense } from 'react'
import { LoadingBarContainer } from 'react-top-loading-bar'
import { loadingBarOpt } from '@/constants'

const queryClient = new QueryClient()
interface AppProviderProps {
  children: React.ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <Suspense>
          <LoadingBarContainer props={loadingBarOpt}>{children}</LoadingBarContainer>
        </Suspense>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}

/**
 * useQueryState uses useSearchParams under the hood, which accesses search parameters
 * without a Suspense boundary. This opts the entire page into client-side rendering,
 * causing a blank page until client-side JS loads.
 *
 * We wrap all content in Suspense to handle this gracefully and ensure proper loading behavior
 * since many pages use useQueryState.
 */
