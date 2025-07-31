import { Body, Button, cn, LargeHeading, Large } from '@velocitylabs-org/turtle-ui'
import CallToAction from '@/components/widget/CallToAction'
import TurtlesBackground from '@/components/TurtlesBackground'
import WidgetWrapper from '@/components/widget/WidgetWrapper'
import Image from 'next/image'
import { headerButtons, developerIntegrationGuide, features } from '@/components/widget/data'
import CodeBit from '@/components/widget/CodeBit'
import Networks from '@/components/widget/Networks'

const SectionInnerContainer = ({
  children,
  className,
  heading,
  id,
}: {
  children: React.ReactNode
  className?: string
  heading: string
  id?: string
}) => {
  return (
    <div id={id} className={cn('flex flex-col gap-8 px-6 lg:w-[640px]', className)}>
      <h3 className="text-section-title font-bold leading-none">{heading}</h3>
      {children}
    </div>
  )
}

const Divider = () => {
  return <div className="border-gray border-b" />
}

export default function Widget() {
  return (
    <>
      <section className="relative flex flex-col items-center">
        <TurtlesBackground blurredBackground whiteWaves>
          <div className="mt-16 flex flex-col gap-14 p-6 md:mt-0 md:p-0">
            <div className="relative flex flex-col items-center md:translate-x-[7.5%] md:flex-row">
              <div className="flex rounded-4xl border border-black bg-white p-8 pb-24 md:pb-8 lg:w-[656px]">
                <div className="flex flex-col gap-20 lg:max-w-[375px]">
                  <LargeHeading className="leading-none">Turtle Widget</LargeHeading>
                  <div className="flex flex-col gap-10">
                    <h2 className="text-section-title">All of Polkadot on your dApp in minutes</h2>
                    <p className="text-lg">
                      Effortless Integration · Unified In-App Experience · Customizable to Your
                      Brand
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {headerButtons.map((button) => (
                        <Button variant="outline" size="sm" key={button.label} as="span">
                          <Image src={button.icon} alt={button.label} width={24} height={24} />
                          <p className="text-sm">{button.label}</p>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative -mt-16 md:ml-[-15%] md:mt-0">
                <WidgetWrapper />
              </div>
            </div>
            <CallToAction />
          </div>
        </TurtlesBackground>
      </section>
      <section className="flex min-h-[100vh] flex-col items-center gap-20 bg-white pb-48 lg:pb-96">
        <SectionInnerContainer
          id="what-is-turtle-widget"
          className="mt-24"
          heading="🐢 What is the Turtle Widget?"
        >
          <Body>
            Turtle is a seamless cross-chain token-transfer solution that makes moving digital
            assets between networks effortless. It abstracts away the technical complexities of
            cross-chain functionality, giving developers an all-in-one tool so users can transfer
            assets without leaving your dApp—and without the headache of integrating multiple
            interoperability providers.
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
        <SectionInnerContainer heading="💚 Testimonials">
          <Image
            src="/testimonials-1.jpg"
            alt="Turtle widget testimonials 1"
            width={640}
            height={80}
          />
          <Image
            src="/testimonials-2.jpg"
            alt="Turtle widget testimonials 2"
            width={640}
            height={80}
          />
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
            <Button size="lg" as="a" href="https://t.me/c/velocitylabs/137" target="_blank">
              💬 Talk to our team
            </Button>
          </div>
        </SectionInnerContainer>
      </section>
    </>
  )
}
