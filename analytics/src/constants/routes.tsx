import { Coins, LayoutDashboard, Repeat, Waypoints } from 'lucide-react'
import type React from 'react'

export interface RouteItem {
  label: string
  icon: React.FC<{ className?: string }>
  href: string
}

export const routes: RouteItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Transactions',
    icon: Repeat,
    href: '/transactions',
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
  }
]