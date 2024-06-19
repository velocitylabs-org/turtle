import { TransactionHistory } from '@/components/History/TransactionHistory'
import { Transaction } from '@/models/history'

export default function History() {
  const transactions: Transaction[] = [
    {
      status: 'failed',
      amount: 345098.1234573,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-18T08:47:02.016Z',
    },
    {
      status: 'completed',
      amount: 543.657373,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-18T08:20:02.016Z',
    },
    {
      status: 'completed',
      amount: 12.463278,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-13T15:65:02.016Z',
    },
    {
      status: 'failed',
      amount: 10998.09876,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-12T02:12:02.016Z',
    },
    {
      status: 'failed',
      amount: 345098.1234573,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-05-31T08:47:02.016Z',
    },
    {
      status: 'completed',
      amount: 543.657373,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-05-18T08:20:02.016Z',
    },
    {
      status: 'completed',
      amount: 12.463278,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-04-12T15:65:02.016Z',
    },
    {
      status: 'failed',
      amount: 10998.09876,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-04-12T02:12:02.016Z',
    },
  ]
  return (
    <main className="flex flex-col items-center justify-center p-5">
      {/* <Background /> */}
      <section>
        <TransactionHistory transactions={transactions} />
      </section>
    </main>
  )
}
