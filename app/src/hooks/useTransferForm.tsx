import { REGISTRY } from '@/config/registry'
import useEnvironment from '@/hooks/useEnvironment'
import useErc20Balance from '@/hooks/useErc20Balance'
import useNotification from '@/hooks/useNotification'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { isValidAddressType } from '@/utils/address'
import { getAllowedDestinationChains, getAllowedSourceChains } from '@/utils/filters'
import { safeConvertAmount } from '@/utils/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import useFees from './useFees'
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
  const { snowbridgeContext } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const environment = useEnvironment()
  const { transfer, transferStatus } = useTransfer()

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    resetField,
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
  const { fees, loading: loadingFees } = useFees(
    sourceChain,
    destinationChain,
    tokenAmount?.token ?? null,
  )
  const [tokenAmountError, setTokenAmountError] = useState<string>('') // validation on top of zod
  const [manualRecipientError, setManualRecipientError] = useState<string>('') // validation on top of zod
  const tokenId = tokenAmount?.token?.id
  const sourceWallet = useWallet(sourceChain?.supportedAddressTypes.at(0)) // TODO: handle multiple address types
  const destinationWallet = useWallet(destinationChain?.supportedAddressTypes.at(0))

  const balanceParams = useMemo(
    () => ({
      network: sourceChain?.network,
      token: tokenAmount?.token,
      address: sourceWallet?.sender?.address,
      context: snowbridgeContext,
    }),
    [sourceChain?.network, tokenAmount?.token, sourceWallet?.sender?.address, snowbridgeContext],
  )

  const { data: balanceData, loading: loadingBalance } = useErc20Balance({
    network: balanceParams.network,
    token: balanceParams.token ?? undefined,
    address: balanceParams.address,
    context: balanceParams.context,
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

  const allowSwap = useCallback(() => {
    if (!sourceChain || !destinationChain || !tokenAmount) return false
    return (
      getAllowedSourceChains(environment).some(
        sc => sc.allowed && sc.chainId === destinationChain.chainId,
      ) &&
      getAllowedDestinationChains(environment, destinationChain, tokenAmount.token).some(
        dc => dc.allowed && dc.uid === sourceChain.uid,
      )
    )
  }, [destinationChain, environment, sourceChain, tokenAmount])

  const handleSourceChainChange = useCallback(
    (newValue: Chain | null) => {
      if (newValue && newValue.uid === destinationChain?.uid) {
        if (REGISTRY[environment].chains.length === 2)
          setValue('destinationChain', sourceChain) // swap
        else setValue('destinationChain', null) // reset

        addNotification({
          severity: NotificationSeverity.Default,
          message: 'Updated destination chain',
          dismissible: true,
        })
      }
      setValue('sourceChain', newValue)
    },
    [destinationChain, environment, setValue, sourceChain, addNotification],
  )

  const handleDestinationChainChange = useCallback(
    (newValue: Chain | null) => {
      if (newValue && newValue.uid === sourceChain?.uid) {
        if (REGISTRY[environment].chains.length === 2)
          setValue('sourceChain', destinationChain) // swap
        else setValue('sourceChain', null) // reset

        addNotification({
          severity: NotificationSeverity.Default,
          message: 'Updated source chain',
          dismissible: true,
        })
      }
      setValue('destinationChain', newValue)
    },
    [sourceChain, environment, setValue, destinationChain, addNotification],
  )

  const handleSwapChains = useCallback(() => {
    if (!sourceChain && !destinationChain && !allowSwap()) return
    // Swap chains values
    setValue('sourceChain', destinationChain)
    setValue('destinationChain', sourceChain)
  }, [sourceChain, destinationChain, setValue, tokenAmount, resetField, allowSwap])

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
      const recipient = manualRecipient.enabled
        ? manualRecipient.address
        : destinationWallet?.sender?.address
      const amount = tokenAmount ? safeConvertAmount(tokenAmount.amount, tokenAmount.token) : null

      if (
        !sourceChain ||
        !recipient ||
        !sourceWallet?.sender ||
        !destinationChain ||
        !tokenAmount?.token ||
        !amount ||
        !fees ||
        !snowbridgeContext
      )
        return

      transfer({
        environment,
        context: snowbridgeContext,
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
    [
      destinationWallet?.sender?.address,
      fees,
      reset,
      sourceWallet?.sender,
      transfer,
      environment,
      snowbridgeContext,
    ],
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
    allowSwap,
    handleSubmit: handleSubmit(onSubmit),
    handleSourceChainChange,
    handleDestinationChainChange,
    handleSwapChains,
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
  }
}

export default useTransferForm
