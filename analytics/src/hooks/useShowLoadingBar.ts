import { useEffect } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { loadingBarOpt } from '@/constants'

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
