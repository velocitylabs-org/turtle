import { Network } from '@/models/chain'
import { TxStatus, CompletedTransfer } from '@/models/transfer'

//KEEP IN CASE FOR NOW

export const transactionsMockUp: CompletedTransfer[] = [
  {
    id: 'id',
    status: TxStatus.Failed,
    errors: ['You likely don’t have enough ETH in your receiving wallet.'],
    token: {
      id: '1111',
      name: 'WETH',
      logoURI: 'string',
      symbol: 'string',
      decimals: 18,
    },
    sourceChain: {
      uid: 'string',
      name: 'Ethereum',
      logoURI: 'string',
      chainId: 1111,
      network: Network.Ethereum,
    },
    amount: '345098.1234573',
    // amountValue: 25607440,
    destChain: {
      uid: 'string',
      name: 'Polkadot',
      logoURI: 'string',
      chainId: 1111,
      network: Network.Polkadot,
    },
    feeToken: {
      id: '1111',
      name: 'DOT',
      logoURI: 'string',
      symbol: 'string',
      decimals: 18,
    },

    feeAmount: '1000000000.1837439058',
    // feesValue: 1000000000.1837439058,

    minTokenRecieved: '1000000000.1837439058',
    // minTokenRecievedValue: 1000000000.1837439058,
    sender: '0x79e9d02DbE43Fb49fDa9d03C9eA1eB601d2692C3',
    recipient: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    date: '2024-06-18T08:47:02.016Z',
  },
  {
    id: 'id',
    status: TxStatus.Completed,
    sourceChain: {
      uid: 'string',
      name: 'Ethereum',
      logoURI: 'string',
      chainId: 1111,
      network: Network.Ethereum,
    },
    token: {
      id: '1111',
      name: 'WETH',
      logoURI: 'string',
      symbol: 'string',
      decimals: 18,
    },
    amount: '543.657373',
    // amountValue: 25607440,
    destChain: {
      uid: 'string',
      name: 'Polkadot',
      logoURI: 'string',
      chainId: 1111,
      network: Network.Polkadot,
    },

    feeToken: {
      id: '1111',
      name: 'DOT',
      logoURI: 'string',
      symbol: 'string',
      decimals: 18,
    },

    feeAmount: '1000000000.1837439058',
    // feesValue: 1000000000.1837439058,
    minTokenRecieved: '1000000000.1837439058',
    // minTokenRecievedValue: 1000000000.1837439058,
    sender: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    recipient: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    date: '2024-06-18T08:20:02.016Z',
  },
]
