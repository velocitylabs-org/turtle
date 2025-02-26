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
import { getRecipientAddress, isValidAddressType } from '@/utils/address'
import useFees from './useFees'

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
    trigger,
    formState: { errors, isValid: isValidZodSchema, isValidating },
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
  const [manualRecipientError, setManualRecipientError] = useState<string>('')
  // const tokenId = tokenAmount?.token?.id
  const sourceWallet = useWallet(sourceChain?.walletType)
  const destinationWallet = useWallet(destinationChain?.walletType)
  const { transferStatus } = useTransfer()

  const {
    fees,
    loading: loadingFees,
    canPayFees,
    ethereumTxfees,
    refetch: refetchFees,
  } = useFees(
    sourceChain,
    destinationChain,
    tokenAmount?.token,
    tokenAmount?.amount,
    sourceWallet?.sender?.address,
    getRecipientAddress(manualRecipient, destinationWallet),
  )

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

  const isFormValid =
    isValidZodSchema &&
    !tokenAmountError &&
    !manualRecipientError &&
    sourceWallet?.isConnected &&
    !loadingBalance &&
    !!balanceData &&
    (!manualRecipient.enabled || manualRecipient.address.length > 0) &&
    (manualRecipient.enabled || destinationWallet?.isConnected)

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

  const handleManualRecipientChange = useCallback(
    (newValue: ManualRecipient) => setValue('manualRecipient', newValue),
    [setValue],
  )

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

  const handleDestinationChainChange = useCallback(
    (newValue: Chain | null) => {
      setValue('destinationChain', newValue)
      trigger()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue],
  )

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

  // validate recipient address
  useEffect(() => {
    setManualRecipientError(
      isValidRecipient(manualRecipient, destinationChain) ? '' : 'Invalid Address',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualRecipient.address, destinationChain, sourceChain, manualRecipient.enabled])

  const onSubmit: SubmitHandler<FormInputs> = useCallback(data => {
    console.log(data)
  }, [])

  return {
    control,
    errors,
    environment,
    isValid: isFormValid,
    isValidating, // Only includes validating zod schema atm
    handleSubmit: handleSubmit(onSubmit),
    sourceChain,
    handleSourceChainChange,
    handleMaxButtonClick,
    destinationChain,
    handleDestinationChainChange,
    sourceWallet,
    destinationWallet,
    manualRecipient,
    manualRecipientError,
    handleManualRecipientChange,
    tokenAmount,
    tokenAmountError,
    transferStatus,
    swapFromTo,
    allowFromToSwap,
    isBalanceAvailable: balanceData?.value != undefined,
    loadingBalance,
    balanceData,
    fetchBalance,
    fees,
    loadingFees,
    canPayFees,
    ethereumTxfees,
    refetchFees,
  }
}

function isValidRecipient(manualRecipient: ManualRecipient, destinationChain: Chain | null) {
  return (
    !manualRecipient.enabled ||
    !destinationChain ||
    isValidAddressType(manualRecipient.address, destinationChain.supportedAddressTypes) ||
    manualRecipient.address === ''
  )
}

export default useTransferForm
