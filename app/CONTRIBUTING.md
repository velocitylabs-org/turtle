# Contributing to Turle

<a id="readme-top"></a>

Turtle is developed with Typescript, Nextjs, and React.

## Contribution Model

The `main` branch refers to the last stable version of <a href="https://app.turtle.cool"><strong>Turtle app</strong></a>. Each pull request should be initiated against the `main` branch and must be approved by at least, one member of the tech team.

## Code Guidelines

This project uses recommended ESLint and Typescript rules to ensure coding good practices.

We've setup linters and formatters to help catch errors and improve the development experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

**All modifications** must be made in a **pull-request** to solicit feedback from other contributors.

## Information, contributors might be looking for

### How to support a new parachain

_Parachain prerequisites coming soon._

**1. 📖 Update registry:** (_To support the new chain and tokens on the application_)

- add chain or update existing chain with all the required info from the chain type: find a reliable source for the logo, check the supported address type (evm, or substrate), destinationFeeDOT, specName, rpcConnection, skipExistentialDepositCheck, maxConsumers (…)
  => Some missing information can be found on [Snowbridge SDK](https://github.com/Snowfork/snowbridge/blob/main/web/packages/api/src/environment.ts) or [AT API Registy.](https://github.dev/paritytech/asset-transfer-api-registry/blob/main/docs/registry.json)

- add token if needed: again, find the logo from a reliable source, data (token address or an empty string if not available, multilocation (…))

- update testnet or mainnet registry constant:

  - chains array
  - tokens array
  - add new routes and select the according SDK that supports transfers for this route

- add the new chain case to `getNativeToken()`:
  - _Example:_ `case 'mythos': return Mainnet.MYTH`

✋ Be careful to schemas when updating any type models. (It must not happen often).<br/>
=> Check chain swap on the app, sourcechain/destchain filters, sourcechain/tokens filters (UI checks in the transfer form).

**2. 🔐 Env. Variables:** Do not forget to update `NEXT_PUBLIC_PARACHAIN_API_URLS`, in your local env, in the _.env.local.example_ **& Vercel**. ✋ Be aware that adding some _PARACHAIN_API_URLS_ might break the production if not supported (let's remember Muse testnet token/chain with the duplicate parachain Id). Test locally by setting `shouldUseTestnet` constant to **`false`**.

**3. ⚙️ Update Polkadot API/PAPI configuration:** (To fetch the balances)

- codegen metadata: add the chain with `npx papi add chainName -w wss://blabla…`
- run `pnpm i` again
- import chainName in the code. Update `src/utils/papi.ts` to support the new type.

**4. ⛓️ Test both Testnet & Mainnet routes before merging to main branch. -** Either locally or from a deployed version: (Test flows && **Tracking**)

- Wait for transfers to be completed, look for Explorer(s) (Etherscan or Subscan) - Transfer must be displayed in the completed transfer tab.

<p align="right">(<a href="#readme-top">back to top</a>)</p>