import { useEnvironmentStore } from '@/store/environmentStore'

const useEnvironment = () => {
  const environment = useEnvironmentStore(state => state.current)
  const switchTo = useEnvironmentStore(state => state.switchTo)

  return { environment, switchTo }
}

export default useEnvironment
