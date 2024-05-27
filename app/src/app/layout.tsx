import NotificationSystem from '@/components/NotificationSystem'
import { config } from '@/config'
import Web3ModalProvider from '@/context'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🐢 Turtle',
  description: 'Token transfers done right',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationSystem />
        <Web3ModalProvider initialState={initialState}>{children}</Web3ModalProvider>
      </body>
    </html>
  )
}
