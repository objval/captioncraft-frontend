"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useTransactions } from "@/hooks/use-transactions"
import { getCreditPacks } from "@/lib/credit-packs"
import { getUserPayments } from "@/lib/payments"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatTransactionReason } from "@/lib/utils/transaction-helpers"
import { 
  Coins, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Package,
  Receipt,
  AlertCircle,
  ChevronRight,
  Sparkles,
  FileText,
  ExternalLink,
  Gift,
  RefreshCcw,
  Users,
  Tag,
  Video,
  Captions
} from "lucide-react"
import type { CreditPack, Payment } from "@/lib/api"
import toast from "react-hot-toast"
import { createPayment } from "@/app/actions/payments"

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

  // Calculate stats
  const successfulPayments = payments.filter(p => p.status === 'succeeded')
  const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
  const invoiceCount = successfulPayments.filter(p => p.invoices?.[0]?.invoice_url).length

  const totalCreditsEarned = transactions
    .filter(t => t.amount_changed > 0)
    .reduce((sum, t) => sum + t.amount_changed, 0)

  const totalCreditsUsed = transactions
    .filter(t => t.amount_changed < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount_changed), 0)

  const creditPercentage = totalCreditsEarned > 0 
    ? ((totalCreditsEarned - totalCreditsUsed) / totalCreditsEarned) * 100
    : 0

  const isLowCredits = credits < 10

  return (
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

      {/* Credit Overview Card */}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Credit Usage</span>
                    <span className="font-medium">{creditPercentage.toFixed(0)}% remaining</span>
                  </div>
                  <Progress value={creditPercentage} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {totalCreditsUsed} of {totalCreditsEarned} credits used
                  </p>
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
                  <p className="text-sm font-medium text-slate-600">Total Spent</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingPayments ? (
                      <span className="inline-block h-9 w-24 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      <>₪{totalSpent.toFixed(2)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Across {successfulPayments.length} purchases
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText className="h-3 w-3" />
                  <span>{invoiceCount} invoices available</span>
                </div>
              </div>
            </div>

            {/* Credits Used */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Credits Processed</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {transactionsLoading ? (
                      <span className="inline-block h-9 w-12 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      totalCreditsUsed
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Videos processed: {transactions.filter(t => t.amount_changed < 0).length}
                </p>
                <p className="text-xs text-slate-500">
                  Average: 1 credit per video
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Purchase Section */}
      <div id="buy-credits">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Buy Credits</h2>
          <p className="text-sm text-slate-600">1 credit = 1 video upload</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingPacks ? (
            // Loading state for credit packs
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 bg-slate-200 rounded" />
                    <div className="h-5 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="h-8 w-20 bg-slate-200 rounded mb-1" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <div className="h-7 w-16 bg-slate-200 rounded mb-1" />
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="h-10 w-full bg-slate-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            creditPacks.map((pack) => {
            const isPopular = pack.credits_amount === 100
            const pricePerCredit = pack.price_nis / pack.credits_amount
            
            return (
              <Card 
                key={pack.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
                  isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handlePurchase(pack)}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-slate-600" />
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{pack.credits_amount}</p>
                      <p className="text-sm text-slate-600">credits</p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-2xl font-bold text-slate-900">₪{pack.price_nis}</p>
                      <p className="text-xs text-slate-600">₪{pricePerCredit.toFixed(2)} per credit</p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      disabled={purchasing === pack.id}
                    >
                      {purchasing === pack.id ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>Purchase</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-slate-600" />
              Recent Credit Usage
            </CardTitle>
            <CardDescription>Your latest video processing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionsLoading ? (
                // Loading state for transactions
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-200" />
                      <div>
                        <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded mb-1" />
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={Coins}
                  title="No transactions yet"
                  description="Your credit usage will appear here when you process videos"
                  className="py-8"
                />
              ) : (
                transactions.slice(0, 5).map((transaction) => {
                  const reason = transaction.reason?.toLowerCase() || ''
                  const isCredit = transaction.amount_changed > 0
                  
                  // Determine icon based on transaction type
                  let Icon = isCredit ? TrendingUp : Video
                  if (isCredit) {
                    if (reason.includes('purchase')) Icon = CreditCard
                    else if (reason.includes('bonus')) Icon = Gift
                    else if (reason.includes('welcome')) Icon = Sparkles
                    else if (reason.includes('refund')) Icon = RefreshCcw
                    else if (reason.includes('referral')) Icon = Users
                    else if (reason.includes('promo')) Icon = Tag
                  } else {
                    if (reason.includes('caption') || reason.includes('burning')) Icon = Captions
                    else if (reason.includes('transcription')) Icon = FileText
                  }
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isCredit
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {formatTransactionReason(transaction.reason)}
                          </p>
                          <DateDisplay date={transaction.created_at} format="relative" className="text-xs text-slate-500" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          isCredit ? 'text-green-600' : 'text-slate-700'
                        }`}>
                          {isCredit ? '+' : ''}{transaction.amount_changed}
                        </p>
                        <p className="text-xs text-slate-500">Balance: {transaction.balance_after}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-slate-600" />
              Purchase History
            </CardTitle>
            <CardDescription>Your recent credit purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingPayments ? (
                // Loading state for payments
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-200" />
                      <div>
                        <div className="h-4 w-28 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="h-4 w-16 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                ))
              ) : payments.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No purchases yet"
                  description="Your purchase history will appear here after your first credit purchase"
                  action={{
                    label: "Buy Credits",
                    onClick: () => document.getElementById('buy-credits')?.scrollIntoView({ behavior: 'smooth' }),
                    variant: "outline"
                  }}
                  className="py-8"
                />
              ) : (
                payments.slice(0, 5).map((payment) => {
                  const invoice = payment.invoices?.[0]
                  const hasInvoice = invoice?.invoice_url && payment.status === 'succeeded'
                  
                  return (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {payment.credit_pack?.name || 'Credit Purchase'}
                        </p>
                        <DateDisplay date={payment.created_at} format="relative" className="text-xs text-slate-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold">₪{payment.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">
                          {payment.credit_pack?.credits_amount || 0} credits
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={payment.status} showIcon={false} className="text-xs" />
                        {hasInvoice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(invoice.invoice_url, '_blank')
                            }}
                            title="View Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Purchase History with Invoices */}
      {payments.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-slate-600" />
                Complete Purchase History
              </span>
              <span className="text-sm font-normal text-slate-600">
                {payments.filter(p => p.status === 'succeeded').length} successful purchases
              </span>
            </CardTitle>
            <CardDescription>All your credit purchases with downloadable invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-sm text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-slate-700">Package</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-slate-700">Credits</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-slate-700">Amount</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-slate-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-slate-700">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const invoice = payment.invoices?.[0]
                    const hasInvoice = invoice?.invoice_url && payment.status === 'succeeded'
                    
                    return (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <DateDisplay date={payment.created_at} format="smart" className="text-sm text-slate-600" />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-sm">{payment.credit_pack?.name || 'Credit Purchase'}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="text-sm font-medium">{payment.credit_pack?.credits_amount || 0}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-semibold text-sm">₪{payment.amount.toFixed(2)}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={payment.status} showIcon={true} className="text-xs" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasInvoice ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              onClick={() => window.open(invoice.invoice_url, '_blank')}
                            >
                              <FileText className="h-3 w-3" />
                              <span className="hidden sm:inline">Invoice</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white shadow-sm">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Need more credits?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Purchase credits in bulk for better value. Each credit allows you to process one video.
                </p>
              </div>
            </div>
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              View Plans
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}