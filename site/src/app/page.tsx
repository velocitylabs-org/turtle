import Features from '@/components/features'
import TurtlesBackground from '@/components/TurtlesBackground'
import AnalyticData from '@/components/AnalyticData'
import getAnalyticsData from '@/utils/get-analytics-data'

export default async function Home() {
  const analyticsData = await getAnalyticsData()

  return (
    <>
      <section className="relative z-20 flex h-[75vh] flex-col items-center justify-center">
        <TurtlesBackground header="Frictionless cross-chain transfers" />
      </section>

      {/* Features section */}
      <section className="features relative z-40 mt-[-20px] bg-info pt-20">
        <Features />
      </section>

      {/* Analytics section */}
      {analyticsData && (
        <section className="relative z-50 mt-[-20px] flex flex-row items-center justify-center gap-8 bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
          <AnalyticData
            volume={analyticsData.totalVolumeUsd}
            transactions={analyticsData.totalTransactions}
          />
        </section>
      )}
    </>
  )
}
