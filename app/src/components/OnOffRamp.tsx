const OnOffRamp = () => {
  const meldApiKey = process.env.NEXT_PUBLIC_MELD_API_KEY

  return (
    <iframe
      src={`https://sb.meldcrypto.com/?theme=lightMode&publicKey=${meldApiKey}`}
      height="790"
      width="450"
      className="rounded-lg border-2 border-gray-300"
      title="Meld Widget"
    />
  )
}

export default OnOffRamp
