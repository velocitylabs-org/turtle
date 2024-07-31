import Image from 'next/image'

export const TurtlesBackground: React.FC = () => {
  return (
    <div className="absolute top-0 z-0 h-[80vh] w-full">
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <Image
          src="/turtle-background.webp"
          alt="Turtle Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          sizes="100vw"
          priority
        />
        <div className="turtle-dark-overlay flex h-full w-full flex-col items-center justify-center"></div>
      </div>
      <div>
        <div className="waves-container">
          <svg
            className="waves"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(191,218,220,0.7)" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(191,218,220,0.5)" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(191,218,220,0.3)" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#BFDADC" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
