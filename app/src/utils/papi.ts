import { XcmV3Junction, XcmV3JunctionNetworkId, XcmV3Junctions } from '@polkadot-api/descriptors'
import { FixedSizeBinary } from 'polkadot-api'

/** Convert a multilocation string to an XCM V3 PAPI object. Only supports Ethereum multilocations for now. */
export function convertEthMultilocation(multilocationString: string) {
  const parsedObj = JSON.parse(multilocationString)

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
}
