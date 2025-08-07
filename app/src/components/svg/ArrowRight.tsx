import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import type { ComponentPropsWithoutRef } from 'react'

interface ArrowRightProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function ArrowRight({ fill = colors['turtle-foreground'], ...props }: ArrowRightProps) {
  return (
    <svg viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.5 5.92448C0.5 5.64833 0.723858 5.42448 1 5.42448H10.9398L5.20938 1.33134C4.98467 1.17084 4.93263 0.858564 5.09313 0.633859C5.25364 0.409152 5.56591 0.357106 5.79062 0.517611L12.7906 5.51761C12.922 5.61147 13 5.763 13 5.92448C13 6.08595 12.922 6.23749 12.7906 6.33134L5.79062 11.3313C5.56591 11.4918 5.25364 11.4398 5.09313 11.2151C4.93263 10.9904 4.98467 10.6781 5.20938 10.5176L10.9398 6.42448H1C0.723858 6.42448 0.5 6.20062 0.5 5.92448Z"
        fill={fill}
      />
    </svg>
  )
}
