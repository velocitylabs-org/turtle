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

> #### 🐛 Troubleshooting (Vite/React)
>
> The Turtle widget internally uses **WebAssembly (WASM)**, which may require additional configuration in your Vite project. If you're seeing errors related to WebAssembly (e.g., "Top-level await is not available"), make sure to:
>
> 1. **Install the [`vite-plugin-wasm`](https://www.npmjs.com/package/vite-plugin-wasm)**
>
> ```
> pnpm add -D vite-plugin-wasm
> ```
>
> 2. **Update your `vite.config.ts` to include the plugin**
>
> ```typescript
> import { defineConfig } from 'vite'
> import react from '@vitejs/plugin-react'
> import wasm from 'vite-plugin-wasm'
>
> export default defineConfig({
>   plugins: [wasm(), react()],
> })
> ```
>
> 3. **Optional: Build Configuration**
>
> If you encounter build errors, make sure your `vite.config.ts` includes the following build configuration to support modern JS features, WASM and allow top-level await:
>
> ```typescript
> export default defineConfig({
>   plugins: [wasm(), react()],
>   ...
>   build: {
>     target: "esnext",
>     rollupOptions: {
>       output: {
>         format: "es",
>       },
>     },
>   }
> })
> ```
>
> You may also need to set your `target` in `tsconfig.json`

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

## ⛓️ Chain and Token Configuration

You can customize the Chains and Tokens you want to show in your widget instance. It works by passing the `registry` configuration. It defaults to using all chains & tokens supported by the [Turtle App](https://app.turtle.cool/) otherwise.

Here’s how to configure it:

```tsx
import type { ConfigRegistryType } from '@velocitylabs-org/turtle-widget'

const registry = {
  chains: ['polkadot', 'hydration'],
  tokens: ['dot', 'usdc', 'usdt'],
} satisfies ConfigRegistryType
```

Pass it as a prop to the `<Widget />` component:

```tsx
<Widget registry={registry} />
```

If you leave the `chains` or `tokens` arrays empty, all chains and tokens will be shown by default.

✅ Available Values:

#### Chains ids

```tsx
ethereum // Ethereum
polkadot - assethub // Asset Hub
polkadot // Relay Chain
polkadot - bridgehub // BridgeHub
bifrost // Bifrost
hydration // Hydration
phala // Phala
moonbeam // Moonbeam
interlay // Interlay
acala // Acala
polimec // Polimec
centrifuge // Centrifuge
astar // Astar
mythos // Mythos
```

#### Tokens ids

```tsx
eth // Ethereum
usdc.e // USD Coin (bridged)
dai.e // DAI (bridged)
usdt.e // Tether (bridged)
weth.e // Wrapped Ether (bridged)
veth.e // vEther
wbtc.e // Wrapped Bitcoin (bridged)
myth.e // Mythos (bridged)
shib.e // Shiba Inu (bridged)
pepe.e // Pepe (bridged)
ton.e // Toncoin (bridged)
wsteth.e // Wrapped Staked Ether (bridged)
tbtc.e // tBTC (bridged)
aca // Acala
astr // Astar
bnc // Bifrost Native Coin
cfg // Centrifuge
hdx // HydraDX
usdc // USD Coin
usdt // Tether
glmr // Moonbeam (GLMR)
pha // Phala
intr // Interlay
dot // Polkadot
vdot // Voucher DOT
ibtc // InterBTC
plmc // Polimec
myth.p // Mythos (native or parachain)
```

## 🎨 Theme configuration

The Turtle widget supports full theme customization.
You can pass a theme prop to `<Widget />` to override default styles like colors, background, overlay opacity, and more.

> ⚠️ Note: The Turtle Widget bundles its own Tailwind CSS, but it's not sandboxed. Global styles from your app (e.g., `.your-wrapper p { ... }`) may still affect it. This allows for advanced customization, but be cautious with _aggressive_ global CSS.

🧩 Type

```tsx
import type { WidgetTheme } from '@velocitylabs-org/turtle-widget'
```

### 🧑‍💻 Custom configuration usage with Next.js

```tsx
'use client'

import dynamic from 'next/dynamic'
import type { WidgetTheme, ConfigRegistryType } from '@velocitylabs-org/turtle-widget'

const Widget = dynamic<{ theme?: WidgetTheme; registry?: ConfigRegistryType }>(
  () => import('@velocitylabs-org/turtle-widget'),
  {
    loading: () => <div>Loading Turtle Widget...</div>,
    ssr: false,
  },
)

const theme = {
  primary: '#DBB3B1', // HexColor
  dialogOverlayRgb: '219, 179, 177', // RGBColor
  dialogOverlayOpacity: 0.5, // number
  //...
} satisfies WidgetTheme

const registry = {
  chains: ['polkadot', 'hydration'],
  tokens: ['dot', 'usdc', 'usdt'],
} satisfies ConfigRegistryType

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget theme={theme} registry={registry} />
    </div>
  )
}

export default Home
```

### ✅ Available theme keys:

- primary, primaryDark, primaryLight
- secondary, secondaryDark, secondaryLight, secondary50, secondaryTransparent (...)
- tertiary, tertiaryDark, tertiaryLight, tertiary70 (...)
- background, foreground
- level1 to level6
- success, warning, error (+ dark/light variants, ...)
- dialogOverlayRgb, dialogOverlayOpacity
- noteWarn
