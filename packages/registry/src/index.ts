import { rpcConnectionAsHttps } from "./helpers";
import { MainnetRegistry } from "./mainnet";
import {
  AssetHub,
  Bifrost,
  BridgeHub,
  Hydration,
  Moonbeam,
  Mythos,
} from "./mainnet/chains";
import { Environment, LocalAssetUid } from "./types";

const SNOWBRIDGE_MAINNET_PARACHAINS = [
  AssetHub,
  BridgeHub,
  Moonbeam,
  Bifrost,
  Hydration,
  Mythos,
];

export const REGISTRY = {
  mainnet: MainnetRegistry,
};

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS = Object.fromEntries(
  SNOWBRIDGE_MAINNET_PARACHAINS.map((chain) => [
    chain.chainId.toString(),
    rpcConnectionAsHttps(chain.rpcConnection),
  ]),
);

export function getAssetUid(
  env: Environment,
  chainId: string,
  tokenId: string,
): LocalAssetUid | undefined {
  return REGISTRY[env].assetUid.get(chainId)?.get(tokenId);
}

export * from "./helpers";
export * from "./utils";
export * from "./types";
export * from "./mainnet";
