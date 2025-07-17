import { zodResolver } from '@hookform/resolvers/zod'
import {
  Chain,
  ManualRecipient,
  TokenAmount,
  Token,
  Ethereum,
} from '@velocitylabs-org/turtle-registry'
import { switchChain } from '@wagmi/core'
import { use, useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { getTransferableAmount } from '@/lib/paraspell/transfer'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import { wagmiConfig } from '@/providers/config'
import { ConfigContext } from '@/providers/ConfigProviders'
import { useEnvironmentStore } from '@/stores/environmentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { getRecipientAddress, isValidRecipient } from '@/utils/address'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { formatAmount, safeConvertAmount, toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
import useFees from './useFees'
import { useOutputAmount } from './useOutputAmount'
import useTransfer from './useTransfer'
import useWallet from './useWallet'

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
  const { allowedTokens } = use(ConfigContext)

  const {
    fees,
    loading: loadingFees,
    canPayFees,
    bridgingFee,
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
        isTokenAvailableForSourceChain(
          newValue,
          destinationChain,
          sourceTokenAmount?.token,
          allowedTokens,
        )
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
    [setValue, sourceChain, destinationChain, sourceTokenAmount, allowedTokens],
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

  const handleMaxButtonClick = useCallback(async () => {
    if (
      !sourceWallet?.isConnected ||
      !sourceTokenAmount?.token ||
      balanceData === undefined ||
      balanceData === null ||
      !sourceChain
    )
      return

    if (sourceChain.network === 'Polkadot') {
      if (!destinationChain || !destinationWallet?.sender || !sourceWallet?.sender || !sourceToken)
        return

      const recipient =
        getRecipientAddress(manualRecipient, destinationWallet) ?? destinationWallet.sender.address

      const transferableAmount = await getTransferableAmount(
        sourceChain,
        destinationChain,
        sourceTokenAmount.token,
        recipient,
        sourceWallet.sender.address,
      )

      setValue(
        'sourceTokenAmount',
        {
          token: sourceTokenAmount.token,
          // Parse as number, then format to our display standard, then parse again as number
          amount: Number(
            formatAmount(Number(toHuman(transferableAmount, sourceToken).toString()), 'Longer'),
          ),
        },
        { shouldValidate: true },
      )
    } else {
      setValue(
        'sourceTokenAmount',
        {
          token: sourceTokenAmount.token,
          // Parse as number, then format to our display standard, then parse again as number
          amount: Number(formatAmount(Number(balanceData.formatted), 'Longer')),
        },
        { shouldValidate: true },
      )
    }
  }, [
    sourceWallet?.isConnected,
    sourceTokenAmount?.token,
    balanceData,
    setValue,
    destinationChain,
    destinationWallet,
    manualRecipient,
    sourceChain,
    sourceToken,
    sourceWallet?.sender,
  ])

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

  // Unlike canPayFees and canPayAdditionalFees, which only check if you have enough balance to cover fees separately, this checks if your total balance is sufficient to
  // cover BOTH the transfer amount AND all associated fees. This prevents transactions from failing when you attempt to send your entire balance without accounting for fees.
  const exceedsTransferableBalance = useMemo(() => {
    const hasFees = Boolean(fees?.token?.id && fees?.amount)
    const hasTokenAmount = Boolean(sourceTokenAmount?.token?.id && sourceTokenAmount?.amount)
    const hasBalance = Boolean(balanceData?.formatted)
    const hasBridgingFee = Boolean(bridgingFee?.token?.id && bridgingFee?.amount)
    if (!hasTokenAmount || !hasBalance) return false

    const transferToken = sourceTokenAmount!.token!.id
    const transferAmount = sourceTokenAmount!.amount!
    const balanceAmount = Number(balanceData!.formatted)
    let totalFeesAmount = 0

    // We have regular fees in the same token as the transfer
    if (hasFees && fees!.token!.id === transferToken) {
      totalFeesAmount += toHuman(fees!.amount, fees!.token)
    }
    // We have bridging fees in the same token as the transfer, This applies whether we have regular fees
    if (hasBridgingFee && bridgingFee!.token!.id === transferToken) {
      totalFeesAmount += toHuman(bridgingFee!.amount, bridgingFee!.token)
    }
    // If we have no fees at all, there's no risk of exceeding transferable balance
    if (totalFeesAmount === 0) return false

    // Check if the transfer amount plus all applicable fees exceeds the available balance
    return transferAmount + totalFeesAmount > balanceAmount
  }, [fees, bridgingFee, balanceData, sourceTokenAmount])

  const applyTransferableBalance = useCallback(() => {
    if (exceedsTransferableBalance && sourceTokenAmount?.token) {
      const transferToken = sourceTokenAmount.token.id
      const hasFees = Boolean(fees?.token?.id && fees?.amount)
      const hasBridgingFee = Boolean(bridgingFee?.token?.id && bridgingFee?.amount)
      let totalFeesAmount = 0

      // We have regular fees in the same token as the transfer
      if (hasFees && fees!.token!.id === transferToken) {
        totalFeesAmount += toHuman(fees!.amount, fees!.token)
      }
      // We have bridging fees in the same token as the transfer
      if (hasBridgingFee && bridgingFee!.token!.id === transferToken) {
        totalFeesAmount += toHuman(bridgingFee!.amount, bridgingFee!.token)
      }

      const balanceAmount = Number(balanceData!.formatted)
      let newAmount = balanceAmount - totalFeesAmount
      if (newAmount < 0) newAmount = 0 // Prevent negative values

      setValue(
        'sourceTokenAmount',
        {
          token: sourceTokenAmount.token,
          // Parse as number, then format to our display standard, then parse again as number
          amount: Number(formatAmount(newAmount, 'Longer')),
        },
        { shouldValidate: true },
      )
    }
  }, [
    exceedsTransferableBalance,
    sourceTokenAmount?.token,
    bridgingFee,
    fees,
    balanceData,
    setValue,
  ])

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
        bridgingFee: bridgingFee,
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
      bridgingFee,
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
    bridgingFee,
    loadingFees,
    canPayFees,
    canPayAdditionalFees,
    refetchFees,

    // Transfer status
    transferStatus,

    exceedsTransferableBalance,
    applyTransferableBalance,
  }
}

export default useTransferForm
