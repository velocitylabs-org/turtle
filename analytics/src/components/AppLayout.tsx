'use client'
import { cn } from '@velocitylabs-org/turtle-ui'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useState, useEffect } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import NavigationMenu from '@/components/NavigationMenu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { routes, RouteItem } from '@/constants/routes'
import useIsMobile from '@/hooks/useMobile'

const headerHeight = 75

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: DashboardLayoutProps) {
  const { start } = useLoadingBar()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [nowFormatted, setNowFormatted] = useState('')

  useEffect(() => {
    // Only run on client-side after hydration
    const now = new Date()
    setNowFormatted(
      `Updated ${now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })}`,
    )
  }, [])

  const activeRoute = routes.find(
    (route: RouteItem) =>
      route.href === pathname ||
      (route.href === '/detail' && pathname?.startsWith('/detail/')),
  )
  const onNavItemClicked = (isActive: boolean, externalLink: boolean) => {
    if (isActive) return
    if (!externalLink) {
      start() // Show loading bar
    }
    if (isMobile) {
      setIsSidebarOpen(prev => !prev)
    }
  }

  return (
    <div className="relative h-full bg-muted/40">
      {/* Mobile Navigation */}
      <Sheet open={isMobile ? isSidebarOpen : false} onOpenChange={open => setIsSidebarOpen(open)}>
        <SheetContent side="left" className="w-72 bg-background/95 p-0 backdrop-blur-sm">
          <NavigationMenu routes={routes} onNavItemClicked={onNavItemClicked} pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 hidden h-full w-64 flex-col border-r bg-background transition-all duration-300 md:flex',
          isSidebarOpen ? 'left-0' : '-left-64',
        )}
      >
        <NavigationMenu routes={routes} onNavItemClicked={onNavItemClicked} pathname={pathname} />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen bg-muted transition-all duration-300',
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0',
        )}
      >
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b-[1px] border-muted px-4 backdrop-blur backdrop-filter md:px-8"
          style={{ height: headerHeight }}
        >
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="mr-4 flex"
              onClick={() => setIsSidebarOpen(prev => !prev)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">{activeRoute?.label}</h1>
              <span className="relative -top-[2px] block text-[12px] md:hidden">
                {nowFormatted}
              </span>
            </div>
          </div>
          <span className="hidden text-sm text-muted-foreground md:block">{nowFormatted}</span>
        </header>
        {/* Pages */}
        <div className="h-full p-4 pb-10 pt-0 md:p-8 md:pb-6 md:pt-0">{children}</div>
      </main>
    </div>
  )
}
