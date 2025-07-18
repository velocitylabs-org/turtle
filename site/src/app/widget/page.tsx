import { TurtlesBackground } from '@/components/TurtlesBackground'

export default function Widget() {
  return (
    <>
      <section className="relative z-20 flex h-[100vh] flex-col items-center justify-center">
        <TurtlesBackground blurredBackground />
      </section>
      <section className="relative z-20 flex min-h-[100vh] flex-col items-center justify-center bg-white"></section>
    </>
  )
}
