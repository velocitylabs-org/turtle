import Transfer from './components/Transfer'

export interface WidgetProps {
  title?: string
}

export const Widget: React.FC<WidgetProps> = ({ title = 'Transfers Widget' }) => {
  return (
    <div className="bg-card m-4 mx-auto max-w-sm rounded-lg p-6 text-center shadow-md">
      <h2 className="text-card-foreground mb-4 text-2xl font-bold">{title}</h2>
      <div className="space-x-2">
        <Transfer />
      </div>
    </div>
  )
}
