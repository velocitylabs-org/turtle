'use client'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error
}

export default function ErrorPanel({ error }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mt-5 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-xl">Something went wrong</h1>
        <p className="text-muted-foreground">
          We can not load the data you requested. This might be due to a network issue or a problem
          with our servers.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()} variant="outline" className="px-8">
            Reload page
          </Button>
        </div>
      </div>
    </div>
  )
}
