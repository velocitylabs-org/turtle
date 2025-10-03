import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const isDevelopment = process.env.NODE_ENV === 'development'
const vercelDomain = process.env.NEXT_PUBLIC_VERCEL_URL
const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''
const allowedOrigins = isDevelopment
  ? ['http://localhost:3000', 'http://localhost:5173']
  : [vercelUrl, 'https://turtle.cool']

export function middleware(request: NextRequest) {
  // Only handle API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const origin = request.headers.get('origin')
  const response = NextResponse.next()
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 200 })

    if (origin && allowedOrigins.includes(origin)) {
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin)
    }

    preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS')
    preflightResponse.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    )

    return preflightResponse
  }

  // Set CORS headers for actual requests
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )

  return response
}

export const config = {
  matcher: '/api/:path*',
}
