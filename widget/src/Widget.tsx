import { FC, useState } from 'react'
import { Button } from './components/ui/button'

export interface WidgetProps {
  title?: string
}

const Widget: FC<WidgetProps> = ({ title = 'Transfers Widget' }) => {
  const [count, setCount] = useState<number>(0)
  return (
    <div className="bg-card m-4 mx-auto max-w-sm rounded-lg p-6 text-center shadow-md">
      <h2 className="text-card-foreground mb-4 text-2xl font-bold">{title}</h2>
      <div className="space-x-2">
        <Button
          variant="outline"
          className="bg-turtle-secondary"
          onClick={() => setCount(count + 1)}
        >
          Send {count}
        </Button>
      </div>
    </div>
  )
}

export default Widget
