'use client'

interface GlobalErrorProps {
  reset: () => void
}

const GlobalError: React.FC<GlobalErrorProps> = ({ reset }) => {
  return (
    <html lang="en">
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}

export default GlobalError
