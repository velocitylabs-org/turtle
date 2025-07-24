import getAnalyticsData from '@/actions/analytics'
import Features from '@/components/features'
import TurtlesBackground from '@/components/TurtlesBackground'

export default async function Home() {
  const analyticsData = await getAnalyticsData()

  return (
    <>
      <section className="relative z-20 flex h-[78vh] flex-col items-center justify-center">
        <TurtlesBackground header="Frictionless cross-chain transfers" initialVolume={analyticsData?.totalVolumeUsd} />
      </section>

      {/* Features section */}
      <section className="features relative z-40 mt-[-20px] bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
        <Features />
      </section>
    </>
  )
}
