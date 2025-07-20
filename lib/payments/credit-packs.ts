import { supabaseManager } from "@/lib/database/supabase-manager"
import type { CreditPack } from "@/lib/api/api"

/**
 * Get all available credit packs
 */
export async function getCreditPacks(): Promise<CreditPack[]> {
  const client = supabaseManager.getClient()

  const { data, error } = await client
    .from("credit_packs")
    .select("*")
    .order("credits_amount", { ascending: true })

  if (error) {
    // Error fetching credit packs
    throw new Error(`Failed to fetch credit packs: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific credit pack by ID
 */
export async function getCreditPack(packId: string): Promise<CreditPack> {
  const client = supabaseManager.getClient()

  const { data, error } = await client
    .from("credit_packs")
    .select("*")
    .eq("id", packId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error("Credit pack not found")
    }
    // Error fetching credit pack
    throw new Error(`Failed to fetch credit pack: ${error.message}`)
  }

  return data
}

/**
 * Subscribe to credit pack changes (for admin updates)
 */
export function subscribeToCreditPacks(
  onUpdate: (packs: CreditPack[]) => void
) {
  return supabaseManager.createSubscription(
    "credit_packs",
    async () => {
      // Refetch all packs when any change occurs
      try {
        const updatedPacks = await getCreditPacks()
        onUpdate(updatedPacks)
      } catch (error) {
        // Error refetching credit packs
      }
    }
  )
}

/**
 * Get credit pack statistics for analytics
 */
export async function getCreditPackStats(): Promise<{
  totalPacks: number
  minCredits: number
  maxCredits: number
  averagePrice: number
}> {
  const client = supabaseManager.getClient()

  const { data, error } = await client
    .from("credit_packs")
    .select("credits_amount, price_nis")

  if (error) {
    // Error fetching credit pack stats
    throw new Error(`Failed to fetch credit pack statistics: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return {
      totalPacks: 0,
      minCredits: 0,
      maxCredits: 0,
      averagePrice: 0
    }
  }

  const stats = {
    totalPacks: data.length,
    minCredits: Math.min(...data.map((pack: any) => pack.credits_amount)),
    maxCredits: Math.max(...data.map((pack: any) => pack.credits_amount)),
    averagePrice: data.reduce((sum: number, pack: any) => sum + pack.price_nis, 0) / data.length
  }

  return stats
}
