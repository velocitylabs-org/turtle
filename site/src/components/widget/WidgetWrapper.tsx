'use client'

import { Body, LoadingIcon } from '@velocitylabs-org/turtle-ui'
import dynamic from 'next/dynamic'

const Widget = dynamic(() => import('@velocitylabs-org/turtle-widget'), {
  ssr: false,
  loading: () => (
    <div className="widget-loader flex h-[300px] w-full flex-col items-center justify-center rounded-2xl bg-white md:h-[460px] md:w-[504px]">
      <LoadingIcon className="animate-spin" width={40} height={40} />
      <Body>Loading the widget...</Body>
    </div>
  ),
})

const WidgetWrapper = () => {
  return <Widget />
}

export default WidgetWrapper
