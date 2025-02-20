import Widget from './Widget'
import { HeroUIProvider } from '@heroui/react'
function App() {
  return (
    <HeroUIProvider>
      <Widget />
    </HeroUIProvider>
  )
}

export default App
