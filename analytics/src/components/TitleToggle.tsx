'use client'

import { cn } from '@velocitylabs-org/turtle-ui'
import { useEffect, useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface SegmentedControlProps {
  options: Option[]
  value?: string
  defaultValue?: string
  onChange: (value: string) => void
  className?: string
}

export default function TitleToggle({ options, value, defaultValue, onChange, className }: SegmentedControlProps) {
  const [internalValue, setInternalValue] = useState(value || defaultValue || options[0]?.value)
  const [indicatorPosition, setIndicatorPosition] = useState({ width: 0, left: 0 })
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  const currentValue = value !== undefined ? value : internalValue

  useEffect(() => {
    const activeIndex = options.findIndex(option => option.value === currentValue)
    const activeButton = buttonsRef.current[activeIndex]

    if (activeButton) {
      setIndicatorPosition({
        width: activeButton.offsetWidth,
        left: activeButton.offsetLeft,
      })
    }
  }, [currentValue, options])

  const handleClick = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue)
    }
    onChange(optionValue)
  }

  return (
    <div className={cn('relative inline-flex rounded-lg bg-gray-100 p-1', className)}>
      <div
        className="absolute bottom-1 top-1 rounded-md bg-white shadow-sm transition-all duration-200 ease-out"
        style={{
          width: indicatorPosition.width,
          left: indicatorPosition.left,
        }}
      />
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={el => {
            buttonsRef.current[index] = el
          }}
          onClick={() => handleClick(option.value)}
          className={cn(
            'relative z-10 rounded-md px-2 py-1 text-sm font-bold transition-all duration-200',
            currentValue === option.value ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
