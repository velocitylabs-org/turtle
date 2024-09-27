import { Mainnet } from '@/config/registry'
import { Chain } from '@/models/chain'
import {
  bifrost,
  dotAh,
  mythos,
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
} from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { Enum, FixedSizeBinary, TypedApi } from 'polkadot-api'
import { z } from 'zod'

/** All chains PAPI can connect to. Only used for PAPI types. */
export type SupportedChains = typeof dotAh | typeof mythos | typeof bifrost

/** Get PAPI chain type by chain object. Only used for PAPI types. Only supports mainnet atm. */
export const getApiDescriptorForChain = (chain: Chain) => {
  switch (chain.uid) {
    case Mainnet.AssetHub.uid:
      return dotAh
    case Mainnet.Mythos.uid:
      return mythos
    case Mainnet.Bifrost.uid:
      return bifrost

    default:
      captureException(new Error(`Unsupported chain: ${chain}`))
      return dotAh // fallback
  }
}

const ethMultilocationSchema = z.object({
  parents: z.string(),
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
  
  const bifrostApi = api as TypedApi<typeof bifrost>
  // TODO: Figure out which pallet to query. It is not always 'ForeignAssets'
  // const apiAssetHub = api as TypedApi<typeof dotAh> // treat it as AssetHub api for now to get types
  const convertedMultilocation = convertEthMultilocation(tokenMultilocation)
  if (!convertedMultilocation) return undefined

  
  console.log("BiFrost balance wETH is ", address, await bifrostApi?.query.Tokens.Accounts.getValue(address, Enum("Token2", 13)))

  return await bifrostApi?.query.Tokens.Accounts.getValue(address, Enum("Token2", 13))
}
