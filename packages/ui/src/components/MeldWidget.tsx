export const MeldWidget = ({ apiKey }: { apiKey: string }) => {
  return (
    <div className="flex px-[40px] pb-[40px] w-full max-w-[90vw] flex-col gap-1 rounded-b-3xl border border-t-0 border-turtle-foreground bg-white sm:w-[31.5rem] relative items-center justify-center">
      <iframe
        src={`https://meldcrypto.com/?theme=lightMode&publicKey=${apiKey}`}
        height="790"
        width="450"
        title="Meld Widget"
        className="border rounded border-white"
      />
    </div>
  )
}
