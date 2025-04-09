import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { dazzed } from '@/components/fonts/fonts'
import HeroProvider from '@/components/HeroProvider'
import Navbar from '@/components/NavBar'
import NotificationSystem from '@/components/NotificationSystem'
import ContextProvider from '@/context'
import { TURTLE_CONFIG } from '@/utils/turle.config'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en" className="h-full">
      <body className={twMerge(dazzed.variable, 'min-h-full bg-turtle-tertiary font-dazzed')}>
        <Navbar />
        <NotificationSystem />
        <ContextProvider cookies={cookies}>
          <HeroProvider>{children}</HeroProvider>
        </ContextProvider>
        <Analytics />
      </body>
    </html>
  )
}
