'use client'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useEthForWEthSwap from '@/hooks/useEthForWEthSwap'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useTransferForm from '@/hooks/useTransferForm'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { resolveDirection } from '@/services/transfer'
import { cn } from '@/utils/cn'
import {
  getSwapsDestinationChains,
  getSwapsDestinationTokens,
  getSwapsSourceChains,
  getSwapsSourceTokens,
} from '@/utils/paraspellSwaps'
import { formatAmount, getDurationEstimate } from '@/utils/transfer'
import { Signer } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { FC, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import ActionBanner from './ActionBanner'
import Button from './Button'
import ChainTokenSelect from './ChainTokenSelect'
import Credits from './Credits'
import SendButton from './SendButton'
import SubstrateWalletModal from './SubstrateWalletModal'
import { AlertIcon } from './svg/AlertIcon'
import { SwapChains } from './SwapFromToChains'
import Switch from './Switch'
import TxSummary from './TxSummary'
import WalletButton from './WalletButton'

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
    allowFromToSwap,
    handleSubmit,
    handleSourceChainChange,
    handleDestinationChainChange,
    swapFromTo,
    handleManualRecipientChange,
    handleMaxButtonClick,
    sourceChain,
    destinationChain,
    sourceTokenAmount,
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
    isBalanceAvailable,
    loadingBalance,
    balanceData,
    fetchBalance,
  } = useTransferForm()

  const {
    allowance: erc20SpendAllowance,
    loading: allowanceLoading,
    approveAllowance,
    approving: isApprovingErc20Spend,
  } = useErc20Allowance({
    context: snowbridgeContext,
    network: sourceChain?.network,
    tokenAmount: sourceTokenAmount,
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
    tokenAmount: sourceTokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < sourceTokenAmount!.amount!

  const shouldDisplayEthToWEthSwap: boolean =
    !!sourceWallet &&
    sourceChain?.network === 'Ethereum' &&
    sourceTokenAmount?.token?.symbol === 'wETH' &&
    !!sourceTokenAmount?.amount &&
    !!balanceData &&
    !!ethBalance &&
    // The user wants to send more than the balance available
    sourceTokenAmount.amount > Number(balanceData.formatted) &&
    // but they have enough ETH to make it possible
    sourceTokenAmount.amount - Number(balanceData.formatted) < ethBalance &&
    // We don't want two ActionBanners showing up at once
    !requiresErc20SpendApproval

  const shouldDisplayRecipientWalletButton =
    !manualRecipient.enabled && sourceChain?.walletType !== destinationChain?.walletType

  // How much balance is missing considering the desired transfer amount
  const missingBalance =
    sourceTokenAmount?.amount && balanceData
      ? sourceTokenAmount.amount - Number(balanceData.formatted)
      : 0

  let amountPlaceholder: string
  if (loadingBalance) amountPlaceholder = 'Loading...'
  else if (
    !sourceWallet ||
    !sourceTokenAmount?.token ||
    !sourceWallet.isConnected ||
    !isBalanceAvailable
  )
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else amountPlaceholder = formatAmount(Number(balanceData?.formatted), 'Longer')

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
    (bridgingFee ? canPayAdditionalFees : true)

  const shouldDisableMaxButton =
    !sourceWallet?.isConnected ||
    !sourceTokenAmount?.token ||
    !isBalanceAvailable ||
    balanceData?.value === 0n ||
    transferStatus !== 'Idle'

  const shouldDisplayTxSummary =
    sourceTokenAmount?.token && !allowanceLoading && !requiresErc20SpendApproval

  const shouldDisplayUsdtRevokeAllowance =
    erc20SpendAllowance !== 0 && sourceTokenAmount?.token?.id === EthereumTokens.USDT.id

  const sourceChainOptions = getSwapsSourceChains().map(chain => ({
    ...chain,
    allowed: true,
  }))

  const destinationChainOptions = useMemo(
    () =>
      getSwapsDestinationChains(sourceChain, sourceTokenAmount?.token ?? null).map(chain => ({
        ...chain,
        allowed: true,
      })),
    [sourceChain, sourceTokenAmount?.token],
  )

  // TODO: create function to get source token options
  const sourceTokenOptions = useMemo(
    () =>
      getSwapsSourceTokens(sourceChain).map(token => ({
        ...token,
        allowed: true,
      })),
    [sourceChain],
  )

  // TODO: create function to get destination token options
  const destinationTokenOptions = useMemo(
    () =>
      getSwapsDestinationTokens(
        sourceChain,
        sourceTokenAmount?.token ?? null,
        destinationChain,
      ).map(token => ({
        ...token,
        allowed: true,
      })),
    [sourceChain, sourceTokenAmount?.token, destinationChain],
  )

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
        swapEthtoWEth(sourceWallet?.sender as Signer, missingBalance).then(_ => fetchBalance()),
      label: `Swap the difference`,
    }),
    [swapEthtoWEth, sourceWallet?.sender, missingBalance, fetchBalance],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-3xl border-1 border-turtle-foreground bg-white p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        <Controller
          name="sourceChain"
          control={control}
          render={({ field: chainField }) => {
            return (
              <Controller
                name="sourceTokenAmount"
                control={control}
                render={({ field: tokenField }) => {
                  return (
                    <ChainTokenSelect
                      chain={{
                        ...chainField,
                        onChange: handleSourceChainChange,
                        options: sourceChainOptions,
                        error: errors.sourceChain?.message,
                        clearable: true,
                        orderBySelected: true,
                      }}
                      token={{
                        value: tokenField.value?.token ?? null,
                        onChange: token =>
                          tokenField.onChange({ token, amount: tokenField.value?.amount ?? null }),
                        options: sourceTokenOptions,
                        sourceChainToDetermineOriginBanner: sourceChain,
                        error: errors.sourceTokenAmount?.token?.message,
                        clearable: true,
                        orderBySelected: true,
                      }}
                      amount={{
                        value: tokenField.value?.amount ?? null,
                        onChange: amount =>
                          tokenField.onChange({ token: tokenField.value?.token ?? null, amount }),
                        error: errors.sourceTokenAmount?.amount?.message || sourceTokenAmountError,
                        placeholder: amountPlaceholder,
                        trailingAction: sourceTokenAmount?.amount ? (
                          <></>
                        ) : (
                          <Button
                            label="Max"
                            size="sm"
                            variant="outline"
                            className="min-w-[40px]"
                            onClick={handleMaxButtonClick}
                            disabled={shouldDisableMaxButton}
                          />
                        ),
                      }}
                      wallet={{
                        address: sourceWallet?.sender?.address,
                        walletButton: <WalletButton walletType={sourceChain?.walletType} />,
                      }}
                      disabled={transferStatus !== 'Idle'}
                      className="z-40"
                    />
                  )
                }}
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
          render={({ field: chainField }) => {
            return (
              <Controller
                name="destinationTokenAmount"
                control={control}
                render={({ field: tokenField }) => (
                  <ChainTokenSelect
                    chain={{
                      ...chainField,
                      onChange: handleDestinationChainChange,
                      options: destinationChainOptions,
                      error: errors.destinationChain?.message,
                      clearable: true,
                      orderBySelected: true,
                    }}
                    token={{
                      value: tokenField.value?.token ?? null,
                      onChange: token =>
                        tokenField.onChange({ token, amount: tokenField.value?.amount ?? null }),
                      options: destinationTokenOptions,
                      error: errors.destinationTokenAmount?.token?.message,
                      clearable: true,
                      orderBySelected: true,
                      sourceChainToDetermineOriginBanner: sourceChain,
                      priorityToken: sourceTokenAmount?.token,
                    }}
                    amount={{
                      value: tokenField.value?.amount ?? null,
                      onChange: amount =>
                        tokenField.onChange({ token: tokenField.value?.token ?? null, amount }),
                      error: errors.destinationTokenAmount?.amount?.message,
                      placeholder: 'Receive Amount',
                      disabled: true,
                    }}
                    wallet={{
                      address: destinationWallet?.sender?.address,
                      error: manualRecipient.enabled ? manualRecipientError : '',
                      walletButton: shouldDisplayRecipientWalletButton ? (
                        <WalletButton walletType={destinationChain?.walletType} />
                      ) : undefined,
                      manualAddressInput: {
                        enabled: manualRecipient.enabled,
                        address: manualRecipient.address,
                        onChange: handleManualRecipientChange,
                      },
                    }}
                    disabled={
                      transferStatus !== 'Idle' || !sourceChain || !sourceTokenAmount?.token
                    }
                    className="z-30"
                    floatingLabel="To"
                  />
                )}
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
              text={`We need your approval to transfer this token from your wallet. ${shouldDisplayUsdtRevokeAllowance ? 'USDT requires revoking the current allowance before setting a new one.' : ''}`}
              image={
                <Image src={'/wallet.svg'} alt={'Wallet illustration'} width={64} height={64} />
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
            className="flex items-center gap-1 self-center pt-1"
            {...approvalAnimationProps}
          >
            <ActionBanner
              disabled={isSwappingEthForWEth}
              header={'Swap ETH for wETH'}
              text={'Your wETH balance is insufficient but you got enough ETH.'}
              image={<Image src={'/wallet.svg'} alt={'Wallet'} width={64} height={64} />}
              btn={swapEthToWEthButton}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {shouldDisplayTxSummary && (
        <TxSummary
          loading={loadingFees}
          tokenAmount={sourceTokenAmount}
          fees={fees}
          bridgingFees={bridgingFee}
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

      <Credits />
      <SubstrateWalletModal />
    </form>
  )
}

export default Transfer
