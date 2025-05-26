import './globals.css'
import { ReactNode } from 'react'
import AppLayout from '@/components/AppLayout'
import AppProvider from '@/components/AppProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="bg-muted/60">
      <body suppressHydrationWarning>
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  )
}
