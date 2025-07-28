'use client'

import dynamic from 'next/dynamic'

const Widget = dynamic(() => import('@velocitylabs-org/turtle-widget'), {
  loading: () => <div>Loading Turtle Widget...</div>,
  ssr: false,
})

const WidgetWrapper = () => {
  return <Widget />
}

export default WidgetWrapper
