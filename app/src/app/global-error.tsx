'use client'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/NavBar'

const imageStyles = { objectFit: 'cover' as const }

interface ErrorProps {
  error: Error & { digest?: string }
}

export default function GlobalError({ error }: ErrorProps) {
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
          style={imageStyles}
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
            <h1 className="text-xl font-bold leading-5">500</h1>
            <h2 className="xl-letter-spacing text-4xl leading-[56px] sm:text-[56px]">
              Turtle is temporary unavailable.
            </h2>
            <div className="text-xl leading-5 underline">Try again later</div>
          </div>
        </section>
      </body>
    </html>
  )
}
