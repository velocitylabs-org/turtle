'use client'
import Widget from '@velocitylabs-org/turtle-widget'

export default function AppHome() {
  return <Widget endpointUrl="/" meldApiKey={process.env.NEXT_PUBLIC_MELD_API_KEY} />
}
