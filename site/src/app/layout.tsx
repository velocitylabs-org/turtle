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
    <html lang="en" data-theme="turtleTheme" className="bg-turtle-secondary h-full">
      <body className={cn(inter.className, 'bg-turtle-secondary h-full')}>
        <main className="h-full flex-1">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
