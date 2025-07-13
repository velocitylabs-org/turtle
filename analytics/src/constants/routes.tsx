import { ChartNoAxesColumn, Coins, LayoutDashboard, Repeat, Shuffle, Waypoints } from 'lucide-react'
import type React from 'react'

export interface RouteItem {
  label: string
  href: string
  leftNavigation: boolean
  icon?: React.FC<{ className?: string }>
  external?: boolean
}

export const routes: RouteItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    leftNavigation: true,
    href: '/',
  },
  {
    label: 'Transactions',
    icon: Shuffle,
    leftNavigation: true,
    href: '/transactions',
  },
  {
    label: 'Swaps',
    icon: Repeat,
    leftNavigation: true,
    href: '/swaps',
  },
  {
    label: 'Chains',
    icon: Waypoints,
    leftNavigation: true,
    href: '/chains',
  },
  {
    label: 'Tokens',
    icon: Coins,
    leftNavigation: true,
    href: '/tokens',
  },
  {
    label: 'Analytics',
    icon: ChartNoAxesColumn,
    href: 'https://vercel.com/velocity-labs/turtle-app/analytics',
    leftNavigation: true,
    external: true,
  },
  {
    label: 'Transaction detail',
    href: '/tx-detail',
    leftNavigation: false,
  },
]
