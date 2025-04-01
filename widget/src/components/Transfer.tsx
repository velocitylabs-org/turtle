import { Controller } from 'react-hook-form'
import ChainSelect from './ChainSelect'
import WalletButton from './WalletButton'
import { FC, useMemo } from 'react'
import useTransferForm from '@/hooks/useTransferForm'
import {
  getAllowedDestinationChains,
  getAllowedSourceChains,
  getAllowedTokens,
} from '@/utils/routes'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import TokenAmountSelect from './TokenAmountSelect'
import Button from './Button'
import { formatAmount, getDurationEstimate, resolveDirection } from '@/utils/transfer'
import { SwapChains } from './SwapFromToChains'
import { Chain } from '@/models/chain'
import { AnimatePresence, motion } from 'framer-motion'
import Switch from './Switch'
import { AlertIcon } from '@/assets/svg/AlertIcon'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { Signer } from 'ethers'
import ActionBanner from './ActionBanner'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useEthForWEthSwap from '@/hooks/useEthForWEthSwap'
import { cn } from '@/utils/helper'
import TxSummary from './TxSummary'
import SendButton from './SendButton'

const manualInputAnimationProps = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.07 },
}

const approvalAnimationProps = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3 },
}

const Transfer: FC = () => {
  const { snowbridgeContext } = useSnowbridgeContext()
  const {
    control,
    errors,
    isValid,
    isValidating,
    handleSubmit,
    environment,
    sourceChain,
    destinationChain,
    handleSourceChainChange,
    handleDestinationChainChange,
    swapFromTo,
    allowFromToSwap,
    sourceWallet,
    destinationWallet,
    manualRecipient,
    manualRecipientError,
    handleManualRecipientChange,
    tokenAmount,
    tokenAmountError,
    handleMaxButtonClick,
    isBalanceAvailable,
    balanceData,
    loadingBalance,
    fetchBalance,
    fees,
    bridgingFees,
    loadingFees,
    canPayFees,
    canPayAdditionalFees,
    refetchFees,
    transferStatus,
  } = useTransferForm()

  const {
    allowance: erc20SpendAllowance,
    loading: allowanceLoading,
    approveAllowance,
    approving: isApprovingErc20Spend,
  } = useErc20Allowance({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
    refetchFees,
  })

  const {
    ethBalance,
    swapEthtoWEth,
    isSwapping: isSwappingEthForWEth,
  } = useEthForWEthSwap({
    env: environment,
    context: snowbridgeContext,
    chain: sourceChain,
    tokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  let amountPlaceholder: string
  if (loadingBalance) amountPlaceholder = 'Loading...'
  else if (!sourceWallet || !tokenAmount?.token || !sourceWallet.isConnected || !isBalanceAvailable)
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else amountPlaceholder = formatAmount(Number(balanceData?.formatted), 'Longer')

  const shouldDisplayRecipientWalletButton =
    !manualRecipient.enabled && sourceChain?.walletType !== destinationChain?.walletType

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < tokenAmount!.amount!

  const shouldDisplayUsdtRevokeAllowance =
    erc20SpendAllowance !== 0 && tokenAmount?.token?.id === EthereumTokens.USDT.id

  const shouldDisableMaxButton =
    !sourceWallet?.isConnected ||
    !tokenAmount?.token ||
    !isBalanceAvailable ||
    balanceData?.value === 0n ||
    transferStatus !== 'Idle'

  const shouldDisplayTxSummary =
    tokenAmount?.token && !allowanceLoading && !requiresErc20SpendApproval

  const shouldDisplayEthToWEthSwap: boolean =
    !!sourceWallet &&
    sourceChain?.network === 'Ethereum' &&
    tokenAmount?.token?.symbol === 'wETH' &&
    !!tokenAmount?.amount &&
    !!balanceData &&
    !!ethBalance &&
    // The user wants to send more than the balance available
    tokenAmount.amount > Number(balanceData.formatted) &&
    // but they have enough ETH to make it possible
    tokenAmount.amount - Number(balanceData.formatted) < ethBalance &&
    // We don't want two ActionBanners showing up at once
    !requiresErc20SpendApproval

  // How much balance is missing considering the desired transfer amount
  const missingBalance =
    tokenAmount?.amount && balanceData ? tokenAmount.amount - Number(balanceData.formatted) : 0

  const direction =
    sourceChain && destinationChain ? resolveDirection(sourceChain, destinationChain) : undefined

  const durationEstimate = direction ? getDurationEstimate(direction) : undefined

  const isTransferAllowed =
    isValid &&
    !isValidating &&
    fees &&
    transferStatus === 'Idle' &&
    !requiresErc20SpendApproval &&
    !loadingFees &&
    canPayFees &&
    (bridgingFees ? canPayAdditionalFees : true)

  const approveAllowanceButton = useMemo(
    () => ({
      onClick: () => approveAllowance(sourceWallet?.sender as Signer),
      label: 'Sign now',
    }),
    [approveAllowance, sourceWallet?.sender],
  )

  const swapEthToWEthButton = useMemo(
    () => ({
      onClick: () =>
        swapEthtoWEth(sourceWallet?.sender as Signer, missingBalance).then(() => fetchBalance()),
      label: `Swap the difference`,
    }),
    [swapEthtoWEth, sourceWallet?.sender, missingBalance, fetchBalance],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-2xl border bg-background p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
        <Controller
          name="sourceChain"
          control={control}
          render={({ field }) => {
            const options = getAllowedSourceChains(environment)
            const reorderedOptions = reorderOptionsBySelectedItem(options, 'uid', sourceChain?.uid)

            return (
              <ChainSelect
                {...field}
                onChange={handleSourceChainChange}
                options={reorderedOptions}
                floatingLabel="From"
                placeholder="Source"
                trailing={<WalletButton walletType={sourceChain?.walletType} />}
                walletAddress={sourceWallet?.sender?.address}
                className="z-50"
                disabled={transferStatus !== 'Idle'}
              />
            )
          }}
        />

        {/* Token */}
        <Controller
          name="tokenAmount"
          control={control}
          render={({ field }) => {
            const options = getAllowedTokens(environment, sourceChain, destinationChain).map(
              token => ({
                token,
                amount: null,
                allowed: token.allowed,
              }),
            )

            const reorderedOptions = reorderOptionsBySelectedItem(
              options,
              'token.id',
              tokenAmount?.token?.id,
            )

            return (
              <TokenAmountSelect
                {...field}
                sourceChain={sourceChain}
                options={reorderedOptions}
                floatingLabel="Amount"
                disabled={transferStatus !== 'Idle' || !sourceChain}
                secondPlaceholder={amountPlaceholder}
                error={errors.tokenAmount?.amount?.message || tokenAmountError}
                trailing={
                  <Button
                    label="Max"
                    size="sm"
                    variant="outline"
                    className="min-w-[40px]"
                    onClick={handleMaxButtonClick}
                    disabled={shouldDisableMaxButton}
                  />
                }
                className="z-40"
              />
            )
          }}
        />

        {/* Swap source and destination chains */}
        <SwapChains onClick={swapFromTo} disabled={!allowFromToSwap()} />

        {/* Destination Chain */}
        <Controller
          name="destinationChain"
          control={control}
          render={({ field }) => {
            const options = getAllowedDestinationChains(
              environment,
              sourceChain,
              tokenAmount!.token,
            )

            const reorderedOptions = reorderOptionsBySelectedItem<
              Chain & {
                allowed: boolean
              }
            >(options, 'uid', destinationChain?.uid)

            return (
              <ChainSelect
                {...field}
                onChange={handleDestinationChainChange}
                options={reorderedOptions}
                floatingLabel="To"
                placeholder="Destination"
                manualRecipient={manualRecipient}
                onChangeManualRecipient={handleManualRecipientChange}
                error={manualRecipient.enabled ? manualRecipientError : ''}
                trailing={
                  shouldDisplayRecipientWalletButton && (
                    <WalletButton walletType={destinationChain?.walletType} />
                  )
                }
                clearable
                walletAddress={destinationWallet?.sender?.address}
                className="z-30"
                disabled={transferStatus !== 'Idle' || !sourceChain || !tokenAmount?.token}
              />
            )
          }}
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
                className="flex items-center gap-1 self-center pt-1"
                {...manualInputAnimationProps}
              >
                <AlertIcon />
                <span className="text-xs">Double check the address to avoid losing funds</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ERC-20 Spend Approval */}
      <AnimatePresence>
        {requiresErc20SpendApproval && (
          <motion.div
            className="flex items-center gap-1 self-center pt-1"
            {...approvalAnimationProps}
          >
            <ActionBanner
              disabled={isApprovingErc20Spend}
              header="Approve ERC-20 token spend"
              text={`We first need your approval to transfer this token from your wallet. ${shouldDisplayUsdtRevokeAllowance ? 'USDT requires revoking the current allowance before setting a new one.' : ''}`}
              image={
                <img
                  src={'./src/assets/svg/wallet.svg'}
                  alt={'Wallet illustration'}
                  width={64}
                  height={64}
                />
              }
              btn={approveAllowanceButton}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ETH to wETH Conversion */}
      <AnimatePresence>
        {shouldDisplayEthToWEthSwap && (
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
            <ActionBanner
              disabled={isSwappingEthForWEth}
              header={'Swap ETH for wETH'}
              text={'Your wETH balance is insufficient but you got enough ETH.'}
              image={
                <img
                  src={'./src/assets/svg/wallet.svg'}
                  alt={'Wallet illustration'}
                  width={64}
                  height={64}
                />
              }
              btn={swapEthToWEthButton}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {shouldDisplayTxSummary && (
        <TxSummary
          loading={loadingFees}
          tokenAmount={tokenAmount}
          fees={fees}
          bridgingFees={bridgingFees}
          durationEstimate={durationEstimate}
          canPayFees={canPayFees}
          canPayAdditionalFees={canPayAdditionalFees}
          direction={direction}
          className={cn({ 'opacity-30': transferStatus !== 'Idle' })}
        />
      )}

      {/* Transfer Button */}
      <SendButton
        className="my-5 w-full"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={!isTransferAllowed}
        cypressID="form-submit"
        status={transferStatus}
      />
    </form>
  )
}

export default Transfer
