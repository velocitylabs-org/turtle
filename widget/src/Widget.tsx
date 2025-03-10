import Transfer from './components/Transfer'

export interface WidgetProps {
  title?: string
}

export const Widget: React.FC<WidgetProps> = ({ title = 'Transfers Widget' }) => {
  return (
    <div className="m-4 flex flex-col items-center justify-center p-6">
      <h2 className="text-card-foreground mb-4 text-2xl font-bold">{title}</h2>
      <div>
        <Transfer />
      </div>
    </div>
  )
}
