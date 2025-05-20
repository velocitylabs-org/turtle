'use client'
import type React from 'react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, LayoutDashboard, Menu, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import cn from '@/utils/cn'
import TurtleLogo from '@/components/TurtleLogo'
import Link from 'next/link'
import useIsMobile from '@/hooks/useMobile'

const now = new Date()
const nowFormatted = `Updated ${now.toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})}`
const headerHeight = 75

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Transactions',
      icon: Repeat,
      href: '/transactions',
      active: pathname === '/transactions',
    },
  ]

  const activeRoute = routes.find(route => route.href === pathname)

  const onNavItemClicked = () => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev)
    }
  }

  return (
    <div className="relative h-full bg-muted/40">
      {/* Mobile Navigation */}
      <Sheet open={isMobile ? isSidebarOpen : false} onOpenChange={open => setIsSidebarOpen(open)}>
        <SheetContent side="left" className="w-72 bg-background/95 p-0 backdrop-blur-sm">
          <NavigationMenu routes={routes} onNavItemClicked={onNavItemClicked} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 hidden h-full w-64 flex-col border-r bg-background transition-all duration-300 md:flex',
          isSidebarOpen ? 'left-0' : '-left-64',
        )}
      >
        <NavigationMenu routes={routes} onNavItemClicked={onNavItemClicked} />
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

interface RouteItem {
  label: string
  icon: React.FC<{ className?: string }>
  href: string
  active: boolean
}

interface NavigationMenuProps {
  routes: RouteItem[]
  title?: string
  onNavItemClicked: () => void
}

function NavigationMenu({ routes, onNavItemClicked, title = 'Overview' }: NavigationMenuProps) {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="mb-2 flex items-center border-b" style={{ height: headerHeight }}>
        <TurtleLogo className="ml-5" />
        <h2 className="ml-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
          Turtle Analytics
        </h2>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">{title}</h2>
        <div className="space-y-1">
          {routes.map(route => (
            <Link
              key={route.href}
              href={route.href}
              prefetch={true}
              className={cn(
                'group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium transition hover:bg-muted hover:text-primary',
                route.active ? 'bg-muted text-primary' : 'text-muted-foreground',
              )}
              onClick={onNavItemClicked}
            >
              <div className="flex flex-1 items-center">
                <route.icon
                  className={cn(
                    'mr-3 h-4 w-4',
                    route.active ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                {route.label}
              </div>
              {route.active && <ChevronRight className="relative top-[2px] h-4 w-4" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
