export const fetchCache = 'default-no-store' // Dont cache fetches unless asked.
export const dynamic = 'force-dynamic' // Always run dynamically
export const revalidate = 30 // Keep cache for 2 minutes
export const maxDuration = 90 // Timout adter

import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { getEnvironment } from '@/context/snowbridge'
import { ongoingTransfersSchema } from '@/models/api-schemas'
import { OngoingTransferWithDirection, PendingTransfers } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { shouldUseTestnet } from '@/utils/env'
import {
  SKIP_LIGHT_CLIENT_UPDATES,
  getErrorMessage,
  getTransferHistory,
} from '@/utils/snowbridge'

const CACHE_REVALIDATE_IN_SECONDS = 30

const getCachedTransferHistory = unstable_cache(
  (ongoingTransfers: OngoingTransferWithDirection[]) => {
    const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)

    try {
      const transfers: PendingTransfers = {
        toPolkadot: [],
        toEthereum: [],
      }

      ongoingTransfers.map(transfer => {
        if (transfer.direction === Direction.ToEthereum) {
          transfers.toEthereum.push(transfer)
        } else {
          transfers.toPolkadot.push(transfer)
        }
        return transfer
      })

      return getTransferHistory(env, transfers, SKIP_LIGHT_CLIENT_UPDATES)
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
    // Safe parses & valid the request body with our ZOD schema
    const requestValue = await ongoingTransfersSchema.spa(await request.json());

    // Returns 400 if body does not respect the expected schema
    if (!requestValue.success) {
      return NextResponse.json({ error: requestValue.error }, { status: 400 })
    }
    const { ongoingTransfers } = requestValue.data
    // Returns 200 if ongoingTransfers is empty  
    if (!ongoingTransfers.length) return NextResponse.json([], { status: 200 })

    const history = await getCachedTransferHistory(ongoingTransfers)
    return NextResponse.json(history, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
