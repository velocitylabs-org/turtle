import { useLoadingBar } from 'react-top-loading-bar'
import { loadingBarOpt } from '@/constants'
import { useEffect } from 'react'

export default function useShowLoadingBar(loading: boolean) {
  const { start, complete } = useLoadingBar(loadingBarOpt)

  useEffect(() => {
    if (loading) {
      start()
      return
    }
    complete()
  }, [loading])
}
