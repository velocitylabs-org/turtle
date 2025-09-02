import WalletIcon from '@velocitylabs-org/turtle-assets/icons/wallet.svg'
import { type Balance, EthereumTokens, type TokenAmount } from '@velocitylabs-org/turtle-registry'
import { Button, cn, Switch } from '@velocitylabs-org/turtle-ui'
import type { Signer } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import { type FC, use, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { AlertIcon } from '@/assets/svg/AlertIcon'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import useEthForWEthSwap from '@/hooks/useEthForWEthSwap'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import useTransferForm from '@/hooks/useTransferForm'
import type { WalletInfo } from '@/hooks/useWallet'

import { ConfigContext } from '@/providers/ConfigProviders'
import {
  getAllowedDestinationChains,
  getAllowedDestinationTokens,
  getAllowedSourceChains,
  getAllowedSourceTokens,
} from '@/utils/routes'
import { formatAmount, getDurationEstimate, resolveDirection } from '@/utils/transfer'
import ActionBanner from './ActionBanner'
import ChainTokenSelect from './ChainTokenSelect'
import SendButton from './SendButton'
import { SwapChains as SwapFromToChains } from './SwapFromToChains'
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

const getSourceAmountPlaceholder = ({
  loadingBalance,
  sourceWallet,
  sourceTokenAmount,
  isBalanceAvailable,
  balanceData,
}: {
  loadingBalance: boolean
  sourceWallet: WalletInfo | undefined
  sourceTokenAmount: TokenAmount | null
  isBalanceAvailable: boolean
  balanceData: Balance | undefined
}): string => {
  if (loadingBalance) return 'Loading...'
  if (!sourceWallet || !sourceTokenAmount?.token || !sourceWallet.isConnected || !isBalanceAvailable) {
    return 'Amount'
  }
  if (balanceData?.value === 0n) return 'No balance'
  return formatAmount(Number(balanceData?.formatted), 'Longer')
}

const Transfer: FC = () => {
  const { snowbridgeContext } = useSnowbridgeContext()
  const {
    control,
    errors,
    isValid,
    isValidating,
    handleSubmit,
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
    sourceTokenAmount,
    sourceToken,
    destinationTokenAmount,
    sourceTokenAmountError,
    handleMaxButtonClick,
    handleSourceTokenChange,
    isBalanceAvailable,
    balanceData,
    loadingBalance,
    fetchBalance,
    fees,
    isBalanceSufficientForFees,
    loadingFees,
    refetchFees,
    transferStatus,
    isLoadingOutputAmount,
    maxButtonLoading,
  } = useTransferForm()

  const { allowedChains, allowedTokens } = use(ConfigContext)

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
    context: snowbridgeContext,
    chain: sourceChain,
    tokenAmount: sourceTokenAmount,
    owner: sourceWallet?.sender?.address,
  })

  const amountPlaceholder = getSourceAmountPlaceholder({
    loadingBalance,
    sourceWallet,
    sourceTokenAmount,
    isBalanceAvailable,
    balanceData,
  })

  const shouldDisplayRecipientWalletButton =
    !manualRecipient.enabled && sourceChain?.walletType !== destinationChain?.walletType

  const requiresErc20SpendApproval =
    erc20SpendAllowance !== undefined && erc20SpendAllowance < sourceTokenAmount!.amount!

  const shouldDisplayUsdtRevokeAllowance =
    erc20SpendAllowance !== 0 && sourceTokenAmount?.token?.id === EthereumTokens.USDT.id

  const disableMaxBtnInPolkadotNetwork =
    (sourceChain?.network === 'Polkadot' || sourceChain?.network === 'Kusama') &&
    (!destinationWallet?.sender || !destinationTokenAmount?.token)

  const shouldDisableMaxButton =
    !sourceWallet?.isConnected ||
    !sourceTokenAmount?.token ||
    !isBalanceAvailable ||
    balanceData?.value === 0n ||
    transferStatus !== 'Idle' ||
    disableMaxBtnInPolkadotNetwork ||
    maxButtonLoading

  const shouldDisplayTxSummary =
    sourceTokenAmount?.token &&
    sourceTokenAmount?.amount &&
    destinationTokenAmount?.token &&
    !allowanceLoading &&
    !requiresErc20SpendApproval &&
    destinationChain &&
    sourceWallet?.sender &&
    destinationWallet?.sender

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

  // How much balance is missing considering the desired transfer amount
  const missingBalance =
    sourceTokenAmount?.amount && balanceData ? sourceTokenAmount.amount - Number(balanceData.formatted) : 0

  const direction = sourceChain && destinationChain ? resolveDirection(sourceChain, destinationChain) : undefined

  const durationEstimate = direction ? getDurationEstimate(direction) : undefined

  const hasFees = fees && fees?.length > 0
  const allFeesItemsAreSufficient = hasFees && fees.every(fee => fee.sufficient !== 'insufficient')

  const isTransferAllowed =
    isValid &&
    !isValidating &&
    hasFees &&
    transferStatus === 'Idle' &&
    !requiresErc20SpendApproval &&
    !loadingFees &&
    !isLoadingOutputAmount &&
    isBalanceSufficientForFees &&
    allFeesItemsAreSufficient

  const sourceChainOptions = useMemo(() => getAllowedSourceChains(allowedChains), [allowedChains])

  const destinationChainOptions = useMemo(
    () => getAllowedDestinationChains(sourceChain, sourceTokenAmount?.token ?? null, allowedChains),
    [sourceChain, sourceTokenAmount?.token, allowedChains],
  )

  const sourceTokenOptions = useMemo(
    () => getAllowedSourceTokens(sourceChain, destinationChain, allowedTokens),
    [sourceChain, destinationChain, allowedTokens],
  )

  const destinationTokenOptions = useMemo(
    () => getAllowedDestinationTokens(sourceChain, sourceTokenAmount?.token ?? null, destinationChain),
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
      onClick: () => swapEthtoWEth(sourceWallet?.sender as Signer, missingBalance).then(() => fetchBalance()),
      label: `Swap the difference`,
    }),
    [swapEthtoWEth, sourceWallet?.sender, missingBalance, fetchBalance],
  )

  const sourceTokenAmountErrorMessage = useMemo(() => {
    if (errors.sourceTokenAmount?.amount?.message) return errors.sourceTokenAmount.amount.message
    if (sourceTokenAmountError) return sourceTokenAmountError
    if (!isBalanceSufficientForFees) return `We need some of that ${sourceToken?.symbol} to pay fees`
    return undefined
  }, [errors.sourceTokenAmount?.amount?.message, sourceTokenAmountError, isBalanceSufficientForFees, sourceToken])

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-2xl border bg-turtle-background p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      <div className="flex flex-col gap-5">
        {/* Source Chain */}
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
                      chainProps={{
                        ...chainField,
                        onChange: handleSourceChainChange,
                        options: sourceChainOptions,
                        error: errors.sourceChain?.message,
                        clearable: true,
                        orderBySelected: true,
                      }}
                      tokenProps={{
                        value: tokenField.value?.token ?? null,
                        onChange: handleSourceTokenChange,
                        options: sourceTokenOptions,
                        sourceChainToDetermineOriginBanner: sourceChain,
                        error: errors.sourceTokenAmount?.token?.message,
                        clearable: true,
                        orderBySelected: true,
                      }}
                      amountProps={{
                        value: tokenField.value?.amount ?? null,
                        onChange: amount => tokenField.onChange({ token: tokenField.value?.token ?? null, amount }),
                        error: sourceTokenAmountErrorMessage,
                        placeholder: amountPlaceholder,
                        trailingAction: !sourceTokenAmount?.amount && (
                          <Button
                            label={maxButtonLoading ? '' : 'Max'}
                            size="sm"
                            variant="outline"
                            className="min-w-[40px]"
                            onClick={handleMaxButtonClick}
                            disabled={shouldDisableMaxButton}
                            loading={maxButtonLoading}
                          />
                        ),
                        tooltipContent: 'Max transferable balance',
                      }}
                      walletProps={{
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
        <SwapFromToChains onClick={swapFromTo} disabled={!allowFromToSwap()} />

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
                    chainProps={{
                      ...chainField,
                      onChange: handleDestinationChainChange,
                      options: destinationChainOptions,
                      error: errors.destinationChain?.message,
                      clearable: true,
                      orderBySelected: true,
                    }}
                    tokenProps={{
                      value: tokenField.value?.token ?? null,
                      onChange: token => tokenField.onChange({ token, amount: tokenField.value?.amount ?? null }),
                      options: destinationTokenOptions,
                      error: errors.destinationTokenAmount?.token?.message,
                      clearable: true,
                      orderBySelected: true,
                      sourceChainToDetermineOriginBanner: destinationChain,
                      priorityToken: sourceTokenAmount?.token,
                    }}
                    amountProps={{
                      value: null, // the destination amount is shown in the TxSummary component
                      onChange: amount => tokenField.onChange({ token: tokenField.value?.token ?? null, amount }),
                      error: errors.destinationTokenAmount?.amount?.message,
                      placeholder: '',
                      disabled: true,
                    }}
                    walletProps={{
                      address: destinationWallet?.sender?.address,
                      error: manualRecipient.enabled ? manualRecipientError : '',
                      walletButton: shouldDisplayRecipientWalletButton ? (
                        <WalletButton walletType={destinationChain?.walletType} />
                      ) : undefined,
                      manualRecipientInput: {
                        enabled: manualRecipient.enabled,
                        address: manualRecipient.address,
                        onChange: handleManualRecipientChange,
                      },
                    }}
                    disabled={transferStatus !== 'Idle' || !sourceChain || !sourceTokenAmount?.token}
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
                className="items-start pt-3"
                label="Send to a different address"
                disabled={transferStatus !== 'Idle'}
              />
            )}
          />

          {/* Manual input warning */}
          <AnimatePresence>
            {manualRecipient.enabled && (
              <motion.div className="flex items-center gap-1 pt-2" {...manualInputAnimationProps}>
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
          <motion.div className="flex items-center gap-1 self-center pt-1" {...approvalAnimationProps}>
            <ActionBanner
              disabled={isApprovingErc20Spend}
              header="Approve ERC-20 token spend"
              text={`We first need your approval to transfer this token from your wallet. ${shouldDisplayUsdtRevokeAllowance ? 'USDT requires revoking the current allowance before setting a new one.' : ''}`}
              image={<img src={WalletIcon} alt={'Wallet illustration'} width={64} height={64} />}
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
              image={<img src={WalletIcon} alt={'Wallet illustration'} width={64} height={64} />}
              btn={swapEthToWEthButton}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shouldDisplayTxSummary && (
          <TxSummary
            loading={loadingFees}
            sourceTokenAmount={sourceTokenAmount}
            destinationTokenAmount={destinationTokenAmount}
            destChain={destinationChain}
            fees={fees}
            durationEstimate={durationEstimate}
            sourceTokenAmountError={sourceTokenAmountErrorMessage}
            className={cn({ 'opacity-30': transferStatus !== 'Idle' })}
          />
        )}
      </AnimatePresence>

      {/* Transfer Button */}
      <SendButton
        className="mt-6 sm:mt-9 mb-1 sm:mb-2"
        label="Send"
        size="lg"
        variant="primary"
        type="submit"
        loading={transferStatus !== 'Idle'}
        disabled={!isTransferAllowed}
        status={transferStatus}
      />
    </form>
  )
}

export default Transfer
