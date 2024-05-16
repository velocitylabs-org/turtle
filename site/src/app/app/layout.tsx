export const metadata = {
  title: 'Turtle',
  description: 'The ultimate token transfer platform for Polkadot',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
