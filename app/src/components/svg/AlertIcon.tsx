import type { ComponentPropsWithoutRef } from 'react'

interface AlertIconProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function AlertIcon({ fill = 'currentColor', ...props }: AlertIconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.10496 6.70959C7.02059 6.16121 7.44488 5.66666 7.99971 5.66666C8.55454 5.66666 8.97883 6.16121 8.89446 6.70959L8.32917 10.384C8.30415 10.5466 8.16424 10.6667 7.99971 10.6667C7.83519 10.6667 7.69527 10.5466 7.67025 10.384L7.10496 6.70959Z"
        fill={fill}
      />
      <ellipse cx="7.99967" cy="12" rx="0.666667" ry="0.666667" fill={fill} />
      <path
        d="M6.66943 2.60776C7.26148 1.57532 8.73854 1.57529 9.33057 2.60776L14.6235 11.8382C15.2195 12.8775 14.4706 14.1664 13.2925 14.1664H2.70654C1.52855 14.1661 0.780557 12.8775 1.37646 11.8382L6.66943 2.60776Z"
        stroke={fill}
      />
    </svg>
  )
}
