import { nativeToken, REGISTRY } from '@/config/registry'
import { getContext, getEnvironment } from '@/context/snowbridge'
import useEnvironment from '@/hooks/useEnvironment'
import useErc20Balance from '@/hooks/useErc20Balance'
import useNotification from '@/hooks/useNotification'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { schema } from '@/models/schemas'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { Fees } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { isValidAddressOfNetwork } from '@/utils/address'
import { convertAmount, toHuman } from '@/utils/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import * as Snowbridge from '@snowbridge/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

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
  const [fees, setFees] = useState<Fees | null>(null)
  const [snowbridgeContext, setSnowbridgeContext] = useState<Snowbridge.Context>()
  const { addNotification } = useNotification()
  const { environment } = useEnvironment()
  const { transfer, transferStatus } = useTransfer()

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid, isValidating },
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

  const sourceWallet = useWallet(sourceChain?.network)
  const destinationWallet = useWallet(destinationChain?.network)

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
      const amount = tokenAmount ? convertAmount(tokenAmount.amount, tokenAmount.token) : null

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
    [destinationWallet?.sender?.address, fees, reset, sourceWallet?.sender, transfer, environment],
  )

  /* const debouncedTrigger = useCallback(
    (field: any) => debounce(() => trigger(field), 3000),
    [trigger],
  ) */

  // Fetch fees
  useEffect(() => {
    const fetchFees = async () => {
      if (!isValid) {
        setFees(null)
        return
      }
      if (
        !sourceChain ||
        !destinationChain ||
        !tokenAmount ||
        !tokenAmount.token ||
        !snowbridgeContext
      )
        return

      const direction = resolveDirection(sourceChain, destinationChain)
      const token = nativeToken(sourceChain)

      try {
        switch (direction) {
          case Direction.ToEthereum: {
            const amount = (await Snowbridge.toEthereum.getSendFee(snowbridgeContext)).toString()
            setFees({
              amount,
              token,
              inDollars: 0, // todo: update with actual value
            })
            break
          }
          case Direction.ToPolkadot: {
            const amount = (
              await Snowbridge.toPolkadot.getSendFee(
                snowbridgeContext,
                tokenAmount.token.address,
                destinationChain.chainId,
                BigInt(0),
              )
            ).toString()

            setFees({
              amount,
              token,
              inDollars: 0,
            })
            break
          }
        }
      } catch (error) {
        setFees(null)
        Sentry.captureException(error)
        addNotification({
          severity: NotificationSeverity.Error,
          message: 'We failed to fetch the fees. Sorry, try again later.',
          dismissible: true,
        })
      }
    }

    fetchFees()
  }, [
    isValid,
    sourceChain,
    destinationChain,
    tokenAmount,
    environment,
    snowbridgeContext,
    addNotification,
  ])

  // validate recipient address
  useEffect(() => {
    if (
      !manualRecipient.enabled ||
      !destinationChain ||
      isValidAddressOfNetwork(manualRecipient.address, destinationChain.network) ||
      manualRecipient.address === ''
    )
      setManualRecipientError('')
    else setManualRecipientError('Invalid Address')
  }, [manualRecipient.address, destinationChain, sourceChain, manualRecipient.enabled])

  // validate token amount
  useEffect(() => {
    if (!tokenAmount?.amount) setTokenAmountError('')
    else if (balanceData && balanceData.value === BigInt(0))
      setTokenAmountError("That's more than you have in your wallet")
    else if (
      tokenAmount?.amount &&
      balanceData?.value &&
      tokenAmount.amount > Number(balanceData.formatted)
    )
      setTokenAmountError("That's more than you have in your wallet")
    else setTokenAmountError('')
  }, [tokenAmount?.amount, balanceData])

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

  useEffect(() => {
    const fetchContext = async () => {
      const snowbridgeEnv = getEnvironment(environment)
      const context = await getContext(snowbridgeEnv)
      setSnowbridgeContext(context)
    }

    fetchContext()
  }, [environment])

  return {
    control,
    errors,
    isValid,
    isValidating,
    handleSubmit: handleSubmit(onSubmit),
    handleSourceChainChange,
    handleDestinationChainChange,
    handleManualRecipientChange,
    handleMaxButtonClick,
    sourceChain,
    destinationChain,
    tokenAmount,
    manualRecipient,
    sourceWallet,
    destinationWallet,
    fees,
    transferStatus,
    environment,
    tokenAmountError,
    manualRecipientError,
    isBalanceAvailable: balanceData?.value && balanceData.value > 0,
  }
}

export default useTransferForm
