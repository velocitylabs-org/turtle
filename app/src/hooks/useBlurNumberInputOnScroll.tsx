import { useEffect } from 'react'

const useBlurNumberInputOnScroll = () => {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLInputElement
      if (target.type === 'number') {
        target.blur()
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])
}

export default useBlurNumberInputOnScroll
