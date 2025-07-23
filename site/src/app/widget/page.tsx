'use client'

import { TurtlesBackground } from '@/components/TurtlesBackground'
import { Button, cn } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
// @ts-ignore
import hljs from '@highlightjs/cdn-assets/es/core.min.js'
// @ts-ignore
import bash from '@highlightjs/cdn-assets/es/languages/bash.min.js'
// @ts-ignore
import typescript from '@highlightjs/cdn-assets/es/languages/typescript.min.js'
import '@highlightjs/cdn-assets/styles/github.min.css'
import { useEffect } from 'react'
import { developerIntegrationGuide, features } from '@/components/widget/data'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('typescript', typescript)

const SectionInnerContainer = ({
  children,
  className,
  heading,
}: {
  children: React.ReactNode
  className?: string
  heading: string
}) => {
  return (
    <div className={cn('flex flex-col gap-8 lg:w-[865px]', className)}>
      <h3 className="text-section-title font-bold leading-none">{heading}</h3>
      {children}
    </div>
  )
}

const Divider = () => {
  return <div className="border-gray border-b" />
}

export default function Widget() {
  useEffect(() => {
    hljs.highlightAll()
  }, [])

  return (
    <>
      <section className="relative flex h-[100vh] flex-col items-center justify-center">
        <TurtlesBackground blurredBackground whiteWaves />
        <div className="top-50 absolute z-0 max-w-[656px]">
          <div className="rounded-4xl border border-black bg-white p-8">
            <h1 className="text-hero-xl font-bold leading-none">Turtle Widget</h1>
            <h2 className="text-h-sub font-bold">1 min setup.</h2>
            <h3 className="text-section-title">The whole polkadot in your dApp</h3>
          </div>
          {/* <TurtleWidget /> */}
        </div>
      </section>
      <section className="flex min-h-[100vh] flex-col items-center gap-20 bg-white pb-48 lg:pb-96">
        <SectionInnerContainer className="mt-24" heading="🐢 What is the Turtle app?">
          <p>
            The Turtle app is a seamless cross-chain token transfer solution designed to simplify
            and streamline the movement of digital assets across different blockchain networks. By
            abstracting away the technical complexities typically involved in bridging tokens,
            Turtle provides users with a frictionless experience, eliminating the need for manual
            routing, multiple wallet approvals, or switching between interfaces.
          </p>
          <Image src="/networks.jpg" alt="Turtle app" width={865} height={400} />
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer className="flex flex-col gap-8" heading="🧰 Features">
          <ul className="flex flex-col gap-8">
            {features.map((feature) => (
              <li className="flex flex-col gap-2" key={feature.title}>
                <h4 className="text-xl font-bold leading-none">{feature.title}</h4>
                <ul className="ml-6 list-disc">
                  {feature.listItems.map((item) => (
                    <li key={item}>
                      <p className="text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="💻  Developer Integration Guide">
          <ol className="ml-6 flex list-decimal flex-col gap-8">
            {developerIntegrationGuide.map((guide) => (
              <li className="flex flex-col gap-4 rounded-3xl text-xl font-bold" key={guide.title}>
                <p>{guide.title}</p>
                <pre className="theme-github turtle-foreground rounded-3xl border border-turtle-foreground pb-4 pt-4">
                  <code className={`language-${guide.language} font-mono text-sm`}>
                    {guide.code}
                  </code>
                </pre>
              </li>
            ))}
          </ol>
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="🌐 Compatible Networks & Tokens">
          <p>An Ever-Expanding Network</p>
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="🙋 Questions or Feedback?">
          <p>Need help integrating or have questions?</p>
          <div className="flex gap-4">
            <Button
              size="lg"
              as="a"
              href="https://www.npmjs.com/package/@velocitylabs-org/turtle-widget"
              target="_blank"
            >
              📖 Read the docs
            </Button>
            <Button size="lg" as="a" href="mailto:support@velocitylabs.org">
              💬 Talk to our team
            </Button>
          </div>
        </SectionInnerContainer>
      </section>
    </>
  )
}
