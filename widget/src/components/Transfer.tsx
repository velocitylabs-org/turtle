import { Controller } from 'react-hook-form'
import ChainSelect from './ChainSelect'
import WalletButton from './WalletButton'
import { FC } from 'react'
import useTransferForm from '@/hooks/useTransferForm'
import { getAllowedSourceChains } from '@/utils/routes'
import { reorderOptionsBySelectedItem } from '@/utils/sort'

const Transfer: FC = () => {
  const {
    control,
    environment,
    sourceChain,
    handleSourceChainChange,
    sourceWallet,
    transferStatus,
    handleSubmit,
  } = useTransferForm()
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
      </div>
    </form>
  )
}

export default Transfer
