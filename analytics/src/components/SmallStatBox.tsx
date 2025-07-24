'use client'
import { cn } from '@velocitylabs-org/turtle-ui'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SmallStateBoxProps {
  title: string
  value: string | number
  icon: LucideIcon
  isLoading?: boolean
  skeletonWidth?: string
  description?: string
  iconColor?: string
}

export default function SmallStatBox({
  title,
  value,
  icon: Icon,
  isLoading = false,
  skeletonWidth = 'w-24',
  description,
  iconColor,
}: SmallStateBoxProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" style={{ color: iconColor }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? <Skeleton className={`h-8 ${skeletonWidth}`} /> : value}</div>
        {description && (
          <div className={cn('flex items-center space-x-2 text-xs text-muted-foreground', isLoading && 'opacity-0')}>
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
