import { testchains } from '@/__tests__/testdata'
import { Chain } from '@/models/chain'
import { NextRequest, NextResponse } from 'next/server'

const mockChains: Chain[] = testchains

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const sourceChain = searchParams.get('sourceChain')
  const destChain = searchParams.get('destChain')

  // TODO: query right data and apply filters
  await new Promise(resolve => setTimeout(resolve, 500)) // sleep 500ms

  return NextResponse.json(mockChains)
}
