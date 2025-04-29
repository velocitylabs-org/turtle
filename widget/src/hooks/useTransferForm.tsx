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
import { formatAmount, safeConvertAmount, toHuman } from '@/utils/transfer'
import { getRecipientAddress, isValidRecipient } from '@/utils/address'
import useFees from './useFees'
import { NotificationSeverity } from '@/models/notification'
import { useNotificationStore } from '@/stores/notificationStore'
import { Token } from '@/models/token'
import { useOutputAmount } from './useOutputAmount'

interface FormInputs {
  sourceChain: Chain | null
  destinationChain: Chain | null
  sourceTokenAmount: TokenAmount | null
  destinationTokenAmount: TokenAmount | null
  manualRecipient: ManualRecipient
}

const initValues: FormInputs = {
  sourceChain: null,
  destinationChain: null,
  sourceTokenAmount: { token: null, amount: null },
  destinationTokenAmount: { token: null, amount: null },
  manualRecipient: { enabled: false, address: '' },
}

const useTransferForm = () => {
  const environment = useEnvironmentStore(state => state.current)
  const { addNotification } = useNotificationStore()
  const {
    control,
    handleSubmit,
    setValue,
    reset,
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
  const sourceTokenAmount = useWatch({ control, name: 'sourceTokenAmount' })
  const destinationTokenAmount = useWatch({ control, name: 'destinationTokenAmount' })

  const sourceAmount = useWatch({ control, name: 'sourceTokenAmount.amount' })
  const sourceToken = useWatch({ control, name: 'sourceTokenAmount.token' })
  const destToken = useWatch({ control, name: 'destinationTokenAmount.token' })

  const [sourceTokenAmountError, setSourceTokenAmountError] = useState<string>('') // validation on top of zod
  const [manualRecipientError, setManualRecipientError] = useState<string>('') // validation on top of zod
  const tokenId = sourceTokenAmount?.token?.id
  const sourceWallet = useWallet(sourceChain?.walletType)
  const destinationWallet = useWallet(destinationChain?.walletType)
  const { transfer, transferStatus } = useTransfer()

  const {
    fees,
    loading: loadingFees,
    canPayFees,
    bridgingFees,
    canPayAdditionalFees,
    refetch: refetchFees,
  } = useFees(
    sourceChain,
    destinationChain,
    sourceTokenAmountError == '' ? sourceTokenAmount?.token : null,
    sourceTokenAmount?.amount,
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
    token: sourceTokenAmount?.token ?? undefined,
    address: sourceWallet?.sender?.address,
  })

  const { outputAmount, isLoading: isLoadingOutputAmount } = useOutputAmount({
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken: destToken,
    amount:
      sourceAmount && sourceToken
        ? safeConvertAmount(sourceAmount, sourceToken)?.toString()
        : undefined,
    fees,
  })

  // Update destination amount when output amount changes
  useEffect(() => {
    if (isLoadingOutputAmount || !outputAmount) {
      setValue('destinationTokenAmount.amount', null)
      return
    }

    if (outputAmount && destToken) {
      setValue('destinationTokenAmount.amount', toHuman(outputAmount, destToken))
    }
  }, [outputAmount, isLoadingOutputAmount, destToken, setValue])

  const isFormValid =
    isValidZodSchema &&
    !sourceTokenAmountError &&
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
      !!sourceTokenAmount &&
      !!destinationTokenAmount &&
      sourceTokenAmount.token?.id === destinationTokenAmount.token?.id &&
      isRouteAllowed(sourceChain, destinationChain) &&
      isRouteAllowed(destinationChain, sourceChain, sourceTokenAmount)
    )
  }, [
    destinationChain,
    sourceChain,
    sourceTokenAmount,
    destinationTokenAmount,
    isValidating,
    transferStatus,
  ])

  const handleSourceChainChange = useCallback(
    async (newValue: Chain | null) => {
      if (!newValue) {
        setValue('sourceChain', null)
        return
      }
      if (newValue.uid === sourceChain?.uid) return
      const isSameDestination = destinationChain?.uid === newValue.uid

      if (newValue.uid === Ethereum.uid) await switchChain(wagmiConfig, { chainId: mainnet.id }) // needed to fetch balance correctly

      if (
        destinationChain &&
        sourceTokenAmount &&
        !isSameDestination &&
        isRouteAllowed(newValue, destinationChain, sourceTokenAmount)
      ) {
        // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
        setValue('sourceChain', newValue)
        return
      }

      if (
        !isSameDestination &&
        isTokenAvailableForSourceChain(newValue, destinationChain, sourceTokenAmount?.token)
      ) {
        // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
        setValue('sourceChain', newValue)
        return
      }

      // Update the source chain here to prevent triggering unexpected states, e.g., the useFees hook.
      // Reset destination and token only if the conditions above are not met
      setValue('sourceChain', newValue)
      setValue('destinationChain', null)
      setValue('sourceTokenAmount', { token: null, amount: null })
    },
    [setValue, sourceChain, destinationChain, sourceTokenAmount],
  )

  const handleSourceTokenChange = useCallback(
    async (newValue: Token | null) => {
      setValue('sourceTokenAmount', { token: newValue, amount: null })
      setValue('destinationChain', null)
      setValue('destinationTokenAmount', { token: null, amount: null })
    },
    [setValue],
  )

  const handleDestinationChainChange = useCallback(
    (newValue: Chain | null) => {
      setValue('destinationChain', newValue)
      trigger()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue],
  )

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

  const handleMaxButtonClick = useCallback(() => {
    if (
      !sourceWallet?.isConnected ||
      !sourceTokenAmount?.token ||
      balanceData === undefined ||
      balanceData === null
    )
      return

    setValue(
      'sourceTokenAmount',
      {
        token: sourceTokenAmount.token,
        // Parse as number, then format to our display standard, then parse again as number
        amount: Number(formatAmount(Number(balanceData.formatted), 'Longer')),
      },
      { shouldValidate: true },
    )
  }, [sourceWallet?.isConnected, sourceTokenAmount?.token, balanceData, setValue])

  // validate recipient address
  useEffect(() => {
    setManualRecipientError(
      isValidRecipient(manualRecipient, destinationChain) ? '' : 'Invalid Address',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualRecipient.address, destinationChain, sourceChain, manualRecipient.enabled])

  // validate token amount
  useEffect(() => {
    if (!sourceTokenAmount?.amount || !sourceWallet?.isConnected) setSourceTokenAmountError('')
    else if (balanceData && balanceData.value === BigInt(0))
      setSourceTokenAmountError("That's more than you have in your wallet")
    else if (
      sourceTokenAmount?.amount &&
      balanceData?.value &&
      sourceTokenAmount.amount > Number(balanceData.formatted)
    )
      setSourceTokenAmountError("That's more than you have in your wallet")
    else setSourceTokenAmountError('')
  }, [sourceTokenAmount?.amount, balanceData, sourceWallet])

  // reset token amount
  useEffect(() => {
    if (tokenId)
      setValue(
        'sourceTokenAmount',
        { token: sourceTokenAmount?.token ?? null, amount: null },
        { shouldValidate: true },
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, setValue])

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    data => {
      const {
        sourceChain,
        destinationChain,
        sourceTokenAmount,
        destinationTokenAmount,
        manualRecipient,
      } = data
      const recipient = getRecipientAddress(manualRecipient, destinationWallet)
      const sourceAmount = sourceTokenAmount
        ? safeConvertAmount(sourceTokenAmount.amount, sourceTokenAmount.token)
        : null
      const destinationAmount = destinationTokenAmount
        ? safeConvertAmount(destinationTokenAmount.amount, destinationTokenAmount.token)
        : null

      if (
        !sourceChain ||
        !recipient ||
        !sourceWallet?.sender ||
        !destinationChain ||
        !sourceTokenAmount?.token ||
        !destinationTokenAmount?.token ||
        !sourceAmount ||
        !fees
      )
        return

      transfer({
        environment,
        sender: sourceWallet.sender,
        sourceChain,
        destinationChain,
        sourceToken: sourceTokenAmount?.token,
        destinationToken: destinationTokenAmount?.token,
        sourceAmount: sourceAmount,
        destinationAmount: destinationAmount ?? undefined,
        recipient: recipient,
        fees,
        bridgingFee: bridgingFees,
        onComplete: () => {
          // reset form on success
          reset()

          addNotification({
            message: `Transfer added to the queue`,
            severity: NotificationSeverity.Success,
          })

          setTimeout(() => {
            document
              .getElementById('ongoing-txs')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 500)
        },
      })
    },
    [
      destinationWallet,
      fees,
      bridgingFees,
      reset,
      sourceWallet?.sender,
      transfer,
      environment,
      addNotification,
    ],
  )

  return {
    // Form control and validation
    control,
    errors,
    isValid: isFormValid,
    isValidating,
    handleSubmit: handleSubmit(onSubmit),

    // Environment
    environment,

    // Chain selection and related handlers
    sourceChain,
    destinationChain,
    handleSourceChainChange,
    handleDestinationChainChange,
    handleSourceTokenChange,
    swapFromTo,
    allowFromToSwap,

    // Wallet states
    sourceWallet,
    destinationWallet,

    // Manual recipient handling
    manualRecipient,
    manualRecipientError,
    handleManualRecipientChange,

    // Token and amount handling
    sourceTokenAmount,
    destinationTokenAmount,
    sourceTokenAmountError,
    handleMaxButtonClick,
    isLoadingOutputAmount,

    // Balance related
    isBalanceAvailable: balanceData?.value != undefined,
    balanceData,
    loadingBalance,
    fetchBalance,

    // Fees related
    fees,
    bridgingFees,
    loadingFees,
    canPayFees,
    canPayAdditionalFees,
    refetchFees,

    // Transfer status
    transferStatus,
  }
}

export default useTransferForm
