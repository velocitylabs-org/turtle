import { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

type ChevronDownProps = {
  height?: number
  width?: number
  strokeWidth?: number
  color?: string
  className?: string
} & SvgProps

const ChevronDown: React.FC<ChevronDownProps> = ({
  width = 14,
  height = 6,
  color = 'currentColor',
  strokeWidth = 1,
  className,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 14 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      stroke={color}
      strokeWidth={strokeWidth}
      d="M0.584028 0.722703C0.737204 0.492939 1.04764 0.430852 1.2774 0.584028L7.00005 4.39913L12.7227 0.584028C12.9525 0.430852 13.2629 0.492939 13.4161 0.722703C13.5693 0.952467 13.5072 1.2629 13.2774 1.41608L7.2774 5.41608C7.10945 5.52804 6.89065 5.52804 6.7227 5.41608L0.722703 1.41608C0.492939 1.2629 0.430852 0.952467 0.584028 0.722703Z"
      fill="#001B04"
    />
  </svg>
)

export default ChevronDown
