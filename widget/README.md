<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Turtle Widget</h3>

  <p align="center">
    Frictionless cross-chain transfers
    <br />
    Made with 💚 by Velocity Labs
    <br/>
    <a href="https://app.turtle.cool"><strong> Visit the app »</strong></a>
    <br />
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## 🐢 About

Turtle is your go-to app for cross-chain transfers leveraging fully trustless infrastructure.  
We aim to provide a **unified experience** for transferring tokens anywhere.

## 📦 Installation

Note - Turtle Widget is currently in alpha and subject to breaking changes as development continues.
You may be using the latest alpha version, which can differ from the coming stable release.

```sh
pnpm install @velocitylabs-org/turtle-widget
```

## Usage

### React/Vite

```tsx
import Widget from '@velocitylabs-org/turtle-widget'

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget />
    </div>
  )
}

export default Home
```

#### 🐛 Troubleshooting (Vite/React)

The Turtle widget internally uses **WebAssembly (WASM)**, which may require additional configuration in your Vite project. If you're seeing errors related to WebAssembly (e.g., "Top-level await is not available"), make sure to:

1. **Install the [`vite-plugin-wasm`](https://www.npmjs.com/package/vite-plugin-wasm)**

```
pnpm add -D vite-plugin-wasm
```

2. **Update your `vite.config.ts` to include the plugin**

```tsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [wasm(), react()],
})
```

**\*You may need to set your `target` in `tsconfig.json` or `vite.config.ts` to `esnext`**, to allow top-level await and modern JS features.\*

### Next.js (With SSR Handling)

```tsx
'use client'

import dynamic from 'next/dynamic'

const Widget = dynamic(() => import('@velocitylabs-org/turtle-widget'), {
  loading: () => <div>Loading Turtle Widget...</div>,
  ssr: false,
})

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget />
    </div>
  )
}

export default Home
```

## 🎨 Theme configuration

The Turtle widget supports full theme customization.
You can pass a theme prop to `<Widget />` to override default styles like colors, background, overlay opacity, and more.

🧩 Types

```tsx
import type { WidgetTheme } from '@velocitylabs-org/turtle-widget'
```

### 🧑‍💻 Usage with Next.js

```tsx
'use client'

import dynamic from 'next/dynamic'
import type { WidgetTheme } from '@velocitylabs-org/turtle-widget'

const Widget = dynamic<{ theme?: WidgetTheme }>(() => import('@velocitylabs-org/turtle-widget'), {
  loading: () => <div>Loading Turtle Widget...</div>,
  ssr: false,
})

const theme = {
  primary: '#DBB3B1', // HexColor
  dialogOverlayRgb: '219, 179, 177', // RGBColor
  dialogOverlayOpacity: 0.5, // number
  //...
} satisfies WidgetTheme

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget theme={theme} />
    </div>
  )
}

export default Home
```

### Available theme keys:

- primary, primaryDark, primaryLight
- secondary, secondaryDark, secondaryLight, secondary50, secondaryTransparent (...)
- tertiary, tertiaryDark, tertiaryLight, tertiary70 (...)
- background, foreground
- level1 to level6
- success, warning, error (+ dark/light variants, ...)
- dialogOverlayRgb, dialogOverlayOpacity
- noteWarn
