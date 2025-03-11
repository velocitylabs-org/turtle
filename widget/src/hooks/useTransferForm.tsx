import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useCallback } from 'react'
import { mainnet } from 'viem/chains'
import { switchChain } from '@wagmi/core'
import { schema } from '@/models/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEnvironmentStore } from '@/stores/environmentStore'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { Chain } from '@/models/chain'
import useTransfer from './useTransfer'
import useWallet from './useWallet'
import { wagmiConfig } from '@/providers/config'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { Ethereum } from '@/registry/mainnet/chains'

interface FormInputs {
  sourceChain: Chain | null
  destinationChain: Chain | null
  tokenAmount: TokenAmount | null
  manualRecipient: ManualRecipient
}

const initValues: FormInputs = {
  sourceChain: null,
  destinationChain: null,
  tokenAmount: { token: null, amount: null },
  manualRecipient: { enabled: false, address: '' },
}

const useTransferForm = () => {
  const environment = useEnvironmentStore(state => state.current)
  const {
    control,
    handleSubmit,
    setValue,
    // reset,
    // trigger,
    formState: { errors }, // isValid: isValidZodSchema, isValidating
  } = useForm<FormInputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any), // ?????
    mode: 'onChange',
    delayError: 3000,
    defaultValues: initValues,
  })

  const sourceChain = useWatch({ control, name: 'sourceChain' })
  const destinationChain = useWatch({ control, name: 'destinationChain' })
  const manualRecipient = useWatch({ control, name: 'manualRecipient' })
  const tokenAmount = useWatch({ control, name: 'tokenAmount' })
  const sourceWallet = useWallet(sourceChain?.walletType)
  const { transferStatus } = useTransfer()

  const handleSourceChainChange = useCallback(
    async (newValue: Chain | null) => {
      if (!newValue || newValue.uid === sourceChain?.uid) return
      const isSameDestination = destinationChain?.uid === newValue.uid

      if (newValue.uid === Ethereum.uid) await switchChain(wagmiConfig, { chainId: mainnet.id }) // needed to fetch balance correctly

      if (
        destinationChain &&
        tokenAmount &&
        !isSameDestination &&
        isRouteAllowed(environment, newValue, destinationChain, tokenAmount)
      ) {
        // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
        setValue('sourceChain', newValue)
        return
      }

      if (
        !isSameDestination &&
        isTokenAvailableForSourceChain(environment, newValue, destinationChain, tokenAmount?.token)
      ) {
        // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
        setValue('sourceChain', newValue)
        return
      }

      // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
      // Reset destination and token only if the conditions above are not met
      setValue('sourceChain', newValue)
      setValue('destinationChain', null)
      setValue('tokenAmount', { token: null, amount: null })
    },
    [setValue, sourceChain, destinationChain, tokenAmount, environment],
  )

  const onSubmit: SubmitHandler<FormInputs> = useCallback(data => {
    console.log(data)
  }, [])

  return {
    control,
    errors,
    environment,
    handleSubmit: handleSubmit(onSubmit),
    sourceChain,
    handleSourceChainChange,
    destinationChain,
    sourceWallet,
    manualRecipient,
    tokenAmount,
    transferStatus,
  }
}

export default useTransferForm
