import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Coins, CreditCard, TrendingUp, FileText } from "lucide-react"
import { useMemo } from "react"
import type { Payment, Transaction } from "@/lib/api/api"

interface CreditOverviewProps {
  credits: number
  creditsLoading: boolean
  payments: Payment[]
  loadingPayments: boolean
  transactions: Transaction[]
  transactionsLoading: boolean
}

export function CreditOverview({
  credits,
  creditsLoading,
  payments,
  loadingPayments,
  transactions,
  transactionsLoading,
}: CreditOverviewProps) {
  // Memoize payment calculations
  const paymentStats = useMemo(() => {
    const successfulPayments = payments.filter(p => p.status === 'succeeded')
    const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
    const invoiceCount = successfulPayments.filter(p => p.invoices?.[0]?.invoice_url).length
    const totalCreditsPurchased = successfulPayments.reduce((sum, p) => sum + (p.credit_pack?.credits_amount || 0), 0)
    
    return {
      successfulPayments,
      totalSpent,
      invoiceCount,
      totalCreditsPurchased
    }
  }, [payments])

  const isLowCredits = credits < 10

  // Memoize monthly stats calculations
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.created_at)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    return {
      videoUploadsThisMonth: thisMonthTransactions.filter(t => t.amount_changed === -1).length,
      burnInJobsThisMonth: thisMonthTransactions.filter(t => t.amount_changed === -5).length,
      creditsUsedThisMonth: thisMonthTransactions
        .filter(t => t.amount_changed < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount_changed), 0)
    }
  }, [transactions])

  // Memoize all-time stats calculations
  const allTimeStats = useMemo(() => {
    const totalVideoUploads = transactions.filter(t => t.amount_changed === -1).length
    const totalBurnInJobs = transactions.filter(t => t.amount_changed === -5).length
    const totalCreditsUsed = transactions
      .filter(t => t.amount_changed < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount_changed), 0)
    
    return {
      totalVideoUploads,
      totalBurnInJobs,
      totalCreditsUsed
    }
  }, [transactions])

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Current Balance */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Current Balance</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {creditsLoading ? (
                      <span className="inline-block h-9 w-16 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      credits
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {isLowCredits && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Running low on credits. Top up to continue processing videos.
                </p>
              </div>
            )}
            
            {!isLowCredits && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Activity This Month</p>
                  <p className="text-xs font-medium text-slate-700">{monthlyStats.creditsUsedThisMonth} credits</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Videos uploaded</span>
                    <span className="text-xs font-medium">{monthlyStats.videoUploadsThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Captions burned</span>
                    <span className="text-xs font-medium">{monthlyStats.burnInJobsThisMonth}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Spent */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Invested</p>
                <p className="text-3xl font-bold text-slate-900">
                  {loadingPayments ? (
                    <span className="inline-block h-9 w-24 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <>₪{paymentStats.totalSpent.toFixed(2)}</>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Credit packs</span>
                <span className="text-sm font-medium">{paymentStats.successfulPayments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total credits</span>
                <span className="text-sm font-medium">{paymentStats.totalCreditsPurchased}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {paymentStats.totalCreditsPurchased > 0 
                  ? `${((allTimeStats.totalCreditsUsed / paymentStats.totalCreditsPurchased) * 100).toFixed(0)}% utilized`
                  : 'No credits purchased yet'}
              </p>
            </div>
          </div>

          {/* All-Time Activity */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">All-Time Activity</p>
                <p className="text-3xl font-bold text-slate-900">
                  {transactionsLoading ? (
                    <span className="inline-block h-9 w-12 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    allTimeStats.totalVideoUploads + allTimeStats.totalBurnInJobs
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Videos uploaded</span>
                <span className="text-sm font-medium">{allTimeStats.totalVideoUploads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Captions burned</span>
                <span className="text-sm font-medium">{allTimeStats.totalBurnInJobs}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}