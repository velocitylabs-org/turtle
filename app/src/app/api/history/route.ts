export const fetchCache = 'default-no-store' // Dont cache fetches unless asked.
export const dynamic = 'force-dynamic' // Always run dynamically
export const revalidate = 30 // Keep cache for 2 minutes
export const maxDuration = 90 // Timout adter

import { getEnvironment } from '@/context/snowbridge'
import { ongoingTransfersSchema } from '@/models/api-schemas'
import { OngoingTransferWithDirection, OngoingTransfers } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { Environment, environmentFromStr } from '@/store/environmentStore'
import { getErrorMessage, trackTransfers } from '@/utils/transferTracking'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

const CACHE_REVALIDATE_IN_SECONDS = 30

const getCachedTransferHistory = unstable_cache(
  (env: Environment, ongoingTransfers: OngoingTransferWithDirection[]) => {
    const snowbridgeEnv = getEnvironment(env)

    try {
      const transfers: OngoingTransfers = {
        toEthereum: [], // AH => Eth transfer
        toPolkadot: [], // Eth => AH || Parachain transfer
        withinPolkadot: [], // XCM transfer: Parachain to AH, AH to Parachain, Parachain to Parachain, etc
      }

      ongoingTransfers.map(transfer => {
        switch (transfer.direction) {
          case Direction.ToEthereum: {
            if (transfer.sourceChain.chainId === snowbridgeEnv.config.ASSET_HUB_PARAID) {
              transfers.toEthereum.push(transfer)
            } else {
              console.log('Direct Parachain => Eth tracking to be implemented/verified')
              // Confirm the tracking process for direct Para to Eth transfer once supported
              // If tracking process: remove the if/else check
            }
            break
          }
          case Direction.ToPolkadot: {
            transfers.toPolkadot.push(transfer)
            break
          }
          case Direction.WithinPolkadot: {
            transfers.withinPolkadot.push(transfer)
            break
          }
          default:
            throw new Error('Direction not supported')
        }
      })

      return trackTransfers(snowbridgeEnv, transfers)
    } catch (err) {
      reportError(err)
      return Promise.resolve([])
    }
  },
  ['transfer-history'],
  {
    tags: ['history'],
    revalidate: CACHE_REVALIDATE_IN_SECONDS,
  },
)

export async function POST(request: Request) {
  try {
    // Safely parses & validates the request body with a ZOD schema
    const requestValue = await ongoingTransfersSchema.spa(await request.json())
    const { searchParams } = new URL(request.url)
    const envParam = searchParams.get('env')
    const env = environmentFromStr(envParam || '')

    // Returns 400 if body does not respect the expected schema
    if (!requestValue.success) {
      const errorMessage = 'API_HISTORY_ROUTE: Failed to parse request'
      console.error(errorMessage, requestValue.error.errors)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    const { ongoingTransfers } = requestValue.data
    // Returns 200 if ongoingTransfers is empty
    if (!ongoingTransfers.length) return NextResponse.json([], { status: 200 })

    const history = await getCachedTransferHistory(env, ongoingTransfers)
    return NextResponse.json(history, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
