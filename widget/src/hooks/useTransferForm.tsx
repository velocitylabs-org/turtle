import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
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
import useBalance from './useBalance'
import { formatAmount } from '@/utils/transfer'

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
    // formState: { errors, isValid: isValidZodSchema, isValidating},
    formState: { errors, isValidating },
  } = useForm<FormInputs>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    delayError: 3000,
    defaultValues: initValues,
  })

  const sourceChain = useWatch({ control, name: 'sourceChain' })
  const destinationChain = useWatch({ control, name: 'destinationChain' })
  const manualRecipient = useWatch({ control, name: 'manualRecipient' })
  const tokenAmount = useWatch({ control, name: 'tokenAmount' })
  const [tokenAmountError, setTokenAmountError] = useState<string>('')
  // const [manualRecipientError, setManualRecipientError] = useState<string>('')
  // const tokenId = tokenAmount?.token?.id
  const sourceWallet = useWallet(sourceChain?.walletType)
  const destinationWallet = useWallet(destinationChain?.walletType)
  const { transferStatus } = useTransfer()

  const {
    balance: balanceData,
    loading: loadingBalance,
    fetchBalance,
  } = useBalance({
    env: environment,
    chain: sourceChain,
    token: tokenAmount?.token ?? undefined,
    address: sourceWallet?.sender?.address,
  })

  const allowFromToSwap = useCallback(() => {
    return (
      !isValidating &&
      transferStatus === 'Idle' &&
      !!sourceChain &&
      !!destinationChain &&
      !!tokenAmount &&
      isRouteAllowed(environment, sourceChain, destinationChain) &&
      isRouteAllowed(environment, destinationChain, sourceChain, tokenAmount)
    )
  }, [environment, destinationChain, sourceChain, tokenAmount, isValidating, transferStatus])

  const swapFromTo = useCallback(() => {
    if (allowFromToSwap()) {
      // Swap chains values
      setValue('sourceChain', destinationChain)
      setValue('destinationChain', sourceChain)
    }
  }, [sourceChain, destinationChain, setValue, allowFromToSwap])

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

  useEffect(() => {
    if (!tokenAmount?.amount || !sourceWallet?.isConnected) setTokenAmountError('')
    else if (balanceData && balanceData.value === BigInt(0))
      setTokenAmountError("That's more than you have in your wallet")
    else if (
      tokenAmount?.amount &&
      balanceData?.value &&
      tokenAmount.amount > Number(balanceData.formatted)
    )
      setTokenAmountError("That's more than you have in your wallet")
    else setTokenAmountError('')
  }, [tokenAmount?.amount, balanceData, sourceWallet])

  const handleMaxButtonClick = useCallback(() => {
    if (
      !sourceWallet?.isConnected ||
      !tokenAmount?.token ||
      balanceData === undefined ||
      balanceData === null
    )
      return

    setValue(
      'tokenAmount',
      {
        token: tokenAmount.token,
        // Parse as number, then format to our display standard, then parse again as number
        amount: Number(formatAmount(Number(balanceData.formatted), 'Longer')),
      },
      { shouldValidate: true },
    )
  }, [sourceWallet?.isConnected, tokenAmount?.token, balanceData, setValue])

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
    handleMaxButtonClick,
    destinationChain,
    sourceWallet,
    destinationWallet,
    manualRecipient,
    tokenAmount,
    tokenAmountError,
    transferStatus,
    swapFromTo,
    allowFromToSwap,
    isBalanceAvailable: balanceData?.value != undefined,
    loadingBalance,
    balanceData,
    fetchBalance,
  }
}

export default useTransferForm
