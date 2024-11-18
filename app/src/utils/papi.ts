import { Mainnet } from '@/registry'
import { Chain } from '@/models/chain'
import { ethMultilocationSchema } from '@/models/schemas'
import {
  dotAh,
  mythos,
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
} from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { FixedSizeBinary, TypedApi } from 'polkadot-api'

/** All chains PAPI can connect to. Only used for PAPI types. */
export type SupportedChains = typeof dotAh | typeof mythos

/** Get PAPI chain type by chain object. Only used for PAPI types. Only supports mainnet atm. */
export const getApiDescriptorForChain = (chain: Chain) => {
  switch (chain.uid) {
    case Mainnet.AssetHub.uid:
      return dotAh
    case Mainnet.Mythos.uid:
      return mythos

    default:
      captureException(new Error(`Unsupported chain: ${chain}`))
      return dotAh // fallback
  }
}

/** Convert a multilocation string to an XCM V3 PAPI object. Only supports Ethereum multilocations for now. */
export const convertEthMultilocation = (multilocationString: string) => {
  try {
    const parsedObj = ethMultilocationSchema.parse(JSON.parse(multilocationString))

    // convert the 'key' field
    const keyHex = parsedObj.interior.X2[1].AccountKey20.key
    const keyAsUint8Array = new FixedSizeBinary(new Uint8Array(Buffer.from(keyHex.slice(2), 'hex')))

    return {
      parents: Number(parsedObj.parents),
      interior: XcmV3Junctions.X2([
        XcmV3Junction.GlobalConsensus(
          XcmV3JunctionNetworkId.Ethereum({
            chain_id: BigInt(parsedObj.interior.X2[0].GlobalConsensus.Ethereum.chainId),
          }),
        ),
        XcmV3Junction.AccountKey20({
          network: undefined,
          key: keyAsUint8Array,
        }),
      ]),
    }
  } catch (error) {
    captureException(error)
    return undefined
  }
}

/** Fetch the native balance of a given address on the connected chain. */
export const getNativeBalance = async (
  api: TypedApi<SupportedChains> | undefined,
  address: string,
) => {
  const apiAssetHub = api as TypedApi<typeof dotAh> // treat it as AssetHub api for now to get types
  return await apiAssetHub?.query.System.Account.getValue(address)
}

export interface Balance {
  free: bigint
}
