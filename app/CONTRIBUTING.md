# Contributing to Turle

<a id="readme-top"></a>

Turtle is developed with Typescript, Nextjs, and React.

## Contribution Model

The `main` branch refers to the last stable version of <a href="https://app.turtle.cool"><strong>Turtle app</strong></a>. Each pull request should be initiated against the `main` branch and must be approved by at least one member of the tech team.

## Code Guidelines

This project uses recommended Biome and Typescript rules to ensure coding good practices.

We've setup linters and formatters to help catch errors and improve the development experience:

- [Biome](https://biomejs.dev/) – ensures that code is formatted in a readable way and checks code for antipatterns as well as formatting

**All modifications** must be made in a **pull-request** to solicit feedback from other contributors.

## Guides

### How to support a new parachain

_Parachain prerequisites coming soon._

**1. 📖 Update registry:** (_To support the new chain and tokens on the application_)

- add chain or update existing chain with all the fields required by the chain type: find a reliable source for the logo, check the supported address type (evm, or substrate), destinationFeeDOT, rpcConnection, skipExistentialDepositCheck, maxConsumers, etc.
  => Some missing information can be found on [Snowbridge SDK](https://github.com/Snowfork/snowbridge/blob/main/web/packages/api/src/environment.ts).

- add token if needed: again, find the logo from a reliable source, data (token address or an empty string if not available, multilocation, etc)

- update testnet or mainnet registry constant:

  - chains array
  - tokens array
  - add new routes and select the according SDK that supports transfers for this route

- add the new chain case to `getNativeToken()`:
  - _Example:_ `case 'mythos': return Mainnet.MYTH`

✋ Be careful to schemas when updating any type models. (It must not happen often).<br/>
=> Check chain swap on the app, sourcechain/destchain filters, sourcechain/tokens filters (UI checks in the transfer form).

**2. 🔐 Variables:** Do not forget to update `SNOWBRIDGE_MAINNET_PARACHAIN_URLS` in our registry so snowbridge can connect to the rpc. **& Vercel**. ✋ Be aware that adding a duplicate parachain Id to _PARACHAIN_API_URLS_ might break production. Test locally by setting the environment to `testnet`.

**3. ⚙️ Update Polkadot API/PAPI configuration:** (To fetch the balances)

- codegen metadata: add the chain with `npx papi add chainName -w wss://example-endpoint…`
- run `pnpm i` again
- import chainName in the code. Update `src/utils/papi.ts` to support the new type.

**4. ⛓️ Test Mainnet routes before merging to main branch. -** Either locally or from a deployed version: (Test flows && **Tracking**)

- Wait for transfers to be completed, look for Explorer(s) (Etherscan or Subscan) - Transfer must be displayed in the completed transfer tab.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
