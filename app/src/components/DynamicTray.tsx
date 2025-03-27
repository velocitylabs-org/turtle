import { ReactNode, useEffect, useRef, useState, memo, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface DynamicTrayProps {
  baseEl: ReactNode
  swapEl: ReactNode
  containerClassnames: string
  swapCondition: boolean
  duration?: number
  maxHeight?: number
}

/**
 * A component that smoothly transitions between two views with fade and translate animations.
 * It handles dynamic height adjustments and maintains smooth animations during view changes.
 */
function DynamicTray({
  baseEl,
  swapEl,
  containerClassnames,
  swapCondition,
  maxHeight,
  duration = 0.1,
}: DynamicTrayProps) {
  const [hasRendered, setHasRendered] = useState(false)
  const [baseElHeight, setBaseElHeight] = useState(0)
  const [swapElHeight, setSwapElHeight] = useState(0)
  const containerExtraPadding = useRef<number>(0)

  useEffect(() => setHasRendered(true), [])

  const handleBaseRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setBaseElHeight(el.offsetHeight)
  }, [])

  const handleSwapRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setSwapElHeight(el.offsetHeight)
  }, [])

  // Calculate container padding to ensure accurate height calculations including user-defined padding
  const handleContainerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const paddingTop = parseFloat(getComputedStyle(el).paddingTop)
      const paddingBottom = parseFloat(getComputedStyle(el).paddingBottom)
      containerExtraPadding.current = paddingTop + paddingBottom
    }
  }, [])

  // Prevent initial animation flicker by rendering a static div first, then switching to animated motion.div
  const RenderEl = useMemo(() => (hasRendered ? motion.div : 'div'), [hasRendered])

  // Calculate container height
  const containerStyles = useMemo(() => {
    let height = 0
    if (swapCondition) {
      // Use swapElHeight when available, fallback to baseElHeight to prevent flickering
      // during initial render when swapElHeight might be temporarily 0
      height = (swapElHeight ? swapElHeight : baseElHeight) + containerExtraPadding.current
    } else {
      // Use baseElHeight when available, fallback to swapElHeight to prevent flickering
      // during initial render when baseElHeight might be temporarily 0
      height = (baseElHeight ? baseElHeight : swapElHeight) + containerExtraPadding.current
    }

    if (maxHeight && height > maxHeight) {
      height = maxHeight
    }

    return { height }
  }, [swapCondition, swapElHeight, baseElHeight, maxHeight])

  // Define animation variants for the container and its children
  const containerVariants = useMemo(
    () => ({
      layout: true,
      transition: {
        layout: { duration, ease: 'easeInOut' },
      },
    }),
    [duration],
  )

  const baseVariants = useMemo(
    () => ({
      initial: false,
      animate: { opacity: 1, transition: { duration, ease: 'easeOut' } },
      exit: { opacity: 0, transition: { duration, ease: 'easeIn' } },
      layout: true,
    }),
    [duration],
  )

  const swapVariants = useMemo(
    () => ({
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { duration, ease: 'easeOut' } },
      exit: { y: 20, opacity: 0, transition: { duration, ease: 'easeIn' } },
      layout: true,
    }),
    [duration],
  )

  return (
    <RenderEl
      {...containerVariants}
      style={containerStyles}
      className={containerClassnames}
      ref={handleContainerRef}
    >
      <AnimatePresence mode="wait">
        {!swapCondition && (
          <motion.div ref={handleBaseRef} key="baseView" {...baseVariants}>
            {baseEl}
          </motion.div>
        )}
        {swapCondition && (
          <motion.div ref={handleSwapRef} key="swapView" {...swapVariants}>
            {swapEl}
          </motion.div>
        )}
      </AnimatePresence>
    </RenderEl>
  )
}

// Memoize the component to optimize performance by preventing unnecessary re-renders
export default memo(DynamicTray)
