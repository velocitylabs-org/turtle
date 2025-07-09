export default function AnalyticData({
  volume,
  transactions,
}: {
  volume: number
  transactions: number
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tighter sm:text-xl">
        {volume.toLocaleString()} USD
      </h1>
      <h1 className="text-3xl font-bold tracking-tighter sm:text-xl">
        {transactions.toLocaleString()} transactions
      </h1>
    </div>
  )
}
