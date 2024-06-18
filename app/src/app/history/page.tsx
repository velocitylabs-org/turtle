import { TransactionHistory } from '@/components/History/TransactionHistory'

export default function History() {
  return (
    <main className="flex flex-col items-center justify-center p-1 sm:p-5">
      {/* <Background /> */}
      <section>
        <TransactionHistory />
      </section>
    </main>
  )
}
