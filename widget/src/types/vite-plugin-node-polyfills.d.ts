declare module 'vite-plugin-node-polyfills' {
  import type { Plugin } from 'vite'
  
  interface NodePolyfillsOptions {
    include?: string[]
    exclude?: string[]
    globals?: {
      Buffer?: boolean
      global?: boolean
      process?: boolean
    }
    protocolImports?: boolean
  }
  
  export function nodePolyfills(options?: NodePolyfillsOptions): Plugin
}