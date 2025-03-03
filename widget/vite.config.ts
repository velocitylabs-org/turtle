import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import tailwindcss from 'tailwindcss'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
// import copy from 'rollup-plugin-copy'

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: 'tsconfig.app.json',
      outDir: 'dist', // put .d.ts files in ./dist
      insertTypesEntry: true, // create an index.d.ts entry
      // rollupTypes: true,
    }),
    cssInjectedByJsPlugin(),
    // {
    //   ...copy({
    //     targets: [
    //       // Copy entire subfolders from src/assets
    //       { src: 'src/assets/fonts', dest: 'dist/src/assets' },
    //       { src: 'src/assets/logos', dest: 'dist/src/assets' },
    //       { src: 'src/assets/svg', dest: 'dist/src/assets' },
    //       { src: 'src/assets/wallets-logo', dest: 'dist/src/assets' },
    //     ],
    //     hook: 'writeBundle',
    //   }),
    //   apply: 'build',
    // },
  ],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // assetFileNames: 'assets/[name][extname]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    // sourcemap: true,
    emptyOutDir: true,
  },
})
