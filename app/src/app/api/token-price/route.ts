import { tokenPriceSchema } from '@/models/api-schemas'
import { getCoingekoId } from '@/models/token'
import { CACHE_REVALIDATE_IN_SECONDS, getTokenPrice } from '@/services/balance'
import { getErrorMessage } from '@/utils/transferTracking'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const requestValue = await tokenPriceSchema.spa(await request.json())
    if (!requestValue.success) {
      console.log('API_TOKEN_PRICE_ROUTE: Failed to parse request')
      return NextResponse.json({ error: requestValue.error }, { status: 400 })
    }

    const { token } = requestValue.data
    if (!token) return NextResponse.json({ error: 'Token is undefined in API' }, { status: 400 })

    const fetchTokenPrice = unstable_cache(
      async () => {
        return await getTokenPrice(getCoingekoId(token))
      },
      [`tokenPrice-${token.id}`],
      {
        revalidate: CACHE_REVALIDATE_IN_SECONDS,
      },
    )

    const tokenPrice = await fetchTokenPrice()
    return NextResponse.json(tokenPrice, { status: 200 })
  } catch (err) {
    console.error('Error in token price API:', err)
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
