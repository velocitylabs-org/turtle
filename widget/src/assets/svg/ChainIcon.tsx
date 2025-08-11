import type { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

type ChainIconProps = {
  height?: number
  width?: number
  strokeWidth?: number
  color?: string
  className?: string
} & SvgProps

const ChainIcon: React.FC<ChainIconProps> = ({
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
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4.80154 9.32427C4.80154 7.69503 6.1223 6.37427 7.75154 6.37427C9.38078 6.37427 10.7015 7.69503 10.7015 9.32427V14.6756C10.7015 16.3049 9.38078 17.6256 7.75154 17.6256C6.1223 17.6256 4.80154 16.3049 4.80154 14.6756V9.32427Z"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M16.349 15.5332C17.9227 15.9548 18.8566 17.5724 18.4349 19.1462C18.0133 20.7199 16.3957 21.6538 14.8219 21.2321L9.65291 19.8471C8.07918 19.4254 7.14526 17.8078 7.56694 16.2341C7.98862 14.6604 9.60621 13.7264 11.1799 14.1481L16.349 15.5332Z"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M14.5634 2.76775C16.1371 2.34608 17.7547 3.27999 18.1764 4.85372C18.5981 6.42744 17.6642 8.04504 16.0904 8.46672L10.9214 9.85176C9.34767 10.2734 7.73007 9.33952 7.3084 7.76579C6.88672 6.19207 7.82064 4.57447 9.39436 4.15279L14.5634 2.76775Z"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </svg>
)

export default ChainIcon
