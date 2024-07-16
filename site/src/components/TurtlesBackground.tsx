interface TurtlesBackgroundProps {
  /** Background to display. */
  src: string
  /** The image alternative text. */
  alt: string
}

export const TurtlesBackground: React.FC<TurtlesBackgroundProps> = ({ src, alt }) => {
  return (
    <div className="absolute top-0 z-0">
      <div className="turtle-background flex h-[80vh] w-screen flex-col items-center justify-center overflow-hidden bg-[url('/bg.png')] bg-cover bg-bottom">
        <div className="turtle-dark-overlay flex w-screen flex-col items-center justify-center ">
          <h1 className="turtle-text-shadow max-w-[1500px] text-center text-[9rem] leading-[100%] text-turtle-shadow text-white">
            {alt}
          </h1>
        </div>
      </div>
    </div>
  )
}
