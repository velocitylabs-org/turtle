import { useEnvironmentStore } from '@/store/environmentStore'

const useEnvironment = () => {
  const current = useEnvironmentStore(state => state.current)
  return current
}

export default useEnvironment
