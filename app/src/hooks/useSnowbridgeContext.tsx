import { getContext, getEnvironment } from '@/context/snowbridge'
import useEnvironment from '@/hooks/useEnvironment'
import { Context } from '@snowbridge/api'
import { useEffect, useState } from 'react'

const useSnowbridgeContext = (): Context | undefined => {
  const [snowbridgeContext, setSnowbridgeContext] = useState<Context>()
  const { environment } = useEnvironment()

  useEffect(() => {
    const fetchContext = async () => {
      const snowbridgeEnv = getEnvironment(environment)
      const context = await getContext(snowbridgeEnv)
      setSnowbridgeContext(context)
    }

    fetchContext()
  }, [environment])

  return snowbridgeContext
}

export default useSnowbridgeContext
