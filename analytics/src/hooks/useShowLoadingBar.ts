import { useEffect } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'

export default function useShowLoadingBar(loading: boolean) {
  const { start, complete } = useLoadingBar()

  useEffect(() => {
    if (loading) {
      start()
      return
    }
    complete()
  }, [loading])
}
