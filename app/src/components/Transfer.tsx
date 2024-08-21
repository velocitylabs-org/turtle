'use client'
import { REGISTRY } from '@/config/registry'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useTransferForm from '@/hooks/useTransferForm'
import { resolveDirection } from '@/services/transfer'
import { getDurationEstimate } from '@/utils/transfer'
import { Signer } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { Controller } from 'react-hook-form'
import Button from './Button'
import ChainSelect from './ChainSelect'
import Credits from './Credits'
import FeesPreview from './FeesPreview'
import SubstrateWalletModal from './SubstrateWalletModal'
import { AlertIcon } from './svg/AlertIcon'
import Switch from './Switch'
import TokenAmountSelect from './TokenAmountSelect'
import TokenSpendApproval from './TokenSpendApproval'
import WalletButton from './WalletButton'

const Transfer: FC = () => {
  const { snowbridgeContext } = useSnowbridgeContext()
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
    loadingBalance,
    balanceData,
  } = useTransferForm()

  const {
    allowance: erc20SpendAllowance,
    approveAllowance,
    approving: isApprovingErc20Spend,
  } = useErc20Allowance({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
  })
  let amountPlaceholder: string

  if (
    !sourceWallet ||
    !tokenAmount?.token ||
    !sourceWallet.isConnected ||
    !isBalanceAvailable ||
    loadingBalance
  )
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else
    amountPlaceholder = `${Number(balanceData?.formatted).toFixed(3).toString() + ' ' + tokenAmount?.token?.symbol}`

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < tokenAmount!.amount!

  const direction =
    sourceChain && destinationChain ? resolveDirection(sourceChain, destinationChain) : undefined
  const durationEstimate = direction ? getDurationEstimate(direction) : undefined

  const sourceChains = destinationChain
    ? REGISTRY[environment].chains.filter(chain =>
        chain.transferableTo.includes(destinationChain.uid),
      )
    : REGISTRY[environment].chains.filter(chain => chain.transferableTo.length > 0)

  const destinationChains = sourceChain
    ? sourceChain.transferableTo.map(
        uid => REGISTRY[environment].chains.find(chain => chain.uid === uid)!,
      )
    : REGISTRY[environment].chains

  const tokens = destinationChain ? destinationChain.receivableTokens : REGISTRY[environment].tokens

  console.log('sourceChain', sourceChains)
  console.log('destinationChain', destinationChains)
  console.log('tokenAmount', tokens)

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-3xl bg-white p-5 px-[1.5rem] py-[2rem] shadow-lg backdrop-blur-sm sm:w-[31.5rem] sm:p-[2.5rem]"
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
              options={sourceChains}
              floatingLabel="From"
              placeholder="Source"
              trailing={<WalletButton addressType={sourceChain?.supportedAddressTypes.at(0)} />} // TODO: support all address types
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
              options={tokens.map(token => ({ token, amount: null }))}
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
                    balanceData?.value === 0n ||
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
              options={destinationChains}
              floatingLabel="To"
              placeholder="Destination"
              manualRecipient={manualRecipient}
              onChangeManualRecipient={handleManualRecipientChange}
              error={manualRecipient.enabled ? manualRecipientError : ''}
              trailing={
                !manualRecipient.enabled && (
                  <WalletButton addressType={destinationChain?.supportedAddressTypes.at(0)} /> // TODO: support all address types
                )
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

      {/* ERC-20 Spend Approval */}
      <AnimatePresence>
        {requiresErc20SpendApproval && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 self-center pt-1"
          >
            <TokenSpendApproval
              onClick={() => approveAllowance(sourceWallet?.sender as Signer)}
              approving={isApprovingErc20Spend}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fees */}
      <FeesPreview
        hidden={!isValid || requiresErc20SpendApproval}
        loading={loadingFees || !fees}
        fees={fees}
        durationEstimate={durationEstimate}
      />

      {/* Transfer Button */}
      <Button
        className="my-5"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={
          !isValid ||
          isValidating ||
          !fees ||
          transferStatus !== 'Idle' ||
          requiresErc20SpendApproval
        }
        cypressID="form-submit"
      />

      <Credits />
      <SubstrateWalletModal />
    </form>
  )
}

export default Transfer
