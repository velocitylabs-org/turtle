import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/utils/cn'
import Header from '@/components/header'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🐢 Turtle',
  description: 'The ultimate token transfer platform for Polkadot',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="turtleTheme" className="h-full">
      <body className={cn(inter.className, 'flex h-full flex-col')}>
        <Header />
        <main className="h-full flex-1 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
