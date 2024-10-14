import { useEnvironmentStore } from '@/store/environmentStore'

const useEnvironment = () => {
  return useEnvironmentStore(state => state.current)
}

export default useEnvironment
