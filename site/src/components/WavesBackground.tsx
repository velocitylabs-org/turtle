import { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

export type WaveLinesName = keyof typeof Waves

export type WaveLinesProps = {
  name: WaveLinesName
  withStroke?: boolean
} & SvgProps

const Waves = {
  blueBackground: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1440 502" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        id="bgPath"
        d="M-0.5 206.369V205.869H0C128.547 205.869 225.095 159.079 325.885 110.234C330.379 108.056 334.882 105.873 339.397 103.691C445.145 52.5717 557.242 1.41348 716.864 1.41348C874.489 1.41348 971.123 37.0653 1068.89 73.1348L1072.56 74.4876C1171.56 111.003 1272.52 147.5 1440 147.5H1440.5V148V502V502.5H1440H0H-0.5V502V206.369Z"
        fill="#BFDADC"
        {...(withStroke && { stroke: '#001B04' })}
        // stroke="white"
        // strokeWidth="5"
        // strokeDasharray="0 10"
        // strokeLinecap="round"
      />
      {/* <circle
        id="greenBall"
        cx="0"
        cy="0"
        r="15"
        transform="rotate(2.52362 13.46 13.2987)"
        fill="#00FF29"
        stroke="#001B04"
      /> */}

      {/* <animateMotion xlinkHref="#greenBall" dur={props.dur} repeatCount={props.repeatCount}>
        <mpath xlinkHref="#bgPath" />
      </animateMotion> */}
    </svg>
  ),
}

export const WaveLine = ({ name, withStroke = false, ...props }: WaveLinesProps) => {
  const Wave = Waves[name]
  return <Wave withStroke={withStroke} {...props} />
}
