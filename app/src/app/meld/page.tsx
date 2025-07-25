import React from 'react'

const MeldPage = () => {
  const meldApiKey = process.env.NEXT_PUBLIC_MELD_API_KEY

  return (
    <div className="flex items-center justify-center">
      <div className="pb-20">
        <iframe
          src={`https://sb.meldcrypto.com/?theme=lightMode&publicKey=${meldApiKey}`}
          height="790"
          width="450"
          className="rounded-lg border-2 border-gray-300"
          title="Meld Widget"
        />
      </div>
    </div>
  )
}

export default MeldPage
