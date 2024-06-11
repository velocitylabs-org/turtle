import { cn } from '@/utils/cn'
import Image, { StaticImageData } from 'next/image'

export type Feature = {
  title: string
  description: string
  icon: StaticImageData
  tags?: { name: string }[]
}

export type TurtleFeatures = Feature[]

export const FeatureCard = ({
  feature,
  featuresListlength,
  index,
}: {
  feature: Feature
  featuresListlength: number
  index: number
}) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-4 rounded-[40px] border border-black bg-white p-6 shadow-md sm:space-y-8 sm:rounded-[50px] sm:p-10',
        {
          'md:col-span-2 xl:col-span-1':
            index === featuresListlength - 1 && featuresListlength % 2 !== 0 && index > 1,
        },
      )}
    >
      <Image
        src={feature.icon}
        alt="Velocity Labs, Bridge token form any chain"
        height={126}
        width={126}
      />
      <h3 className="text-2xl font-semibold sm:text-4xl xl:text-6xl">{feature.title}</h3>
      <p className="text-gray-600 sm:w-5/6">{feature.description}</p>
      {feature.tags && (
        <div className="flex space-x-1 sm:space-x-2">
          {feature.tags.map((f, idx) => (
            <div key={idx} className="rounded-xl border p-2">
              {f.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
