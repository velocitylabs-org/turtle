import TurtlesBackground from '@/components/TurtlesBackground'
import { Body, Button, cn } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
import { headerButtons } from '@/components/widget/data'
import { XXXLarge, Large } from '@velocitylabs-org/turtle-ui'
import { developerIntegrationGuide, features } from '@/components/widget/data'
import CodeBit from '@/components/widget/CodeBit'
import Networks from '@/components/widget/Networks'

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
    <div className={cn('flex flex-col gap-8 px-6 lg:w-[640px]', className)}>
      <h3 className="text-section-title font-bold leading-none">{heading}</h3>
      {children}
    </div>
  )
}

const Divider = () => {
  return <div className="border-gray border-b" />
}

export default async function Widget() {
  return (
    <>
      <section className="relative flex min-h-[110vh] flex-col items-center justify-center">
        <TurtlesBackground blurredBackground whiteWaves initialVolume={undefined} />
        <div className="absolute top-20 z-0 flex flex-col gap-14">
          <div className="rounded-4xl border border-black bg-white lg:w-[656px]">
            <div className="flex max-w-[375px] flex-col gap-20 p-8">
              <XXXLarge className="leading-none">Turtle Widget</XXXLarge>
              <div className="flex flex-col gap-10">
                <h2 className="text-section-title">The whole polkadot in your dApp</h2>
                <p className="text-lg">
                  Effortless Integration · Unified In-App Experience · Customizable to Your Brand
                </p>
                <div className="flex flex-wrap gap-2">
                  {headerButtons.map((button) => (
                    <Button variant="outline" size="sm" key={button.label}>
                      <Image src={button.icon} alt={button.label} width={24} height={24} />
                      <p className="text-sm">{button.label}</p>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {/* <TurtleWidget /> */}
          </div>
          <div className="z-10 flex flex-col items-center justify-center">
            <p className="text-lg text-white">Start Integrating</p>
          </div>
        </div>
      </section>
      <section className="flex min-h-[100vh] flex-col items-center gap-20 bg-white pb-48 lg:pb-96">
        <SectionInnerContainer className="mt-24" heading="🐢 What is the Turtle app?">
          <Body>
            The Turtle app is a seamless cross-chain token transfer solution designed to simplify
            and streamline the movement of digital assets across different blockchain networks. By
            abstracting away the technical complexities typically involved in bridging tokens,
            Turtle provides users with a frictionless experience, eliminating the need for manual
            routing, multiple wallet approvals, or switching between interfaces.
          </Body>
          <Image src="/networks.jpg" alt="Turtle app" width={865} height={400} />
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer className="flex flex-col gap-8" heading="🧰 Features">
          <ul className="flex flex-col gap-8">
            {features.map((feature) => (
              <li className="flex flex-col gap-2" key={feature.title}>
                <Large>{feature.title}</Large>
                <ul className="ml-6 list-disc">
                  {feature.listItems.map((item) => (
                    <li key={item}>
                      <Body>{item}</Body>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="💻  Developer Integration Guide" className="max-w-full">
          <ol className="flex list-decimal flex-col gap-8 md:ml-6">
            {developerIntegrationGuide.map((guide) => (
              <CodeBit key={guide.title} guide={guide} />
            ))}
          </ol>
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="🌐 Compatible Networks & Tokens">
          <Body>An ever expanding network</Body>
          <Networks />
          <Divider />
        </SectionInnerContainer>
        <SectionInnerContainer heading="🙋 Questions or Feedback?">
          <Body>Need help integrating or have questions?</Body>
          <div className="flex flex-wrap gap-4">
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
