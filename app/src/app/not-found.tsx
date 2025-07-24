import Image from 'next/image'
import Link from 'next/link'

const imageStyles = { objectFit: 'cover' as const }

const NotFound = () => {
  return (
    <div className="w-full">
      {/* background */}
      <Image
        src="/turtle-background.webp"
        alt="Turtle Background for not found 404 page"
        className="relative z-0"
        fill
        style={imageStyles}
        sizes="100vw"
        priority
      />
      {/* background overlay*/}
      <div className="turtle-dark-overlay absolute h-full w-full" />

      {/* Content */}
      <section className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center gap-8 text-white">
          <h1 className="text-xl font-bold leading-5">404</h1>
          <h2 className="xl-letter-spacing text-4xl leading-[56px] sm:text-[56px]">Oops, this page is missing.</h2>
          <div className="flex flex-col justify-center gap-6 text-xl leading-5">
            <p>Maybe you clicked on an old link!</p>
            <Link href="/" className="underline">
              Back home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
