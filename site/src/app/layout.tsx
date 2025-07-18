import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@velocitylabs-org/turtle-ui'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { dazzed } from '@/components/fonts/fonts'

export const metadata: Metadata = {
  title: 'Turtle',
  description: 'The ultimate token transfer platform for Polkadot',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="turtleTheme" className="h-full bg-turtle-secondary">
      <body className={cn(dazzed.variable, ' h-full bg-turtle-secondary font-dazzed')}>
        <main className="h-full flex-1">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
