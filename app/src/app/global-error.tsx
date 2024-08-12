'use client'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/NavBar'

interface GlobalErrorProps {
  error: Error & { digest?: string }
}

const GlobalError: React.FC<GlobalErrorProps> = ({ error }) => {
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
            <h1 className="text-xl font-bold leading-5"> {/* Should be: 500 */}404</h1>
            <h2 className="text-4xl font-medium leading-[56px] tracking-tighter sm:text-[56px]">
              {/* Should be: Oops, Turtle is temporary unavailable or eventually Oops, something went wrong.*/}{' '}
              Oops, this page is missing.
            </h2>
            <div className="flex flex-col justify-center gap-6 text-xl leading-5">
              {/* Should not be there: */}
              <p>Maybe you clicked on an old link!</p>
              <Link href="/" className="underline">
                {/* Should not be: try again later*/} Back home
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}

export default GlobalError
