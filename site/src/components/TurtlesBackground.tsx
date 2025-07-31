import { cn } from '@velocitylabs-org/turtle-ui'

interface TurtlesBackgroundProps {
  header?: string
  blurredBackground?: boolean
  whiteWaves?: boolean
  children?: React.ReactNode
}

const TurtlesBackground = ({
  header,
  blurredBackground = false,
  whiteWaves = false,
  children,
}: TurtlesBackgroundProps) => {
  const fill = whiteWaves ? '255,255,255' : '191,218,220'

  return (
    <>
      <div
        className={cn(
          'turtle-background relative flex min-h-[120vh] w-screen flex-col items-center justify-center overflow-hidden bg-cover bg-bottom',
          blurredBackground && 'turtle-background-blurred',
        )}
      >
        <div
          className={cn(
            'turtle-dark-overlay flex w-screen flex-1 flex-col items-center justify-center',
            children && 'pb-30',
          )}
        >
          <div className="m-[4vw] items-center">
            {header && (
              <h1 className="turtle-text-shadow m-0 text-center text-[11vw] leading-[100%] text-white sm:text-[9vw] 3xl:text-[10rem]">
                {header}
              </h1>
            )}
            {children}
          </div>
        </div>
      </div>

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
            <use xlinkHref="#gentle-wave" x="48" y="0" fill={`rgba(${fill},0.85)`} />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill={`rgba(${fill},0.65)`} />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill={`rgba(${fill},0.45)`} />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill={`rgb(${fill})`} />
          </g>
        </svg>
      </div>
    </>
  )
}

export default TurtlesBackground
