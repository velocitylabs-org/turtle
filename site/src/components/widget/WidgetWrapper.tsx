'use client'

import dynamic from 'next/dynamic'

const Widget = dynamic(() => import('@velocitylabs-org/turtle-widget'), {
  loading: () => (
    <div className="widget-loader flex h-[300px] w-full items-center justify-center rounded-2xl bg-white md:h-[460px] md:w-[504px]">
      Loading Turtle Widget...
    </div>
  ),
  ssr: false,
})

const WidgetWrapper = () => {
  return <Widget />
}

export default WidgetWrapper
