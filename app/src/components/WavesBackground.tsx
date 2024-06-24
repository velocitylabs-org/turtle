import { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

export type WaveLinesName = keyof typeof Waves

export type WaveLinesProps = {
  name: WaveLinesName
  withStroke?: boolean
} & SvgProps

const Waves = {
  heroBackgroundWave: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1440 531" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M-0.5 529.218V529.718H0C128.729 529.718 225.425 504.769 326.196 478.769C330.701 477.606 335.214 476.442 339.739 475.277C445.465 448.068 557.426 420.868 716.864 420.868C874.338 420.868 970.857 444.699 1068.6 468.833L1072.26 469.737C1171.29 494.182 1272.37 518.635 1440 518.635H1440.5V518.135V68.881V68.381H1440C1272.28 68.381 1171.14 131.334 1072.12 194.224L1068.47 196.538C970.713 258.637 874.253 319.911 716.864 319.911C557.544 319.911 445.654 240.287 339.915 160.559C335.381 157.14 330.858 153.721 326.343 150.308C225.605 74.1567 128.837 1.00586 0 1.00586H-0.5V1.50586V529.218Z"
        fill="#A184DC"
        {...(withStroke && { stroke: '#001B04' })}
      />
    </svg>
  ),
  heroWaves: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1441 626" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0.226562 625C269.05 625 398.086 433.15 717.09 433.15C1036.09 433.15 1105.09 605.917 1440.23 605.917M0.226562 1.28778C269.05 1.28778 398.086 320.193 717.09 320.193C1036.09 320.193 1105.09 68.6629 1440.23 68.6629M0.226562 176.253C269.05 176.253 398.086 346.871 717.09 346.871C1036.09 346.871 1105.09 182.653 1440.23 182.653M0.226562 510.189C269.05 510.189 398.086 414.593 717.09 414.593C1036.09 414.593 1105.09 517.464 1440.23 517.464M0.226562 142.46C269.05 142.46 398.086 333.532 717.09 333.532C1036.09 333.532 1105.09 132.456 1440.23 132.456M0.226562 200.916C269.05 200.916 398.086 369.445 717.09 369.445C1036.09 369.445 1105.09 222.776 1440.23 222.776M0.226562 248.916C269.05 248.916 398.086 380.732 717.09 380.732C1036.09 380.732 1105.09 280.413 1440.23 280.413M0.226562 282.228C269.05 282.228 398.086 398.176 717.09 398.176C1036.09 398.176 1105.09 340.832 1440.23 340.832"
        stroke="#001B04"
      />
    </svg>
  ),
  animationEllipse: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1441 500" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        id="wavePath"
        d="M0.11084 435.507C1005.23 479.807 934.85 35.8856 1440.11 2.78192"
        stroke="white"
        strokeWidth="5"
        strokeDasharray="0 10"
        strokeLinecap="round"
      />

      <circle
        id="greenBall"
        cx="0"
        cy="0"
        r="15"
        transform="rotate(2.52362 13.46 13.2987)"
        fill="#00FF29"
        stroke="#001B04"
      />

      <animateMotion xlinkHref="#greenBall" dur={props.dur} repeatCount={props.repeatCount}>
        <mpath xlinkHref="#wavePath" />
      </animateMotion>
    </svg>
  ),
  footerWave: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1440 501" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M-0.5 205.455V204.955H0C128.547 204.955 225.095 158.165 325.885 109.32C330.379 107.142 334.882 104.96 339.397 102.778C445.145 51.6583 557.242 0.500031 716.864 0.500031C874.489 0.500031 971.123 36.1519 1068.89 72.2214L1072.56 73.5742C1171.56 110.09 1272.52 146.587 1440 146.587H1440.5V147.087V501.087V501.587H1440H0H-0.5V501.087V205.455Z"
        fill="#A184DC"
        {...(withStroke && { stroke: '#001B04' })}
      />
    </svg>
  ),
  blueBackground: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1440 502" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M-0.5 206.369V205.869H0C128.547 205.869 225.095 159.079 325.885 110.234C330.379 108.056 334.882 105.873 339.397 103.691C445.145 52.5717 557.242 1.41348 716.864 1.41348C874.489 1.41348 971.123 37.0653 1068.89 73.1348L1072.56 74.4876C1171.56 111.003 1272.52 147.5 1440 147.5H1440.5V148V502V502.5H1440H0H-0.5V502V206.369Z"
        fill="#BFDADC"
        stroke="#001B04"
      />
    </svg>
  ),
}

export const WaveLine = ({ name, withStroke = false, ...props }: WaveLinesProps) => {
  const Wave = Waves[name]
  return <Wave withStroke={withStroke} {...props} />
}

export const Background = () => (
  <div className="absolute inset-0 z-0">
    {/* wave lines svg */}
    <WaveLine name="heroWaves" className="absolute left-0 top-0 h-auto w-full" withStroke={true} />
    {/* waves svg */}
    <WaveLine
      name="blueBackground"
      className="absolute bottom-0 left-0 right-0 -z-10 h-auto w-full"
    />
    {/* animated ellipse svg */}
    <WaveLine
      name="animationEllipse"
      dur={3}
      className="top-1/8 absolute left-0 h-auto w-full"
      repeatCount={'indefinite'}
    />
  </div>
)
