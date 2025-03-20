'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { captureException } from '@sentry/nextjs'

const imageStyles = { objectFit: 'cover' as const }

const Error = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div className="w-full">
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
      <div className="turtle-dark-overlay absolute h-full w-full" />

      {/* Content */}
      <section className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center gap-8 text-white">
          <h1 className="text-xl font-bold leading-5">500</h1>
          <h2 className="xl-letter-spacing text-4xl leading-[56px] sm:text-[56px]">
            Oops, something went wrong.
          </h2>
          <div className="flex flex-col justify-center gap-6 text-xl leading-5">
            <Link href="/" className="underline">
              Try again
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Error
