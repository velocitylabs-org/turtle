import { FeatureCard, TurtleFeatures } from './card'
import { TokenExchange } from './tokens'
import chains from '../../public/chains.png'
import turtle from '../../public/turtle.png'
import locker from '../../public/locker.png'
import record from '../../public/record.png'
import chart from '../../public/chart.png'

export const Features = () => {
  const mainFeatures = [
    {
      title: 'Shell-hard security',
      description:
        'Transfer tokens using Chainlink CCIP—the industry standard cross-chain protocol.',
      icon: turtle,
    },
    {
      title: 'Real-time tracking',
      description:
        'Track your assets every step of the way for extra transparency and peace of mind.',
      icon: chart,
    },
    {
      title: 'Seamless experience',
      description: 'Transact with ease with an intuitive UI.',
      icon: record,
    },
  ] satisfies TurtleFeatures

  const secondaryFeatures = [
    {
      title: 'Security comes standard.',
      description:
        'Bridge hacks are responsible for nearly 50% of all value hacked in the blockchain industry. Not on Turtle.',
      icon: locker,
    },
    {
      title: 'Multi-chain.',
      description: 'Transact across most popular networks.',
      icon: chains,
      tags: [{ name: 'Ethereum' }, { name: 'Optimism' }, { name: 'Polygon' }],
    },
  ] satisfies TurtleFeatures

  return (
   <div className="relative z-30 -mt-28 sm:-mt-36 md:-mt-40 lg:px-10">
      {/* 1st grid features */}
      <div>
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
      {/* token transfer component */}
      <div className="absolute inset-x-0 -top-9 -z-10 mx-auto sm:-top-[70px] ">
        <TokenExchange />
      </div>
    </div>
  )
}
