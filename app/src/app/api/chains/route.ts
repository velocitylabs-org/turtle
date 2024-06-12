import { REGISTRY } from '@/config/registry'
import { environmentFromStr } from '@/store/environmentStore'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const envParam = searchParams.get('environment')

  if (envParam == null)
    return Response.json({ error: "Invalid request: missing 'environment' param" }, { status: 400 })
  const environment = environmentFromStr(envParam)
  if (!environment)
    return Response.json(
      { error: "Invalid request: invalid 'environment' param: " + environment },
      { status: 400 },
    )

  // TODO: query right data and apply filters
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json(REGISTRY[environment].chains)
}
