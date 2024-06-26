'use client'
import { REGISTRY } from '@/config/registry'
import useEnvironment from '@/hooks/useEnvironment'
import useTransfer from '@/hooks/useTransfer'
import useWallet from '@/hooks/useWallet'
import { Chain } from '@/models/chain'
import { schema } from '@/models/schemas'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { truncateAddress } from '@/utils/address'
import { convertAmount } from '@/utils/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { FC, useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import Button from './Button'
import ChainSelect from './ChainSelect'
import SubstrateWalletModal from './SubstrateWalletModal'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import WalletButton from './WalletButton'
import { AlertIcon } from './svg/AlertIcon'

interface FormInputs {
  sourceChain: Chain | null
  destinationChain: Chain | null
  tokenAmount: TokenAmount | null
  manualRecipient: ManualRecipient
}

const Transfer: FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid, isValidating },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    delayError: 3000,
    defaultValues: {
      sourceChain: null,
      destinationChain: null,
      tokenAmount: { token: null, amount: null },
      manualRecipient: {
        enabled: false,
        address: '',
      },
    },
  })

  const sourceChain = watch('sourceChain')
  const destinationChain = watch('destinationChain')
  const tokenAmount = watch('tokenAmount')
  const manualRecipient = watch('manualRecipient')

  // Hooks
  const sourceWallet = useWallet(sourceChain?.network)
  const destinationWallet = useWallet(destinationChain?.network)
  const { environment } = useEnvironment()
  const { transfer, transferStatus } = useTransfer()

  // Form submit
  const onSubmit: SubmitHandler<FormInputs> = data => {
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
      !amount
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
    })
  }

  useEffect(() => {
    trigger('manualRecipient.address')
  }, [manualRecipient.address])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="z-20 flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-lg backdrop-blur-sm sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
        <Controller
          name="sourceChain"
          control={control}
          render={({ field }) => (
            <ChainSelect
              {...field}
              options={REGISTRY[environment].chains}
              floatingLabel="From"
              placeholder="Source"
              error={errors.sourceChain?.message}
              trailing={<WalletButton network={sourceChain?.network} />}
              walletAddress={truncateAddress(sourceWallet?.sender?.address || '')}
              className="z-50"
              disabled={transferStatus !== 'Idle'}
            />
          )}
        />

        {/* Token */}
        <Controller
          name="tokenAmount"
          control={control}
          render={({ field }) => (
            <TokenAmountSelect
              {...field}
              options={REGISTRY[environment].tokens.map(token => ({ token, amount: null }))}
              floatingLabel="Amount"
              disabled={transferStatus !== 'Idle'}
              error={errors.tokenAmount?.token?.message || errors.tokenAmount?.amount?.message}
              trailing={
                <Button
                  label="Max"
                  size="sm"
                  variant="outline"
                  className="min-w-[40px]"
                  disabled={
                    !sourceWallet?.isConnected ||
                    tokenAmount?.token === null ||
                    transferStatus !== 'Idle'
                  }
                />
              }
              className="z-40"
            />
          )}
        />

        {/* Destination Chain */}
        <Controller
          name="destinationChain"
          control={control}
          render={({ field }) => (
            <ChainSelect
              {...field}
              options={REGISTRY[environment].chains}
              floatingLabel="To"
              placeholder="Destination"
              manualRecipient={manualRecipient}
              onChangeManualRecipient={value => setValue('manualRecipient', value)}
              error={manualRecipient.enabled ? errors.manualRecipient?.address?.message : ''}
              trailing={
                !manualRecipient.enabled && <WalletButton network={destinationChain?.network} />
              }
              walletAddress={truncateAddress(destinationWallet?.sender?.address || '')}
              className="z-30"
              disabled={transferStatus !== 'Idle'}
            />
          )}
        />
      </div>

      {/* Recipient Wallet or Address Input */}
      {destinationChain && (
        <div className="flex flex-col gap-1">
          {manualRecipient.enabled && (
            <div className="flex items-center gap-1 self-center pt-1">
              <AlertIcon />
              <span className="text-xs">Double check address to avoid losing funds.</span>
            </div>
          )}
          {/* Switch Wallet and Manual Input */}
          <Controller
            name="manualRecipient.enabled"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                className="items-start pt-1"
                label="Send to a different address"
                disabled={transferStatus !== 'Idle'}
              />
            )}
          />
        </div>
      )}

      {/* Transfer Button */}
      <Button
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        disabled={
          !isValid ||
          isValidating ||
          transferStatus !== 'Idle' ||
          !sourceWallet?.isConnected ||
          (!manualRecipient.enabled && !destinationWallet?.isConnected)
        }
        className="my-5"
      />

      {/* Warning Label */}
      <div className="self-center text-sm text-turtle-level5">
        <span>This can take up to 30 minutes. </span>
        <Link href={'/'}>
          {/* TODO: update Link */}
          <span className="underline">Read more</span>
        </Link>
      </div>

      <SubstrateWalletModal />
    </form>
  )
}

export default Transfer
