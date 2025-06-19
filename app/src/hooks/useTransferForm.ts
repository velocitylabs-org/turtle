'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Chain,
  Ethereum,
  ManualRecipient,
  Token,
  TokenAmount,
} from '@velocitylabs-org/turtle-registry'
import { switchChain } from '@wagmi/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { useShallow } from 'zustand/react/shallow'
import { config } from '@/config'
import useBalance from '@/hooks/useBalance'
import useEnvironment from '@/hooks/useEnvironment'
import { useOutputAmount } from '@/hooks/useOutputAmount'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import builderManager from '@/services/builder'
import { useFeesStore } from '@/store/fees'
import { getRecipientAddress, isValidAddressType } from '@/utils/address'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { formatAmount, safeConvertAmount, toHuman } from '@/utils/transfer'
import useNotification from './useNotification'

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
  const environment = useEnvironment()
  const { transfer, transferStatus } = useTransfer()
  const { addNotification } = useNotification()
  const { sourceChainFee, bridgingFee } = useFeesStore(
    useShallow(state => ({
      sourceChainFee: state.sourceChainFee,
      bridgingFee: state.bridgingFee,
    })),
  )

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid: isValidZodSchema, isValidating },
  } = useForm<FormInputs>({
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
    fees: sourceChainFee,
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

      if (newValue.uid === Ethereum.uid) await switchChain(config, { chainId: mainnet.id }) // needed to fetch balance correctly

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
      setValue('manualRecipient', { enabled: false, address: '' })
      setValue('sourceTokenAmount', { token: null, amount: null })
    },
    [setValue, sourceChain, destinationChain, sourceTokenAmount],
  )

  const handleSourceTokenChange = useCallback(
    async (newValue: Token | null) => {
      setValue('sourceTokenAmount', { token: newValue, amount: null })
      setValue('destinationChain', null)
      setValue('manualRecipient', { enabled: false, address: '' })
      setValue('destinationTokenAmount', { token: null, amount: null })
    },
    [setValue],
  )

  const handleDestinationChainChange = useCallback(
    (newValue: Chain | null) => {
      setValue('destinationChain', newValue)
      trigger()
    },
    [setValue, trigger],
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

      const transferableAmount = await builderManager.getTransferableAmount({
        from: sourceChain,
        to: destinationChain,
        token: sourceToken,
        address: recipient,
        senderAddress: sourceWallet.sender.address,
        amount: sourceAmount,
      })

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
        !sourceChainFee
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
        fees: sourceChainFee,
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
      sourceChainFee,
      bridgingFee,
      reset,
      sourceWallet?.sender,
      transfer,
      environment,
      addNotification,
    ],
  )

  // validate recipient address
  useEffect(() => {
    setManualRecipientError(
      isValidRecipient(manualRecipient, destinationChain) ? '' : 'Invalid Address',
    )
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
    const hasFees = Boolean(sourceChainFee?.token?.id && sourceChainFee?.amount)
    const hasTokenAmount = Boolean(sourceTokenAmount?.token?.id && sourceTokenAmount?.amount)
    const hasBalance = Boolean(balanceData?.formatted)
    const hasBridgingFee = Boolean(bridgingFee?.token?.id && bridgingFee?.amount)
    if (!hasTokenAmount || !hasBalance) return false

    const transferToken = sourceTokenAmount!.token!.id
    const transferAmount = sourceTokenAmount!.amount!
    const balanceAmount = Number(balanceData!.formatted)
    let totalFeesAmount = 0

    // We have regular fees in the same token as the transfer
    if (hasFees && sourceChainFee!.token!.id === transferToken) {
      totalFeesAmount += toHuman(sourceChainFee!.amount, sourceChainFee!.token)
    }
    // We have bridging fees in the same token as the transfer, This applies whether we have regular fees
    if (hasBridgingFee && bridgingFee!.token!.id === transferToken) {
      totalFeesAmount += toHuman(bridgingFee!.amount, bridgingFee!.token)
    }
    // If we have no fees at all, there's no risk of exceeding transferable balance
    if (totalFeesAmount === 0) return false

    // Check if the transfer amount plus all applicable fees exceeds the available balance
    return transferAmount + totalFeesAmount > balanceAmount
  }, [sourceChainFee, bridgingFee, balanceData, sourceTokenAmount])

  const applyTransferableBalance = useCallback(() => {
    if (exceedsTransferableBalance && sourceTokenAmount?.token) {
      const transferToken = sourceTokenAmount.token.id
      const hasFees = Boolean(sourceChainFee?.token?.id && sourceChainFee?.amount)
      const hasBridgingFee = Boolean(bridgingFee?.token?.id && bridgingFee?.amount)
      let totalFeesAmount = 0

      // We have regular fees in the same token as the transfer
      if (hasFees && sourceChainFee!.token!.id === transferToken) {
        totalFeesAmount += toHuman(sourceChainFee!.amount, sourceChainFee!.token)
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
    sourceChainFee,
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

  return {
    control,
    errors,
    isValid: isFormValid,
    isValidating, // Only includes validating zod schema atm
    allowFromToSwap,
    handleSubmit: handleSubmit(onSubmit),
    handleSourceChainChange,
    handleDestinationChainChange,
    handleSourceTokenChange,
    swapFromTo,
    handleManualRecipientChange,
    handleMaxButtonClick,
    sourceChain,
    destinationChain,
    sourceTokenAmount,
    destinationTokenAmount,
    manualRecipient,
    sourceWallet,
    destinationWallet,
    transferStatus,
    environment,
    sourceTokenAmountError,
    manualRecipientError,
    isBalanceAvailable: balanceData?.value != undefined,
    loadingBalance,
    balanceData,
    fetchBalance,
    isLoadingOutputAmount,
    exceedsTransferableBalance,
    applyTransferableBalance,
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
