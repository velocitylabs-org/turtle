import {
  dotAh,
  mythos,
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
} from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { FixedSizeBinary, TypedApi } from 'polkadot-api'
import { z } from 'zod'

/** All chains papi can connect to. */
export type SupportedChains = typeof dotAh | typeof mythos

const ethMultilocationSchema = z.object({
  parents: z.number(),
  interior: z.object({
    X2: z.tuple([
      z.object({
        GlobalConsensus: z.object({
          Ethereum: z.object({
            chainId: z.string(),
          }),
        }),
      }),
      z.object({
        AccountKey20: z.object({
          network: z.nullable(z.string()),
          key: z.string(),
        }),
      }),
    ]),
  }),
})

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

/** Fetch the non-native balance of a given address on the connected chain. Returns undefined if no balance exists. */
export const getNonNativeBalance = async (
  api: TypedApi<SupportedChains> | undefined,
  tokenMultilocation: string,
  address: string,
) => {
  // TODO: Figure out which pallet to query. It is not always 'ForeignAssets'
  const apiAssetHub = api as TypedApi<typeof dotAh> // treat it as AssetHub api for now to get types
  const convertedMultilocation = convertEthMultilocation(tokenMultilocation)
  if (!convertedMultilocation) return undefined

  return await apiAssetHub?.query.ForeignAssets.Account.getValue(convertedMultilocation, address)
}
