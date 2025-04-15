import Cross from '@/components/svg/Cross'
import { colors } from '../../../tailwind.config'
import Button from '@/components/Button'

const ClearButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      label="Clear"
      size="sm"
      variant="outline"
      className="z-10 h-[28px] w-[28px] min-w-5 border-turtle-secondary text-sm hover:border-turtle-secondary"
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-turtle-foreground">
        <Cross stroke={colors['turtle-secondary']} />
      </div>
    </Button>
  )
}

export default ClearButton
