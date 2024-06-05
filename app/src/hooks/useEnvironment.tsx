import { useEnvironmentStore } from '@/store/environmentStore'

const useEnvironment = () => {
  const environment = useEnvironmentStore.getState().current
  const switchTo = useEnvironmentStore.getState().switchTo

  return { environment, switchTo }
}

export default useEnvironment
