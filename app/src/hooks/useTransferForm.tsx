import useBalance from '@/hooks/useBalance'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { schema } from '@/models/schemas'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { getRecipientAddress, isValidAddressType } from '@/utils/address'
import { isRouteAllowed, isTokenAvailableForSourceChain } from '@/utils/routes'
import { safeConvertAmount } from '@/utils/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import useFees from './useFees'
import usePapi from './usePapi'
import useSnowbridgeContext from './useSnowbridgeContext'

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
  //todo: can we remove and/or decouple basic logic such as balance lookup from the snowbridge context?
  const { snowbridgeContext } = useSnowbridgeContext()
  const environment = useEnvironment()
  const { transfer, transferStatus } = useTransfer()

  const {
    control,
    handleSubmit,
    setValue,
    reset,
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
  const sourceWallet = useWallet(sourceChain?.supportedAddressTypes.at(0)) // TODO: handle multiple address types
  const destinationWallet = useWallet(destinationChain?.supportedAddressTypes.at(0))
  const { api } = usePapi(sourceChain)
  const { fees, loading: loadingFees } = useFees(
    sourceWallet?.sender?.address,
    sourceChain,
    destinationChain,
    tokenAmount?.token,
    safeConvertAmount(tokenAmount?.amount, tokenAmount?.token),
    getRecipientAddress(manualRecipient, destinationWallet),
  )

  const balanceParams = useMemo(
    () => ({
      api,
      chain: sourceChain,
      token: tokenAmount?.token,
      address: sourceWallet?.sender?.address,
      context: snowbridgeContext,
    }),
    [api, sourceChain, tokenAmount?.token, sourceWallet?.sender?.address, snowbridgeContext],
  )

  const {
    balance: balanceData,
    loading: loadingBalance,
    fetchBalance,
  } = useBalance({
    env: environment,
    api: balanceParams.api,
    chain: balanceParams.chain,
    token: balanceParams.token ?? undefined,
    address: balanceParams.address,
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
    (newValue: Chain | null) => {
      setValue('sourceChain', newValue)

      if (!newValue || newValue.uid === sourceChain?.uid) return

      const isSameDestination = destinationChain?.uid === newValue.uid

      if (
        destinationChain &&
        tokenAmount &&
        !isSameDestination &&
        isRouteAllowed(environment, destinationChain, newValue, tokenAmount)
      )
        return

      if (
        !isSameDestination &&
        isTokenAvailableForSourceChain(environment, newValue, tokenAmount?.token)
      )
        return

      // Reset destination and token only if the conditions above are not met
      setValue('destinationChain', null)
      setValue('tokenAmount', { token: null, amount: null })
    },
    [setValue, sourceChain, destinationChain, tokenAmount, environment],
  )

  const handleDestinationChainChange = useCallback(
    (newValue: Chain | null) => {
      setValue('destinationChain', newValue)
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
        amount: Number(balanceData.formatted),
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
        onSuccess: () => {
          reset() // reset form on success
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) // scroll to bottom
        },
      })
    },
    [destinationWallet, fees, reset, sourceWallet?.sender, transfer, environment],
  )

  // validate recipient address
  useEffect(() => {
    const isValidAddress =
      !manualRecipient.enabled ||
      !destinationChain ||
      isValidAddressType(manualRecipient.address, destinationChain.supportedAddressTypes) ||
      manualRecipient.address === ''

    if (isValidAddress) setManualRecipientError('')
    else setManualRecipientError('Invalid Address')
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
    loadingFees,
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

export default useTransferForm
