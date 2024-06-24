import Navbar from '@/components/NavBar'
import NotificationSystem from '@/components/NotificationSystem'
import { dazzed } from '@/components/fonts/fonts'
import { config } from '@/config'
import Web3ModalProvider from '@/context'
import { NextUIProvider } from '@nextui-org/react'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { twMerge } from 'tailwind-merge'
import { cookieToInitialState } from 'wagmi'
import './globals.css'

export const metadata: Metadata = {
  title: 'Turtle',
  description: 'Token transfers done right',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en" className="h-full">
      <head>
        {(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-project-id="SlFMjRvrnJwnEVBIlInfhVSOgIROWJD9Bp8Q2PTk"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
      </head>
      <body
        className={twMerge(
          dazzed.variable,
          'min-h-full bg-turtle-tertiary font-dazzed font-medium',
        )}
      >
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
