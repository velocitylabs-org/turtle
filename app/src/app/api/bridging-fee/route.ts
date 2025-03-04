import { CACHE_REVALIDATE_IN_SECONDS } from '@/services/balance'
import { getErrorMessage } from '@/utils/transferTracking'
import { getParaEthTransferFees } from '@paraspell/sdk'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Fetch the AH -> Ethereum bridging fee
 *
 * It serves as a cached layer to reduce the latency of requesting this value.
 *
 * @returns the total amount the user will have to pay for execution and
 * bridging fees on AH to send the tokens to Ethereum.
 */
export async function GET(_: Request) {
  const fetchBridgingFee = unstable_cache(
    async () => {
      //todo(nuno): in the future we want to pass the granular fee breakdown (bridging + execution)
      return (await getParaEthTransferFees()).reduce((acc, x) => acc + x).toString()
    },
    [`bridging-fee-ah`],
    {
      revalidate: CACHE_REVALIDATE_IN_SECONDS,
    },
  )

  try {
    const fee = await fetchBridgingFee()
    return NextResponse.json(fee.toString(), { status: 200 })
  } catch (err) {
    console.error('Error in bridging-fee API:', err)
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
