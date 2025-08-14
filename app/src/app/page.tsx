import AppHome from '@/components/AppHome'
import TurtlesBackground from '@/components/TurtlesBackground'

export default function App() {
  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center sm:mt-6 p-5">
        <AppHome />
      </section>
    </main>
  )
}
