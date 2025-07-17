import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Global flag to ensure we only log once
declare global {
  var environmentLogged: boolean | undefined
}

export async function middleware(request: NextRequest) {
  // Log test environment status on first request
  if (request.nextUrl.pathname === '/' && !global.environmentLogged) {
    global.environmentLogged = true
    
    const isTestMode = process.env.HYPAY_TEST_MODE === 'true'
    
    if (isTestMode) {
      console.log(`
🧪 HYPAY TEST MODE ACTIVE
═══════════════════════
Terminal: 0010020610
PassP: yaad
UserId: 203269535
Test Card: 5326105300985614
Test CVV: 125
Test Amounts: 5, 10, 29, 50 NIS

⚠️  No real charges will be made
Environment: ${process.env.NODE_ENV}
Test Mode: ${process.env.HYPAY_TEST_MODE}
      `)
    } else {
      console.log(`
💳 HYPAY PRODUCTION MODE
═══════════════════════
Terminal: ${process.env.HYPAY_MASOF || 'Not Set'}
⚠️  REAL CHARGES WILL BE MADE
      `)
    }
  }

  // Skip auth for debug endpoints
  if (request.nextUrl.pathname.startsWith('/api/debug/')) {
    return
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
