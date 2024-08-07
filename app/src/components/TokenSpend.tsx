import { ContractTransactionResponse } from 'ethers'
import Image from 'next/image'
import { FC } from 'react'

interface Props {
  onClick: () => Promise<ContractTransactionResponse>
}

const TokenSpend: FC<Props> = ({ onClick }) => {
  return (
    <div className="mt-8 rounded-[20px] bg-turtle-secondary-light px-3 py-5">
      <div className="justify-items flex flex-row items-start">
        <Image src={'/wallet.svg'} alt={'Wallet illustration'} width={64} height={64} />
        <div className="justify-left ml-3 flex flex-col">
          <div className="text-left text-small font-bold text-turtle-foreground">
            Approve ERC-20 token spend
          </div>
          <div className="pb-2 text-left text-small text-turtle-foreground">
            We first need your approval to transfer this token from your wallet.
            <button
              className="ml-1 text-left text-small text-turtle-foreground underline"
              onClick={onClick}
            >
              Sign now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSpend
