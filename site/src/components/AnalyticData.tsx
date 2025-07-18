export default function AnalyticData({
  volume,
}: {
  volume: number
}) {
  return (
    <div
      className="flex h-auto w-full flex-col items-center justify-center z-50 relative my-[8vw] md:my-[6vw] lg:my-[4vw]">
      <div
        className="flex items-center gap-2 bg-turtle-primary px-4 py-2 md:px-5 md:py-3 rounded-full border border-black">
        <BoltIcon />
        <span className="text-black text-[16px] md:text-[18px] lg:text-[20px]">
          <span className="font-bold mr-1">${volume.toLocaleString()}</span> Total funds moved in Turtle
        </span>
      </div>
    </div>
  )
}

function BoltIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.88899 12.5155L16.8 1L13.6 10.625H18.7635C19.213 10.625 19.4342 11.172 19.111 11.4845L7.2 23L10.4 13.375H5.23652C4.78699 13.375 4.5658 12.828 4.88899 12.5155Z" stroke="#001B04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
