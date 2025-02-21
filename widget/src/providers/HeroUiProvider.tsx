import { HeroUIProvider as HUiProvider } from '@heroui/react'

export default function HeroUiProvider({ children }: { children: React.ReactNode }) {
  return <HUiProvider>{children}</HUiProvider>
}
