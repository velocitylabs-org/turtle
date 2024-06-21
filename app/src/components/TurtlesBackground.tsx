import Image from 'next/image'

interface TurtlesBackgroundProps {
  /** Background to display. */
  src: string
  /** The image alternative text. */
  alt: string
}

export const TurtlesBackground: React.FC<TurtlesBackgroundProps> = ({ src, alt }) => {
  return (
    <div className="absolute top-0 z-0">
      <div className="relative h-screen w-screen overflow-hidden">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
    </div>
  )
}
