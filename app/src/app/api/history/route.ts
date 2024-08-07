export const fetchCache = 'default-no-store' // Dont cache fetches unless asked.
export const dynamic = 'force-dynamic' // Always run dynamically
export const revalidate = 30 // Keep cache for 2 minutes
export const maxDuration = 90 // Timout adter

import { getEnvironment } from '@/context/snowbridge'
import { Environment } from '@/store/environmentStore'
import { shouldUseTestnet } from '@/utils/env'
import {
  HISTORY_IN_SECONDS,
  SKIP_LIGHT_CLIENT_UPDATES,
  getErrorMessage,
  getTransferHistory,
} from '@/utils/snowbridge'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

const CACHE_REVALIDATE_IN_SECONDS = 30

const getCachedTransferHistory = unstable_cache(
  () => {
    const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)

    try {
      return getTransferHistory(env, SKIP_LIGHT_CLIENT_UPDATES, HISTORY_IN_SECONDS)
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

export async function GET() {
  try {
    const history = await getCachedTransferHistory()
    return NextResponse.json(history)
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
