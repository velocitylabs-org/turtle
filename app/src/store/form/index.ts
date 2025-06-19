import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { create } from 'zustand'

// Probably not needed, but keeping it for now
// Let's think..
export const useFormStore = create(set => ({
  sourceChain: null,
  destinationChain: null,
  sourceToken: null,
  destinationToken: null,
  setSourceChain: (sourceChain: Chain) => set({ sourceChain }),
  setDestinationChain: (destinationChain: Chain) => set({ destinationChain }),
  setSourceToken: (sourceToken: Token) => set({ sourceToken }),
  setDestinationToken: (destinationToken: Token) => set({ destinationToken }),
}))

export type FormStore = ReturnType<typeof useFormStore>
