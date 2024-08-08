interface TurtlesBackgroundProps {
  header: string
}

export const TurtlesBackground: React.FC<TurtlesBackgroundProps> = ({ header }) => {
  return (
    <div className="absolute top-0 z-0">
      <div className="turtle-background flex h-[80vh] w-screen flex-col items-center justify-center overflow-hidden bg-[url('/bg.png')] bg-cover bg-bottom">
        <div className="turtle-dark-overlay flex w-screen flex-col items-center justify-center ">
          <h1 className="turtle-text-shadow m-[4vw] text-center text-[8.75vw] leading-[100%] text-white">
            {header}
          </h1>
        </div>
      </div>
      <div>
        <div className="waves-container">
          <svg
            className="waves"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(191,218,220,0.85" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(191,218,220,0.65)" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(191,218,220,0.45)" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#BFDADC" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
