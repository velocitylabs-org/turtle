export const MeldWidget = ({ apiKey }: { apiKey: string }) => {
  return (
    <div className="flex px-[2rem] pb-[1.5rem] sm:px-[40px] sm:pb-[40px] w-full max-w-[90vw] flex-col gap-1 rounded-b-3xl border border-t-0 border-turtle-foreground bg-white sm:w-[31.5rem] relative items-center justify-center">
      <iframe
        src={`https://meldcrypto.com/?theme=lightMode&publicKey=${apiKey}`}
        title="Meld Widget"
        className="border rounded border-white sm:w-[450px] max-w-full sm:h-[790px] h-[670px] w-full"
      />
    </div>
  )
}
