const OnOffRamp = () => {
  const meldApiKey = process.env.NEXT_PUBLIC_MELD_API_KEY

  return (
    <div className="flex p-[40px] w-full max-w-[90vw] flex-col gap-1 rounded-b-3xl border border-t-0 border-turtle-foreground bg-white sm:w-[31.5rem] relative items-center justify-center">
      <iframe
        src={`https://meldcrypto.com/?theme=lightMode&publicKey=${meldApiKey}`}
        height="790"
        width="450"
        title="Meld Widget"
        className="border rounded border-white"
      />
    </div>
  )
}

export default OnOffRamp
