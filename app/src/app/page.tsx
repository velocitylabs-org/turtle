import AppHome from '@/components/AppHome'
import TurtlesBackground from '@/components/TurtlesBackground'

export default function App() {
  return (
    <main>
      <TurtlesBackground />
      <section className="mt-10 flex justify-center sm:mt-6">
        <AppHome />
      </section>
    </main>
  )
}
