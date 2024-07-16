interface TurtlesBackgroundProps {
  /** Background to display. */
  src: string
  /** The image alternative text. */
  alt: string
}

export const TurtlesBackground: React.FC<TurtlesBackgroundProps> = ({ src, alt }) => {
  return (
    <div className="absolute top-0 z-0 turtle-background bg-[#000]">
      <div className="flex flex-col items-center justify-center h-[80vh] w-screen overflow-hidden bg-[url('/bg.png')] bg-bottom bg-cover" >
        <h1 className='text-[9rem] max-w-[1500px] text-turtle-background leading-[100%] text-center turtle-text-shadow'>{alt}</h1>
      </div>
    </div>
  )
}
