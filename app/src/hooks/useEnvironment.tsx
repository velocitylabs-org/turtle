import { Environment } from '@/store/environmentStore'

const useEnvironment = () => {
  const environment = Environment.Mainnet
  return { environment }
}

export default useEnvironment
