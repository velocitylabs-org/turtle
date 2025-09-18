import { type RefObject, useEffect } from 'react'

export const useOutsideClick = (
  triggerRef: RefObject<HTMLDivElement | null>,
  dropdownRef: RefObject<HTMLDivElement | null>,
  callback: () => void,
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [triggerRef, dropdownRef, callback])
}
