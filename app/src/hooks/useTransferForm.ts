'use client'
import { config } from '@/config'
import useBalance from '@/hooks/useBalance'
import useEnvironment from '@/hooks/useEnvironment'
import { useSwapOutputAmount } from '@/hooks/useSwapOutputAmount'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import { ManualAddressValue, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { Ethereum } from '@/registry/mainnet/chains'
import { getRecipientAddress, isValidAddressType } from '@/utils/address'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import { switchChain } from '@wagmi/core'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { formatAmount } from '../utils/transfer'
import useFees from './useFees'
import useNotification from './useNotification'

interface FormInputs {
  sourceChain: Chain | null
  destinationChain: Chain | null
  sourceTokenAmount: TokenAmount | null
  destinationTokenAmount: TokenAmount | null
  manualRecipient: ManualAddressValue
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

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid: isValidZodSchema, isValidating },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
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

  const { outputAmount, isLoading: isLoadingOutputAmount } = useSwapOutputAmount({
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken: destToken,
    amount:
      sourceAmount && sourceToken
        ? safeConvertAmount(sourceAmount, sourceToken)?.toString()
        : undefined,
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
    (newValue: ManualAddressValue) => setValue('manualRecipient', newValue),
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
    fees,
    bridgingFee,
    refetchFees,
    loadingFees,
    canPayFees,
    canPayAdditionalFees,
    transferStatus,
    environment,
    sourceTokenAmountError,
    manualRecipientError,
    isBalanceAvailable: balanceData?.value != undefined,
    loadingBalance,
    balanceData,
    fetchBalance,
    isLoadingOutputAmount,
  }
}

function isValidRecipient(manualRecipient: ManualAddressValue, destinationChain: Chain | null) {
  return (
    !manualRecipient.enabled ||
    !destinationChain ||
    isValidAddressType(manualRecipient.address, destinationChain.supportedAddressTypes) ||
    manualRecipient.address === ''
  )
}

export default useTransferForm
