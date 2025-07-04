import acalaLogo from "@velocitylabs-org/turtle-assets/logos/acala.svg";
import assetHubLogo from "@velocitylabs-org/turtle-assets/logos/assethub.svg";
import astarLogo from "@velocitylabs-org/turtle-assets/logos/astar.svg";
import bifrostLogo from "@velocitylabs-org/turtle-assets/logos/bifrost.svg";
import bridgehubLogo from "@velocitylabs-org/turtle-assets/logos/bridgehub.svg";
import centrifugeLogo from "@velocitylabs-org/turtle-assets/logos/cfg.svg";
import ethereumLogo from "@velocitylabs-org/turtle-assets/logos/ethereum.svg";
import hydraLogo from "@velocitylabs-org/turtle-assets/logos/hydra.svg";
import interlayLogo from "@velocitylabs-org/turtle-assets/logos/interlay.svg";
import moonbeamLogo from "@velocitylabs-org/turtle-assets/logos/moonbeam.svg";
import mythosLogo from "@velocitylabs-org/turtle-assets/logos/myth.svg";
import phalaLogo from "@velocitylabs-org/turtle-assets/logos/phala.svg";
import polimecLogo from "@velocitylabs-org/turtle-assets/logos/polimec.svg";
import polkadotLogo from "@velocitylabs-org/turtle-assets/logos/polkadot.svg";
import { DWELLIR_KEY } from "../constants";
import { Chain } from "../types";

export const Ethereum: Chain = {
  uid: "ethereum",
  name: "Ethereum",
  logoURI: ethereumLogo,
  chainId: 1,
  network: "Ethereum",
  walletType: "EVM",
  supportedAddressTypes: ["evm"],
};

export const AssetHub: Chain = {
  uid: "polkadot-assethub",
  name: "Asset Hub",
  logoURI: assetHubLogo,
  chainId: 1000,
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-asset-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
};

export const RelayChain: Chain = {
  uid: "polkadot",
  name: "Polkadot",
  logoURI: polkadotLogo,
  chainId: 0,
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-polkadot.n.dwellir.com/${DWELLIR_KEY}`,
};

export const BridgeHub: Chain = {
  uid: "polkadot-bridgehub",
  name: "Bridge Hub",
  logoURI: bridgehubLogo,
  chainId: 1002,
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-bridge-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
};

export const Bifrost: Chain = {
  uid: "bifrost",
  name: "Bifrost",
  logoURI: bifrostLogo,
  chainId: 2030,
  destinationFeeDOT: "385000000",
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-bifrost-polkadot.dwellir.com/${DWELLIR_KEY}`,
};

export const Hydration: Chain = {
  uid: "hydration",
  name: "Hydration",
  logoURI: hydraLogo,
  chainId: 2034,
  destinationFeeDOT: "3774400",
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-hydration.n.dwellir.com/${DWELLIR_KEY}`,
};

export const Phala: Chain = {
  uid: "phala",
  name: "Phala",
  logoURI: phalaLogo,
  chainId: 2035,
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-phala.n.dwellir.com/${DWELLIR_KEY}`,
};

export const Moonbeam: Chain = {
  uid: "moonbeam",
  name: "Moonbeam",
  logoURI: moonbeamLogo,
  chainId: 2004,
  destinationFeeDOT: "313592650",
  network: "Polkadot",
  supportedAddressTypes: ["evm"],
  walletType: "EVM",
  rpcConnection: `wss://api-moonbeam.n.dwellir.com/${DWELLIR_KEY}`,
};

export const Interlay: Chain = {
  uid: "interlay",
  name: "Interlay",
  logoURI: interlayLogo,
  chainId: 2032,
  destinationFeeDOT: "", // TODO
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-interlay.dwellir.com/${DWELLIR_KEY}`,
};

export const Acala: Chain = {
  uid: "acala",
  name: "Acala",
  logoURI: acalaLogo,
  chainId: 2000,
  destinationFeeDOT: "", // TODO
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-acala.dwellir.com/${DWELLIR_KEY}`,
};

export const Polimec: Chain = {
  uid: "polimec",
  name: "Polimec",
  logoURI: polimecLogo,
  chainId: 3344,
  destinationFeeDOT: "", // TODO
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-polimec.n.dwellir.com/${DWELLIR_KEY}`,
};

export const Centrifuge: Chain = {
  uid: "centrifuge",
  name: "Centrifuge",
  logoURI: centrifugeLogo,
  chainId: 2031,
  destinationFeeDOT: "", // TODO
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-centrifuge.dwellir.com/${DWELLIR_KEY}`,
};

export const Astar: Chain = {
  uid: "astar",
  name: "Astar",
  logoURI: astarLogo,
  chainId: 2006,
  destinationFeeDOT: "", // TODO
  network: "Polkadot",
  supportedAddressTypes: ["ss58"],
  walletType: "Substrate",
  rpcConnection: `wss://api-astar.dwellir.com/${DWELLIR_KEY}`,
};

export const Mythos: Chain = {
  uid: "mythos",
  name: "Mythos",
  logoURI: mythosLogo,
  chainId: 3369,
  destinationFeeDOT: "500000000",
  network: "Polkadot",
  supportedAddressTypes: ["evm"],
  walletType: "SubstrateEVM",
  rpcConnection: "wss://polkadot-mythos-rpc.polkadot.io",
};
