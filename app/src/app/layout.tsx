import Navbar from '@/components/NavBar'
import NotificationSystem from '@/components/NotificationSystem'
import { dazzed } from '@/components/fonts/fonts'
import { config } from '@/config'
import Web3ModalProvider from '@/context'
import { TURTLE_CONFIG } from '@/utils/turle.config'
import { NextUIProvider } from '@nextui-org/react'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { twMerge } from 'tailwind-merge'
import { cookieToInitialState } from 'wagmi'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(TURTLE_CONFIG.url!),
  title: TURTLE_CONFIG.name,
  description: TURTLE_CONFIG.description,
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))

  return (
    <html lang="en" className="h-full">
      <body className={twMerge(dazzed.variable, 'min-h-full bg-turtle-tertiary font-dazzed')}>
        <Navbar />
        <NotificationSystem />
        <Web3ModalProvider initialState={initialState}>
          <NextUIProvider>{children}</NextUIProvider>
        </Web3ModalProvider>
        <Analytics />
      </body>
    </html>
  )
}
