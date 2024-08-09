'use client'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/NavBar'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError: React.FC<GlobalErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html>
      <body className="w-full">
        {/* background */}
        <Image
          src="/turtle-background.webp"
          alt="Turtle Background"
          className="relative z-0"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
          sizes="100vw"
          priority
        />
        {/* background overlay*/}
        <div className="turtle-dark-overlay absolute h-full w-full"></div>

        {/* Header */}
        <div className="absolute inset-x-0 top-0">
          <Navbar />
        </div>

        {/* Content */}
        <section className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center gap-8 text-white">
            <h1 className="text-xl font-bold leading-5">404</h1>
            <h2 className="text-4xl font-medium leading-[56px] tracking-tighter sm:text-[56px]">
              Oops, this page is missing.
            </h2>
            <div className="flex flex-col justify-center gap-6 text-xl leading-5">
              <p>Maybe you clicked on an old link!</p>
              <button onClick={() => reset()} className="underline">
                Back home
              </button>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}

export default GlobalError
