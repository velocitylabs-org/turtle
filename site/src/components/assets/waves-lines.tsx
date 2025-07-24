import type { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

export type WaveLinesName = keyof typeof Waves

export type WaveLinesProps = {
  name: WaveLinesName
  withStroke?: boolean
} & SvgProps

const Waves = {
  heroBackgroundWave: ({ withStroke, ...props }: SvgProps & { withStroke: boolean }) => (
    <svg viewBox="0 0 1440 210" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M716.864 100.609C397.859 100.609 268.824 209.459 0 209.459V0.651611H1440V198.375C1104.87 198.375 1035.87 100.609 716.864 100.609Z"
        fill="#A184DC"
      />
      <path
        d="M0 209.459C268.824 209.459 397.859 100.609 716.864 100.609C1035.87 100.609 1104.87 198.375 1440 198.375"
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
        d="M716.864 0.569458C397.859 0.569458 268.824 205.025 0 205.025V500.656H1440V146.656C1104.87 146.656 1035.87 0.569458 716.864 0.569458Z"
        fill="#A184DC"
      />
      <path
        d="M0 205.025C268.824 205.025 397.859 0.569473 716.864 0.569473C1035.87 0.569473 1104.87 146.656 1440 146.656"
        {...(withStroke && { stroke: '#001B04' })}
      />
    </svg>
  ),
}

export const WaveLine = ({ name, withStroke = false, ...props }: WaveLinesProps) => {
  const Wave = Waves[name]
  return <Wave withStroke={withStroke} {...props} />
}
