import { ComponentPropsWithoutRef } from 'react'

interface ArrowUpRightProps extends ComponentPropsWithoutRef<'svg'> {}

export default function ArrowUpRight({ ...props }: ArrowUpRightProps) {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.903886 9.59625C0.708624 9.40099 0.708624 9.0844 0.903886 8.88914L7.93236 1.86067L0.986086 3.01838C0.713701 3.06378 0.456087 2.87977 0.41069 2.60738C0.365292 2.335 0.549302 2.07738 0.821687 2.03198L9.30697 0.617771C9.46625 0.591225 9.62854 0.643234 9.74272 0.757415C9.8569 0.871595 9.90891 1.03389 9.88236 1.19317L8.46815 9.67845C8.42275 9.95083 8.16514 10.1348 7.89275 10.0894C7.62037 10.044 7.43636 9.78644 7.48176 9.51405L8.63947 2.56777L1.61099 9.59625C1.41573 9.79151 1.09915 9.79151 0.903886 9.59625Z"
        fill="currentColor"
      />
    </svg>
  )
}
