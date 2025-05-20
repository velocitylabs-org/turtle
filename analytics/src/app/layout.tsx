import './globals.css'
import AppLayout from '@/components/AppLayout'
import { ReactNode } from 'react'
import AppProvider from '@/components/AppProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="bg-muted/60">
      <body>
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  )
}
