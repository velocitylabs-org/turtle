import AppHome from '@/components/AppHome'
import TurtlesBackground from '@/components/TurtlesBackground'

export default function App() {
  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center gap-8 sm:mt-6 sm:p-5">
        <AppHome />
      </section>
    </main>
  )
}
