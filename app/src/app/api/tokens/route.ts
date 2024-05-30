import { testTokens } from '@/__tests__/testdata'
import { Token } from '@/models/token'
import { NextRequest, NextResponse } from 'next/server'

const mockTokens: Token[] = testTokens

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sourceChain = searchParams.get('sourceChain')
  const destChain = searchParams.get('destChain')

  // TODO: query right data and apply filters
  await new Promise(resolve => setTimeout(resolve, 500)) // sleep 500ms

  return NextResponse.json(testTokens)
}
