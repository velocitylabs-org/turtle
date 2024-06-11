import { REGISTRY } from '@/config/registry'
import { Environment } from '@/store/environmentStore'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const environmentParam = searchParams.get('environment')
  if (environmentParam == null)
    return Response.json({ error: "Invalid request: missing 'environment' param" }, { status: 400 })
  const environment = Environment[environmentParam as keyof typeof Environment]

  const sourceChain = searchParams.get('sourceChain')
  const destChain = searchParams.get('destChain')

  // TODO: query right data and apply filters
  await new Promise(resolve => setTimeout(resolve, 500)) // sleep 500ms

  return NextResponse.json(REGISTRY[environment].tokens)
}
