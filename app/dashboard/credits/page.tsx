"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useTransactions } from "@/hooks/use-transactions"
import { getCreditPacks } from "@/lib/credit-packs"
import { getUserPayments } from "@/lib/payments"
import type { CreditPack, Payment } from "@/lib/api"
import toast from "react-hot-toast"
import { initiateHypayPayment } from "@/app/actions/payments"

// Import credit components
import { CreditOverview } from "@/components/dashboard/credits/CreditOverview"
import { CreditPacksGrid } from "@/components/dashboard/credits/CreditPacksGrid"
import { TransactionHistory } from "@/components/dashboard/credits/TransactionHistory"
import { PaymentHistory } from "@/components/dashboard/credits/PaymentHistory"
import { InvoiceTable } from "@/components/dashboard/credits/InvoiceTable"
import { HelpSection } from "@/components/dashboard/credits/HelpSection"

export default function CreditsPage() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id)
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [loadingPacks, setLoadingPacks] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadCreditPacks(),
        user?.id ? loadPayments() : Promise.resolve()
      ])
      setIsInitialLoad(false)
    }
    loadData()
  }, [user?.id])

  const loadCreditPacks = async () => {
    try {
      const packs = await getCreditPacks()
      setCreditPacks(packs)
    } catch (error) {
      console.error("Error loading credit packs:", error)
      toast.error("Failed to load credit packs")
    } finally {
      setLoadingPacks(false)
    }
  }

  const loadPayments = async () => {
    try {
      const userPayments = await getUserPayments()
      setPayments(userPayments)
    } catch (error) {
      console.error("Error loading payments:", error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const handlePurchase = async (pack: CreditPack) => {
    if (!user) {
      toast.error("Please login to purchase credits")
      return
    }

    setPurchasing(pack.id)
    try {
      const result = await createPayment(pack.id)
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("Failed to initiate purchase. Please try again.")
    } finally {
      setPurchasing(null)
    }
  }

  const scrollToBuyCredits = () => {
    document.getElementById('buy-credits')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Billing & Credits
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your credits and view your billing history
        </p>
      </div>

      {/* Credit Overview */}
      <CreditOverview
        credits={credits}
        creditsLoading={creditsLoading}
        payments={payments}
        loadingPayments={loadingPayments}
        transactions={transactions}
        transactionsLoading={transactionsLoading}
      />

      {/* Quick Purchase Section */}
      <CreditPacksGrid
        creditPacks={creditPacks}
        loadingPacks={loadingPacks}
        purchasing={purchasing}
        onPurchase={handlePurchase}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <TransactionHistory 
          transactions={transactions} 
          transactionsLoading={transactionsLoading} 
        />

        {/* Recent Payments */}
        <PaymentHistory 
          payments={payments} 
          loadingPayments={loadingPayments}
          onBuyCredits={scrollToBuyCredits}
        />
      </div>

      {/* Full Purchase History with Invoices */}
      <InvoiceTable payments={payments} />

      {/* Help Section */}
      <HelpSection />
      </div>
    </div>
  )
}