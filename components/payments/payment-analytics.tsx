"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { getUserPayments, getUserPaymentStats } from "@/lib/payments"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  FileText,
  Award,
  Target
} from "lucide-react"
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import type { Payment } from "@/lib/api"

interface PaymentStats {
  totalPayments: number
  totalSpent: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  totalCreditsEarned: number
  averageOrderValue: number
  monthlySpending: Array<{
    month: string
    amount: number
    credits: number
  }>
  topCreditPacks: Array<{
    name: string
    count: number
    totalSpent: number
  }>
}

export default function PaymentAnalytics() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y' | 'all'>('6m')

  useEffect(() => {
    const loadPaymentData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        
        // Load payments and basic stats
        const [paymentsData, basicStats] = await Promise.all([
          getUserPayments(),
          getUserPaymentStats()
        ])

        setPayments(paymentsData)

        // Calculate enhanced analytics
        const enhancedStats = calculateEnhancedStats(paymentsData, basicStats)
        setStats(enhancedStats)

      } catch (error) {
        console.error("Failed to load payment analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPaymentData()
  }, [user?.id, selectedPeriod])

  const calculateEnhancedStats = (payments: Payment[], basicStats: any): PaymentStats => {
    const successfulPayments = payments.filter(p => p.status === 'succeeded')
    
    // Monthly spending analysis
    const monthlyData = new Map<string, { amount: number, credits: number }>()
    
    successfulPayments.forEach(payment => {
      const monthKey = format(new Date(payment.created_at), 'yyyy-MM')
      const existing = monthlyData.get(monthKey) || { amount: 0, credits: 0 }
      
      monthlyData.set(monthKey, {
        amount: existing.amount + payment.amount,
        credits: existing.credits + (payment.credit_packs?.credits_amount || 0)
      })
    })

    const monthlySpending = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months

    // Top credit packs analysis
    const packCounts = new Map<string, { count: number, totalSpent: number }>()
    
    successfulPayments.forEach(payment => {
      const packName = payment.credit_packs?.name || 'Unknown Pack'
      const existing = packCounts.get(packName) || { count: 0, totalSpent: 0 }
      
      packCounts.set(packName, {
        count: existing.count + 1,
        totalSpent: existing.totalSpent + payment.amount
      })
    })

    const topCreditPacks = Array.from(packCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    return {
      ...basicStats,
      averageOrderValue: successfulPayments.length > 0 
        ? basicStats.totalSpent / successfulPayments.length 
        : 0,
      monthlySpending,
      topCreditPacks
    }
  }

  const getSuccessRate = () => {
    if (!stats || stats.totalPayments === 0) return 0
    return Math.round((stats.successfulPayments / stats.totalPayments) * 100)
  }

  const getTrendDirection = (currentMonth: number, previousMonth: number) => {
    if (currentMonth > previousMonth) return 'up'
    if (currentMonth < previousMonth) return 'down'
    return 'stable'
  }

  const exportPaymentData = () => {
    if (!payments.length) return

    const csvData = payments.map(payment => ({
      Date: format(new Date(payment.created_at), 'yyyy-MM-dd'),
      'Credit Pack': payment.credit_packs?.name || 'N/A',
      'Amount (₪)': payment.amount,
      Credits: payment.credit_packs?.credits_amount || 0,
      Status: payment.status,
      'Transaction ID': payment.hypay_transaction_id || 'N/A',
      'Invoice Number': payment.invoices?.[0]?.invoice_number || 'N/A'
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No payment data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalPayments} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreditsEarned}</div>
            <p className="text-xs text-muted-foreground">
              ₪{(stats.totalSpent / stats.totalCreditsEarned || 0).toFixed(2)} per credit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSuccessRate()}%</div>
            <Progress value={getSuccessRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.averageOrderValue / (stats.totalCreditsEarned / stats.successfulPayments || 1)).toFixed(1)} credits avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="3m">3 Months</TabsTrigger>
            <TabsTrigger value="6m">6 Months</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" onClick={exportPaymentData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Spending Trend
              </CardTitle>
              <CardDescription>
                Your spending and credit acquisition over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlySpending.map((month, index) => {
                  const maxAmount = Math.max(...stats.monthlySpending.map(m => m.amount))
                  const percentage = (month.amount / maxAmount) * 100
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <div className="text-right">
                          <div className="font-semibold">₪{month.amount.toFixed(2)}</div>
                          <div className="text-muted-foreground">{month.credits} credits</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Credit Packs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Most Popular Credit Packs
              </CardTitle>
              <CardDescription>
                Your preferred credit pack purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCreditPacks.map((pack, index) => {
                  const maxSpent = Math.max(...stats.topCreditPacks.map(p => p.totalSpent))
                  const percentage = (pack.totalSpent / maxSpent) * 100
                  
                  return (
                    <div key={pack.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{pack.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pack.count} purchases
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₪{pack.totalSpent.toFixed(2)}</div>
                          <Badge variant="secondary" className="mt-1">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.successfulPayments}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingPayments}
                  </div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failedPayments}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
