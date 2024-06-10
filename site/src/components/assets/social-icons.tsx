import { ComponentPropsWithoutRef } from 'react'

type SvgProps = ComponentPropsWithoutRef<'svg'>

export type SocialIconName = keyof typeof Icons

export type SocialIconProps = {
  name: SocialIconName
  size?: number
} & SvgProps

export type TurtleSocialIcons = { alt: string; url: string; name: SocialIconName }[]

const Icons = {
  discord: (props: SvgProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.54 0A2.466 2.466 0 0122 2.472V24l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22H3.46A2.466 2.466 0 011 18.696V2.472A2.466 2.466 0 013.46 0h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524a9.782 9.782 0 00-6.036-1.128l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012a7.898 7.898 0 001.74-.516c.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"></path>
    </svg>
  ),
  x: (props: SvgProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" {...props}>
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  ),
  telegram: (props: SvgProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      fill="currentColor"
      strokeLinejoin="round"
      strokeMiterlimit="1.414"
      clipRule="evenodd"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M18.384 22.779a1.19 1.19 0 001.107.145 1.16 1.16 0 00.724-.84C21.084 18 23.192 7.663 23.983 3.948a.78.78 0 00-.26-.758.8.8 0 00-.797-.14C18.733 4.602 5.82 9.447.542 11.4a.827.827 0 00-.542.799c.012.354.25.661.593.764 2.367.708 5.474 1.693 5.474 1.693s1.452 4.385 2.209 6.615c.095.28.314.5.603.576a.866.866 0 00.811-.207l3.096-2.923s3.572 2.619 5.598 4.062zm-11.01-8.677l1.679 5.538.373-3.507 10.185-9.186a.277.277 0 00.033-.377.284.284 0 00-.376-.064L7.374 14.102z"></path>
    </svg>
  ),
}

export const SocialIcon = ({ name, size, ...props }: SocialIconProps) => {
  const Icon = Icons[name]
  return <Icon height={size} width={size} {...props} />
}

export const TurtleSocialData: TurtleSocialIcons = [
  {
    alt: 'Velocity Labs twitter',
    url: 'https://twitter.com/v_labs',
    name: 'discord',
  },
  {
    alt: 'Velocity Labs telegram',
    url: 'https://twitter.com/v_labs',
    name: 'telegram',
  },
  {
    alt: 'Velocity Labs twitter',
    url: 'https://twitter.com/v_labs',
    name: 'x',
  },
]

export const TurtleSocialIcons = () => {
  return TurtleSocialData.map((icon, idx) => (
    <a key={idx} href={icon.url} target="_blank" rel="noopener noreferrer" aria-label={icon.alt}>
      <SocialIcon name={icon.name} size={20} className="hover:text-white" />
    </a>
  ))
}
