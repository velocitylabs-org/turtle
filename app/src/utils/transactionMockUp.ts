import { Status, Transaction } from '@/models/completedTransactions'

export const transactionsMockUp: Transaction[] = [
  {
    status: Status.Failed,
    errors: ['You likely don’t have enough ETH in your receiving wallet.'],
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 345098.1234573,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x79e9d02DbE43Fb49fDa9d03C9eA1eB601d2692C3',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-06-18T08:47:02.016Z',
  },
  {
    status: Status.Completed,
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 543.657373,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-06-18T08:20:02.016Z',
  },
  {
    status: Status.Completed,
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 12.463278,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000.1837439058,
    toChainAmountValue: 10000.1837439058,
    fees: 100.1837439058,
    feesValue: 10.1837439058,
    minTokenRecieved: 100.1837439058,
    minTokenRecievedValue: 100.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-06-13T15:35:02.016Z',
  },
  {
    status: Status.Failed,
    errors: ['You likely don’t have enough ETH in your receiving wallet.'],
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 10998.09876,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-06-12T02:12:02.016Z',
  },
  {
    status: Status.Failed,
    errors: ['You likely don’t have enough ETH in your receiving wallet.'],
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 345098.1234573,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-05-31T08:47:02.016Z',
  },
  {
    status: Status.Completed,
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 543.657373,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-05-18T08:20:02.016Z',
  },
  {
    status: Status.Completed,
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 12.463278,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-04-12T15:35:02.016Z',
  },
  {
    status: Status.Failed,
    errors: ['You likely don’t have enough ETH in your receiving wallet.'],
    fromChain: 'Ethereum',
    fromChainToken: 'WETH',
    fromChainAmount: 10998.09876,
    fromChainAmountValue: 25607440,
    toChain: 'Polkadot',
    toChainToken: 'DOT',
    toChainAmount: 1000000000.1837439058,
    toChainAmountValue: 1000000000.1837439058,
    fees: 1000000000.1837439058,
    feesValue: 1000000000.1837439058,
    minTokenRecieved: 1000000000.1837439058,
    minTokenRecievedValue: 1000000000.1837439058,
    fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
    toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
    timestamp: '2024-04-12T02:12:02.016Z',
  },
]