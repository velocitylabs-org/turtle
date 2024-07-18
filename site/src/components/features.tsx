import { FeatureCard, TurtleFeatures } from './card'
import chains from '../../public/chains.png'
import turtle from '../../public/turtle.png'
import locker from '../../public/locker.png'
import record from '../../public/record.png'
import chart from '../../public/chart.png'

export const Features = () => {
  const mainFeatures = [
    {
      title: 'Shell-hard security',
      description: `We don't take security lightly, and neither should you. Turtle is built on solid general message passing (GMP) protocols like Snowbridge and XCMP, which leverage both Ethereum and Polkadot security.`,
      icon: turtle,
    },
    {
      title: 'Transparency all the way',
      description: `Keep an eye on your assets at every step of the way. The days of anxiously waiting for our funds to arrive are finally behind us!`,
      icon: chart,
    },
    {
      title: 'Seamless experience',
      description:
        'Transfer any token anywhere. Turtle is your go-to app for cross-chain transfers.',
      icon: record,
    },
  ] satisfies TurtleFeatures

  const secondaryFeatures = [
    {
      title: 'Decentralized interoperability',
      description:
        'We ensure reliability when it comes to interoperability. Turtle uses fully decentralized protocols for its token transfers.',
      icon: locker,
    },
    {
      title: 'Multi-bridge support (coming soon)',
      description:
        'Turtle will become bridge-agnostic and support additional bridges available on Polkadot. Users just need to specify the token and destination; Turtle will handle the rest',
      icon: chains,
      tags: [{ name: 'Ethereum' }, { name: 'Polkadot' }, { name: 'Snowbridge' }],
    },
  ] satisfies TurtleFeatures

  return (
    <div className="z-40 -mt-28 sm:-mt-36 md:-mt-40 lg:px-10">
      {/* 1st grid features */}
      <div className="mx-auto my-0 max-w-[1600px] items-center justify-center">
        <div className="grid grid-cols-1 gap-10 p-5 md:grid-cols-2 xl:grid-cols-3">
          {mainFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              featuresListlength={mainFeatures.length}
              index={index}
            />
          ))}
        </div>

        {/* 2nd grid features */}
        <div className="grid grid-cols-1 gap-10 p-5 md:grid-cols-2">
          {secondaryFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              featuresListlength={secondaryFeatures.length}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
