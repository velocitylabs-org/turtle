'use client'
import { REGISTRY } from '@/config/registry'
import useTransferForm from '@/hooks/useTransferForm'
import Link from 'next/link'
import { FC } from 'react'
import { Controller } from 'react-hook-form'
import Button from './Button'
import ChainSelect from './ChainSelect'
import FeesPreview from './FeesPreview'
import SubstrateWalletModal from './SubstrateWalletModal'
import { AlertIcon } from './svg/AlertIcon'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import WalletButton from './WalletButton'
import { AnimatePresence, motion } from 'framer-motion'

const Transfer: FC = () => {
  const {
    control,
    errors,
    isValid,
    isValidating,
    handleSubmit,
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
    loadingFees,
    transferStatus,
    environment,
    tokenAmountError,
    manualRecipientError,
    isBalanceAvailable,
    balanceData,
  } = useTransferForm()

  const amountPlaceholder = !isBalanceAvailable ? "Amount" : balanceData?.value == BigInt(0) ? "No balance :(" : `${Number(balanceData?.formatted).toFixed(3).toString() + ' ' + tokenAmount?.token?.symbol} `

  console.log("Transfer - balance is ", balanceData)

  return (
    <form
      onSubmit={handleSubmit}
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
              onChange={handleSourceChainChange}
              options={REGISTRY[environment].chains}
              floatingLabel="From"
              placeholder="Source"
              trailing={<WalletButton network={sourceChain?.network} />}
              walletAddress={sourceWallet?.sender?.address}
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
              secondPlaceholder={amountPlaceholder}
              error={errors.tokenAmount?.amount?.message || tokenAmountError}
              trailing={
                <Button
                  label="Max"
                  size="sm"
                  variant="outline"
                  className="min-w-[40px]"
                  onClick={handleMaxButtonClick}
                  disabled={
                    !sourceWallet?.isConnected ||
                    !tokenAmount?.token ||
                    !isBalanceAvailable ||
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
              onChange={handleDestinationChainChange}
              options={REGISTRY[environment].chains}
              floatingLabel="To"
              placeholder="Destination"
              manualRecipient={manualRecipient}
              onChangeManualRecipient={handleManualRecipientChange}
              error={manualRecipient.enabled ? manualRecipientError : ''}
              trailing={
                !manualRecipient.enabled && <WalletButton network={destinationChain?.network} />
              }
              walletAddress={destinationWallet?.sender?.address}
              className="z-30"
              disabled={transferStatus !== 'Idle'}
            />
          )}
        />
      </div>

      {destinationChain && (
        <div className="flex flex-col gap-1">
          {/* Switch between Wallet and Manual Input */}
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

          {/* Manual input warning */}
          <AnimatePresence>
            {manualRecipient.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.07 }}
                className="flex items-center gap-1 self-center pt-1"
              >
                <AlertIcon />
                <span className="text-xs">Double check address to avoid losing funds.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Fees */}
      <FeesPreview hidden={!isValid} loading={loadingFees || !fees} fees={fees} />

      {/* Transfer Button */}
      <Button
        className="my-5"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={!isValid || isValidating || !fees || transferStatus !== 'Idle'}
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
