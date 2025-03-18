<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://turtle.cool">
    <img src="./public/turtle.svg" alt="Logo" width="80" height="80">
  </a>

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
npm install @velocitylabs-org/turtle-widget
```


## Usage

### React/Vite

```tsx
import { Widget } from "@velocitylabs-org/turtle-widget";

function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget />
    </div>
  );
}

export default App;
```

### Next.js (With SSR Handling)

```tsx
import dynamic from "next/dynamic";
const Widget = dynamic(
  () =>
    import("@velocitylabs-org/turtle-widget").then(({ Widget }) => {
      if (!Widget) {
        throw new Error("Turtle Widget not found");
      }
      return Widget;
    }),
  {
    ssr: false,
    loading: () => <div>Loading Turtle Widget</div>,
  }
);


function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget />
    </div>
  );
}

export default Home;
```