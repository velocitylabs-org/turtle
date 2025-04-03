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

```sh
pnpm install @velocitylabs-org/turtle-widget
```


## Usage

### React/Vite

```tsx
import Widget, { WidgetTheme } from "@velocitylabs-org/turtle-widget";

const theme = {
  primary: "#DBB3B1", // HexColor
  dialogOverlayRgb: "219, 179, 177", // RGBColor
  dialogOverlayOpacity: 0.5, // number
} satisfies WidgetTheme;

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget theme={theme} />
    </div>
  );
}

export default Home;
```

### Next.js (With SSR Handling)

```tsx
"use client";

import dynamic from "next/dynamic";
import type { WidgetTheme } from "@velocitylabs-org/turtle-widget";

const Widget = dynamic<{ theme?: WidgetTheme }>(
  () => import("@velocitylabs-org/turtle-widget"),
  {
    loading: () => <div>Loading Turtle Widget...</div>,
    ssr: false,
  }
);

const theme = {
  primary: "#DBB3B1", // HexColor
  dialogOverlayRgb: "219, 179, 177", // RGBColor
  dialogOverlayOpacity: 0.5, // number
} satisfies WidgetTheme;

function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget theme={theme} />
    </div>
  );
}

export default Home;
```