import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Widget from '@/components/Widget'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget
        registry={{
          chains: ['hydration', 'moonbeam', 'polkadot', 'polkadot-assethub', 'bifrost'],
          tokens: ['eth'],
        }}
      />
    </div>
  </StrictMode>,
)
