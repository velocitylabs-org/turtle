const OnOffRamp = () => {
  const meldApiKey = process.env.NEXT_PUBLIC_MELD_API_KEY

  return (
    <div className="flex pb-5 w-full max-w-[90vw] flex-col gap-1 rounded-b-3xl border border-t-0 border-turtle-foreground bg-white sm:w-[31.5rem] relative items-center justify-center">
      <iframe
        src={`https://sb.meldcrypto.com/?theme=lightMode&publicKey=${meldApiKey}`}
        height="700"
        width="450"
        title="Meld Widget"
      />
    </div>
  )
}

export default OnOffRamp
