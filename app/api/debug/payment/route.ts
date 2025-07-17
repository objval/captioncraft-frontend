import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getHypayConfig } from '@/lib/hypay-test-utils'

export async function GET() {
  try {
    const config = getHypayConfig()
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Check credit packs
    const { data: creditPacks, error: packsError } = await supabase
      .from('credit_packs')
      .select('*')
      .limit(1)
    
    // Check payments table structure
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(1)
    
    return NextResponse.json({
      config: {
        testMode: config.testMode,
        masof: config.masof,
        userId: config.userId
      },
      auth: {
        authenticated: !!user,
        userId: user?.id,
        authError: authError?.message
      },
      database: {
        creditPacks: {
          available: !!creditPacks,
          count: creditPacks?.length || 0,
          error: packsError?.message
        },
        payments: {
          accessible: !!payments,
          error: paymentsError?.message
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        testMode: process.env.HYPAY_TEST_MODE
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}