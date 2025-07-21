'use client'

import { TurtlesBackground } from '@/components/TurtlesBackground'
import TurtleWidget from '@velocitylabs-org/turtle-widget'
import Image from 'next/image'

const features = [
  {
    title: 'Seamless Interactions',
    listItems: [
      'Bridging, XCM transfers, swaps — all from within your own product UI and focused on your use case',
      'Upcoming: fiat-to-crypto onramps, 1-click bridge & swaps, 1-click swaps within Polkadot, and more.',
    ],
  },
  {
    title: 'Customizable & Configurable',
    listItems: [
      'Match your brand with themes, layouts, and styling options.',
      'Define default tokens, chains, and flows to align with your use case.',
    ],
  },
  {
    title: 'Easy Integration',
    listItems: ['Drop-in React component', 'Minimal config'],
  },
  {
    title: 'Wide Ecosystem Support',
    listItems: ['Support across all major Polkadot parachains & Ethereum through Snowbridge'],
  },
  {
    title: 'Data Dashboard',
    listItems: [
      'Track all the relevant data in real time for your widget (i.e. volumes, # of transfers, tokens, origin/destination chains and more)',
    ],
  },
]

export default function Widget() {
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
      <section className="mb-48 flex min-h-[100vh] flex-col items-center gap-24 bg-white">
        <div className="mt-24 flex flex-col gap-8 lg:w-[865px]">
          <h3 className="text-section-title font-bold leading-none">🐢 What is the Turtle app?</h3>
          <p>
            The Turtle app is a seamless cross-chain token transfer solution designed to simplify
            and streamline the movement of digital assets across different blockchain networks. By
            abstracting away the technical complexities typically involved in bridging tokens,
            Turtle provides users with a frictionless experience, eliminating the need for manual
            routing, multiple wallet approvals, or switching between interfaces.
          </p>
          <Image src="/networks.jpg" alt="Turtle app" width={865} height={400} />
          <div className="border-gray border-b" />
        </div>
        <div className="flex flex-col gap-4 lg:w-[865px]">
          <h3 className="text-section-title font-bold leading-none">🧰 Features</h3>
          <ul className="flex flex-col gap-4">
            {features.map((feature) => (
              <li className="flex flex-col gap-2" key={feature.title}>
                <h4 className="text-xl font-bold">{feature.title}</h4>
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
        </div>
      </section>
    </>
  )
}
