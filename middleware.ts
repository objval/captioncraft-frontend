import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

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

  // Update session first
  const response = await updateSession(request)

  // Check for banned users and admin access
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, role')
        .eq('id', user.id)
        .single()

      // If user is banned, redirect to banned page
      if (profile?.is_banned) {
        return NextResponse.redirect(new URL('/banned', request.url))
      }

      // Check admin access
      if (request.nextUrl.pathname.startsWith('/dashboard/admin') && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
