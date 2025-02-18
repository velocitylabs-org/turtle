import Navbar from '@/components/NavBar'
import NotificationSystem from '@/components/NotificationSystem'
import { dazzed } from '@/components/fonts/fonts'
import ContextProvider from '@/context'
import { TURTLE_CONFIG } from '@/utils/turle.config'
import { NextUIProvider } from '@nextui-org/react'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { twMerge } from 'tailwind-merge'
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

export default async function RootLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode
  }>
) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en" className="h-full">
      <body className={twMerge(dazzed.variable, 'min-h-full bg-turtle-tertiary font-dazzed')}>
        <Navbar />
        <NotificationSystem />
        <ContextProvider cookies={cookies}>
          {<NextUIProvider>{children}</NextUIProvider>}
        </ContextProvider>

        <Analytics />
      </body>
    </html>
  )
}
