'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { LoadingBarContainer } from 'react-top-loading-bar'

const queryClient = new QueryClient()
interface AppProviderProps {
  children: React.ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingBarContainer>{children}</LoadingBarContainer>
    </QueryClientProvider>
  )
}
