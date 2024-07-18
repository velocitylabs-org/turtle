import { X } from './twitter'

export enum SocialIcon {
  X = 'x',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
}

export type TurtleSocialIcons = {
  alt: string
  url: string
  name: SocialIcon
  icon: JSX.Element
}[]

export const TurtleSocialData: TurtleSocialIcons = [
  {
    alt: 'Velocity Labs twitter',
    url: 'https://twitter.com/v_labs',
    name: SocialIcon.X,
    icon: <X />,
  },
]

export const TurtleSocialIcons = () => {
  return TurtleSocialData.map((icon, idx) => (
    <a key={idx} href={icon.url} target="_blank" rel="noopener noreferrer" aria-label={icon.alt}>
      <div className="h-5 w-5">{icon.icon}</div>
    </a>
  ))
}
