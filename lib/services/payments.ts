import { supabaseManager } from "@/lib/database/supabase-manager"
import type { Payment } from "@/lib/api/api"

/**
 * Get all payments for the current user
 */
export async function getUserPayments(): Promise<Payment[]> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    // First, try the nested query approach
    const { data, error } = await client
      .from("payments")
      .select(`
        *,
        credit_packs(name, credits_amount),
        invoices(invoice_number, invoice_url, status)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user payments:", error)
      throw new Error(`Failed to fetch payments: ${error.message}`)
    }

    // Debug: Log the raw data to see what's being returned
    console.log("Raw payment data:", JSON.stringify(data, null, 2))
    data?.forEach((payment: any) => {
      console.log(`Payment ${payment.id}:`, {
        hasInvoices: !!payment.invoices,
        invoiceCount: payment.invoices?.length || 0,
        invoiceData: payment.invoices
      })
    })

    // Fix invoice data structure - convert object to array if needed
    if (data && data.length > 0) {
      const paymentsWithFixedInvoices = data.map((payment: any) => {
        if (payment.invoices && typeof payment.invoices === 'object' && !Array.isArray(payment.invoices)) {
          // Convert invoice object to array format
          console.log(`Converting invoice object to array for payment ${payment.id}`)
          return {
            ...payment,
            invoices: [payment.invoices]
          }
        }
        return payment
      })
      
      return paymentsWithFixedInvoices || []
    }

    return data || []
  })
}

/**
 * Get a specific payment by ID for the current user
 */
export async function getUserPayment(paymentId: string): Promise<Payment> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    const { data, error } = await client
      .from("payments")
      .select(`
        *,
        credit_packs(name, credits_amount),
        invoices(invoice_number, invoice_url, status)
      `)
      .eq("id", paymentId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error("Payment not found")
      }
      console.error("Error fetching payment:", error)
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }

    return data
  })
}

/**
 * Get payment statistics for the current user
 */
export async function getUserPaymentStats(): Promise<{
  totalPayments: number
  totalSpent: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  totalCreditsEarned: number
}> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    const { data, error } = await client
      .from("payments")
      .select(`
        amount,
        status,
        credit_packs(credits_amount)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching payment stats:", error)
      throw new Error(`Failed to fetch payment statistics: ${error.message}`)
    }

    const stats = {
      totalPayments: data.length,
      totalSpent: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      totalCreditsEarned: 0
    }

    data.forEach((payment: any) => {
      const creditPack = Array.isArray(payment.credit_packs) 
        ? payment.credit_packs[0] 
        : payment.credit_packs

      switch (payment.status) {
        case 'succeeded':
          stats.successfulPayments++
          stats.totalSpent += payment.amount
          stats.totalCreditsEarned += creditPack?.credits_amount || 0
          break
        case 'pending':
          stats.pendingPayments++
          break
        case 'failed':
          stats.failedPayments++
          break
      }
    })

    return stats
  })
}

/**
 * Subscribe to payment updates for real-time notifications
 */
export function subscribeToUserPayments(
  userId: string,
  onUpdate: (payload: any) => void
) {
  return supabaseManager.createUserSubscription("payments", userId, onUpdate)
}

/**
 * Get recent payments for dashboard display
 */
export async function getRecentPayments(limit: number = 5): Promise<Payment[]> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    const { data, error } = await client
      .from("payments")
      .select(`
        *,
        credit_packs(name, credits_amount)
      `)
      .eq("user_id", userId)
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent payments:", error)
      throw new Error(`Failed to fetch recent payments: ${error.message}`)
    }

    return data || []
  })
}
