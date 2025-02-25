import { Controller } from 'react-hook-form'
import ChainSelect from './ChainSelect'
import WalletButton from './WalletButton'
import { FC } from 'react'
import useTransferForm from '@/hooks/useTransferForm'
import { getAllowedSourceChains, getAllowedTokens } from '@/utils/routes'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import TokenAmountSelect from './TokenAmountSelect'
import Button from './Button'
import { formatAmount } from '@/utils/transfer'

const Transfer: FC = () => {
  const {
    control,
    errors,
    environment,
    sourceChain,
    handleSourceChainChange,
    sourceWallet,
    destinationChain,
    tokenAmount,
    tokenAmountError,
    transferStatus,
    handleMaxButtonClick,
    handleSubmit,
    isBalanceAvailable,
    loadingBalance,
    balanceData,
    // fetchBalance,
  } = useTransferForm()

  let amountPlaceholder: string
  if (loadingBalance) amountPlaceholder = 'Loading...'
  else if (!sourceWallet || !tokenAmount?.token || !sourceWallet.isConnected || !isBalanceAvailable)
    amountPlaceholder = 'Amount'
  else if (balanceData?.value === 0n) amountPlaceholder = 'No balance'
  else amountPlaceholder = formatAmount(Number(balanceData?.formatted), 'Longer')

  const shouldDisableMaxButton =
    !sourceWallet?.isConnected ||
    !tokenAmount?.token ||
    !isBalanceAvailable ||
    balanceData?.value === 0n ||
    transferStatus !== 'Idle'

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex flex-col gap-1 rounded-3xl border-1 border-turtle-foreground bg-white p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
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
      </div>
    </form>
  )
}

export default Transfer
