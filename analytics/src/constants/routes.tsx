import { ChartNoAxesColumn, Coins, LayoutDashboard, Repeat, Shuffle, Waypoints } from 'lucide-react'
import type React from 'react'

export interface RouteItem {
  label: string
  icon: React.FC<{ className?: string }>
  href: string
  external?: boolean
}

export const routes: RouteItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Transactions',
    icon: Shuffle,
    href: '/transactions',
  },
  {
    label: 'Swaps',
    icon: Repeat,
    href: '/swaps',
  },
  {
    label: 'Chains',
    icon: Waypoints,
    href: '/chains',
  },
  {
    label: 'Tokens',
    icon: Coins,
    href: '/tokens',
  },
  {
    label: 'Analytics',
    icon: ChartNoAxesColumn,
    href: 'https://vercel.com/velocity-labs/turtle-app/analytics',
    external: true,
  },
]
