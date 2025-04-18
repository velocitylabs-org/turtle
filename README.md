<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://turtle.cool">
    <img src="./app/public/turtle.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Turtle</h3>

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

## About

Turtle is your go to app when it comes to cross-chain transfers that leverage fully trustless infrastructure. We aim to provide a unified experience to transfer tokens anywhere.

Features:

- Make transfers between blockchains in a decentralized and trustless way
- Intuitive UI that helps you along the way
- Bridge ERC20 tokens between Ethereum and Polkadot - Powered by Snowbridge
- Seamless XCM Transfers between all Polkadot parachains - Powered by Paraspell
- [Coming Soon] Combine transfers with token swaps - Powered by Paraspell

<br/>
Turtle is developed with Typescript, Nextjs, and React.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

If you have a suggestion or want to contribute to Turtle, either fork the repo and create a pull request or simply open an issue.

Don't forget to give the project a star. Thanks for your support!

### Top contributors:

<a href="https://github.com/velocitylabs-org/turtle/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=velocitylabs-org/turtle" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUILDING -->

## Building

Turtle is gradually changing its structure to a monorepo handled by [Turborepo](https://turbo.build)

### First things first

`.env` files are local to the packages

In the root of the project run: 

`pnpm install`

### How do I build and start the project

`pnpm run build` or `pnpm run build --filter=<package-name>`

then running the following command will serve what you've just built.

`pnpm run start` or `pnpm run start --filter=<package-name>`

### How do I run dev?

`pnpm run dev` or `pnpm run dev --filter=<package-name>`

`package-name` is always the name that's used in the `name` field of a `package.json`

### How do I add a package?

Packages can be added from the root directory but it's very important that a `filter` is specified, 
as we do not want to add anything to the main `package.json` unless necessary for monorepo purposes.

`pnpm add <package> --filter=<package-name>` 

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Nuno (product & tech lead) - nuno@velocitylabs.org

Noah (software engineer) - noah@velocitylabs.org

Victor (software engineer) - victor@velocitylabs.org

Brandon (design & ux) - https://brandonoxendine.com/

<p align="right">(<a href="#readme-top">back to top</a>)</p>
