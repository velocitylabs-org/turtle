import { resolve } from 'node:path'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [
    wasm(),
    react(),
    nodePolyfills(),
    dts({
      tsconfigPath: 'tsconfig.app.json',
      outDir: 'dist',
      insertTypesEntry: true,
    }),
    cssInjectedByJsPlugin(),
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
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})

// import { resolve } from 'node:path'
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import dts from 'vite-plugin-dts'
// import tailwindcss from 'tailwindcss'
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// export default defineConfig({
//   plugins: [
//     react(),
//     dts({
//       tsconfigPath: 'tsconfig.app.json',
//       outDir: 'dist',
//       insertTypesEntry: true,
//       rollupTypes: true, // Add this to consolidate .d.ts files
//     }),
//     cssInjectedByJsPlugin(),
//   ],
//   css: {
//     postcss: {
//       plugins: [tailwindcss],
//     },
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//   },
//   build: {
//     lib: {
//       entry: resolve(__dirname, './src/index.ts'),
//       formats: ['es'],
//       // fileName: () => 'turtle-widget.js',
//     },
//     rollupOptions: {
//       external: ['react', 'react-dom', 'react/jsx-runtime'],
//       output: {
//         globals: {
//           react: 'React',
//           'react-dom': 'ReactDOM',
//           'react/jsx-runtime': 'react/jsx-runtime',
//         },
//         manualChunks: undefined, // Disable code splitting
//         inlineDynamicImports: true, // Inline dynamic imports
//       },
//     },
//     emptyOutDir: true,
//     sourcemap: true,
//     minify: 'esbuild',
//   },
// })
