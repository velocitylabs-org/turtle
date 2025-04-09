'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { switchChain } from '@wagmi/core'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { config } from '@/config'
import useBalance from '@/hooks/useBalance'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { Ethereum } from '@/registry/mainnet/chains'
import { getRecipientAddress, isValidAddressType } from '@/utils/address'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { safeConvertAmount, formatAmount } from '@/utils/transfer'
import useFees from './useFees'
import useNotification from './useNotification'

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
  const tokenAmount = useWatch({ control, name: 'tokenAmount' })

  const [tokenAmountError, setTokenAmountError] = useState<string>('') // validation on top of zod
  const [manualRecipientError, setManualRecipientError] = useState<string>('') // validation on top of zod
  const tokenId = tokenAmount?.token?.id
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
    tokenAmountError == '' ? tokenAmount?.token : null,
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

  const handleSourceChainChange = useCallback(
    async (newValue: Chain | null) => {
      if (!newValue || newValue.uid === sourceChain?.uid) return
      const isSameDestination = destinationChain?.uid === newValue.uid

      if (newValue.uid === Ethereum.uid) await switchChain(config, { chainId: mainnet.id }) // needed to fetch balance correctly

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

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    data => {
      const { sourceChain, destinationChain, tokenAmount, manualRecipient } = data
      const recipient = getRecipientAddress(manualRecipient, destinationWallet)
      const amount = tokenAmount ? safeConvertAmount(tokenAmount.amount, tokenAmount.token) : null

      if (
        !sourceChain ||
        !recipient ||
        !sourceWallet?.sender ||
        !destinationChain ||
        !tokenAmount?.token ||
        !amount ||
        !fees
      )
        return

      transfer({
        environment,
        sender: sourceWallet.sender,
        sourceChain,
        destinationChain,
        token: tokenAmount.token,
        amount,
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

  // reset token amount
  useEffect(() => {
    if (tokenId)
      setValue(
        'tokenAmount',
        { token: tokenAmount?.token ?? null, amount: null },
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
    swapFromTo,
    handleManualRecipientChange,
    handleMaxButtonClick,
    sourceChain,
    destinationChain,
    tokenAmount,
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
    tokenAmountError,
    manualRecipientError,
    isBalanceAvailable: balanceData?.value != undefined,
    loadingBalance,
    balanceData,
    fetchBalance,
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
