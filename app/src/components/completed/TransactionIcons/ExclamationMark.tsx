import { ComponentPropsWithoutRef } from 'react'
import { colors } from '../../../../tailwind.config'

export const ExclamationMark = ({
  fill = colors['turtle-primary-dark'],
  ...props
}: ComponentPropsWithoutRef<'svg'> & { fill?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 1H4C2.34315 1 1 2.34315 1 4V16C1 17.6569 2.34315 19 4 19H16C17.6569 19 19 17.6569 19 16V4C19 2.34315 17.6569 1 16 1ZM4 0C1.79086 0 0 1.79086 0 4V16C0 18.2091 1.79086 20 4 20H16C18.2091 20 20 18.2091 20 16V4C20 1.79086 18.2091 0 16 0H4ZM8.65787 6.0644C8.53132 5.24183 9.16775 4.5 10 4.5C10.8322 4.5 11.4687 5.24183 11.3421 6.0644L10.4942 11.576C10.4567 11.8199 10.2468 12 10 12C9.75321 12 9.54334 11.8199 9.50581 11.576L8.65787 6.0644ZM10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z"
      fill={fill}
    />
  </svg>
)
