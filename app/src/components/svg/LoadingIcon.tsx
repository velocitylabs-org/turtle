import type { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

interface LoadingIconProps extends SvgProps {
  height?: number
  width?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export default function LoadingIcon({
  width = 14,
  height = 10,
  color = '#001B04',
  strokeWidth = 1,
  className,
  ...props
}: LoadingIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.81081 1.61894C5.76664 1.03293 6.96543 0.829547 8.13794 1.15427C9.85203 1.62899 11.0011 3.09141 11.1173 4.72448V6.60038M9.20764 8.38106C8.2518 8.96707 7.05302 9.17045 5.88051 8.84573C4.0834 8.34802 2.90735 6.76461 2.8916 5.03713V3.78653"
        stroke={color}
        stroke-linecap="round"
      />
      <path d="M1 5.53863L2.87053 3.6742L4.89315 5.53847" stroke={color} stroke-linecap="round" />
      <path d="M13 5.00001L11.1295 6.86444L9.10685 5.00017" stroke={color} stroke-linecap="round" />
    </svg>
  )
}
