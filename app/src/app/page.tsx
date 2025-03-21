import { HomeComponentSelect } from '@/components/HomeComponentSelect'
import { TurtlesBackground } from '@/components/TurtlesBackground'

const App = () => {
  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center gap-8 sm:mt-6 sm:p-5">
        <HomeComponentSelect />
      </section>
    </main>
  )
}

export default App
