<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://turtle.cool">
    <img src="./public/turtle.svg" alt="Logo" width="80" height="80">
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

## About

Turtle is your go to app when it comes to cross-chain transfers that leverage fully trustless infrastructure. We aim to provide a unified experience to transfer tokens anywhere.

Features:

- Make transfers between blockchains in a decentralized and trustless way
- Intuitive UI that helps you along the way
- Bridge ERC20 tokens between Ethereum and Polkadot - Powered by Snowbridge
- [Soon]: Seamless XCM Transfers between all Polkadot parachains

<br/>
Turtle is developed with Typescript, Nextjs, and React.

## How to support a new parachain:

**1. 📖 Update registry:** (_To support the new chain and tokens on the application_):

- add chain or update existing chain with all the required info from the chain type: find a reliable source for the logo, check the supported address type (evm, or substrate), destinationFeeDOT, specName, rpcConnection, skipExistentialDepositCheck, maxConsumers (…)
  => Some missing information can be found on [Snowbridge SDK](https://github.com/Snowfork/snowbridge/blob/main/web/packages/api/src/environment.ts) or [AT API Registy.](https://github.dev/paritytech/asset-transfer-api-registry/blob/main/docs/registry.json)

- add token if needed: again, find the logo from a reliable source, data (token address or an empty string if not available, multilocation (…))

- update testnet or mainnet registry constant:
  - chains array
  - tokens array
  - add new routes and select the according SDK that supports transfers for this route

- add the new chain case to `getNativeToken()`. _Example_:
  - `case 'mythos': return Mainnet.MYTH`

✋ Be careful to schemas when updating any type models. (It must not happen often).<br/>
=> Check chain swap on the app, sourcechain/destchain filters, sourcechain/tokens filters (UI checks in the transfer form).

**2. 🔐 Env. Variables:** Do not forget to update `NEXT_PUBLIC_PARACHAIN_API_URLS`: in your local env, in the _.env.local.example_ **& Vercel**. ✋ Be aware that adding some _PARACHAIN_API_URLS_ might break the production if not supported (let's remember Muse testnet token/chain). Test locally by setting `shouldUseTestnet` constant to **`false`**.

**3. ⚙️ Update Polkadot API/PAPI configuration:** (To fetch the balances): 
- codegen metadata: add the chain with `npx papi add chainName -w wss://blabla…` 
- run `pnpm i` again 
- import chainName in the code. Update `src/utils/papi.ts` to support the new type.

**4. ⛓️ Test both Testnet & Mainnet routes before merging to main branch -** Either locally or from a deployed version: (Test flows && **Tracking**):
- Wait for transfers to be completed, look for Explorer(s) (Etherscan or Subscan) - Transfer must be displayed in the completed transfer tab.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
