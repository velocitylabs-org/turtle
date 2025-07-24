'use client'

import { cn } from '@velocitylabs-org/turtle-ui'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import TurtleLogo from '@/components/TurtleLogo'
import type { RouteItem } from '@/constants/routes'

const headerHeight = 75

interface NavigationMenuProps {
  routes: RouteItem[]
  title?: string
  onNavItemClicked: (isActive: boolean, externalLink: boolean) => void
  pathname?: string
}

function NavigationMenu({ routes, onNavItemClicked, title = 'Overview', pathname }: NavigationMenuProps) {
  const isActiveRoute = (route: RouteItem) => route.href === pathname

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="mb-2 flex items-center border-b" style={{ height: headerHeight }}>
        <TurtleLogo className="ml-5" />
        <h2 className="ml-3 flex items-center gap-2 text-lg font-semibold tracking-tight">Turtle Analytics</h2>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">{title}</h2>
        <div className="space-y-1">
          {routes.map(
            route =>
              route.leftNavigation && (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium transition hover:bg-muted hover:text-primary',
                    isActiveRoute(route) ? 'bg-muted text-primary' : 'text-muted-foreground',
                  )}
                  onClick={() => onNavItemClicked(isActiveRoute(route), !!route.external)}
                  target={route.external ? '_blank' : undefined}
                  rel={route.external ? 'noopener noreferrer' : undefined}
                  prefetch
                >
                  <div className="flex flex-1 items-center">
                    {route.icon && (
                      <route.icon
                        className={cn('mr-3 h-4 w-4', isActiveRoute(route) ? 'text-primary' : 'text-muted-foreground')}
                      />
                    )}
                    {route.label}
                  </div>
                  {isActiveRoute(route) && <ChevronRight className="relative top-[2px] h-4 w-4" />}
                </Link>
              ),
          )}
        </div>
      </div>
    </div>
  )
}

export default NavigationMenu
