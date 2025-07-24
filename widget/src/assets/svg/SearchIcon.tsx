import type { ComponentPropsWithoutRef } from 'react'

interface SearchIconProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function SearchIcon({ fill = '#001B04', ...props }: SearchIconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 7C12.5 3.96243 10.0376 1.5 7 1.5C3.96243 1.5 1.5 3.96243 1.5 7C1.5 10.0376 3.96243 12.5 7 12.5C10.0376 12.5 12.5 10.0376 12.5 7ZM7 0.5C10.5899 0.5 13.5 3.41015 13.5 7C13.5 8.61998 12.9074 10.1015 11.9271 11.2397C11.9602 11.26 11.9915 11.2844 12.0202 11.3131L17.3536 16.6464C17.5488 16.8417 17.5488 17.1583 17.3536 17.3536C17.1583 17.5488 16.8417 17.5488 16.6464 17.3536L11.3131 12.0202C11.2844 11.9915 11.26 11.9602 11.2397 11.9271C10.1015 12.9074 8.61998 13.5 7 13.5C3.41015 13.5 0.5 10.5899 0.5 7C0.5 3.41015 3.41015 0.5 7 0.5Z"
        fill={fill}
      />
    </svg>
  )
}
