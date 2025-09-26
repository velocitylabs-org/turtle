import AppHome from '@/components/AppHome'
import SentryFeedback from '@/components/SentryFeedback'
import TurtlesBackground from '@/components/TurtlesBackground'

export default function App() {
  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center gap-8 sm:mt-6 sm:p-9">
        <AppHome />
      </section>
      <SentryFeedback />
    </main>
  )
}
