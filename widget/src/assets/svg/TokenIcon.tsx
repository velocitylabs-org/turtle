import { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

type TokenIconProps = {
  height?: number
  width?: number
  strokeWidth?: number
  color?: string
  className?: string
} & SvgProps

const TokenIcon: React.FC<TokenIconProps> = ({
  width = 24,
  height = 24,
  color = '#A184DC',
  strokeWidth = 1,
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="9.5" stroke={color} />
    <path
      d="M8.86754 11.3142V16.7999M10.9558 11.3142V16.7999M13.0442 11.3142V16.7999M15.1325 11.3142V16.7999"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path d="M7 11H17" stroke={color} strokeWidth={strokeWidth} />
    <path d="M6 10L12 7L18 10" stroke={color} strokeWidth={strokeWidth} />
  </svg>
)

export default TokenIcon
