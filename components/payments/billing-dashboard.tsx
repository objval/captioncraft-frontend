"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useTransactions } from "@/hooks/use-transactions"
import { getUserPaymentStats } from "@/lib/payments"
import { getCreditPacks } from "@/lib/credit-packs"
import PaymentAnalytics from "./payment-analytics"
import PaymentHistory from "./payment-history"
import { 
  Wallet, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Coins,
  Target,
  Zap,
  Crown,
  Shield,
  Gift2,
  Bell,
  Settings,
  BarChart3
} from "lucide-react"
import { format, startOfMonth, endOfMonth, subDays } from "date-fns"
import toast from "react-hot-toast"

interface BillingOverview {
  currentBalance: number
  monthlySpending: number
  totalSpent: number
  creditsEarned: number
  averageOrderValue: number
  nextBillingDate?: string
  estimatedMonthlyUsage: number
  creditUsageRate: number
}

export default function BillingDashboard() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { transactions } = useTransactions(user?.id)
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'warning' | 'info' | 'success'
    title: string
    message: string
    action?: string
  }>>([])

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        
        // Load payment stats and calculate overview
        const paymentStats = await getUserPaymentStats()
        const creditPacks = await getCreditPacks()
        
        // Calculate monthly spending (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30)
        const recentTransactions = transactions.filter(t => 
          new Date(t.created_at) >= thirtyDaysAgo && t.amount_changed > 0
        )
        const monthlySpending = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount_changed), 0)
        
        // Calculate credit usage rate (credits used per day)
        const usageTransactions = transactions.filter(t => 
          new Date(t.created_at) >= thirtyDaysAgo && t.amount_changed < 0
        )
        const creditsUsed = Math.abs(usageTransactions.reduce((sum, t) => sum + t.amount_changed, 0))
        const creditUsageRate = creditsUsed / 30 // credits per day

        const billingOverview: BillingOverview = {
          currentBalance: credits,
          monthlySpending: monthlySpending,
          totalSpent: paymentStats.totalSpent,
          creditsEarned: paymentStats.totalCreditsEarned,
          averageOrderValue: paymentStats.totalSpent / (paymentStats.successfulPayments || 1),
          estimatedMonthlyUsage: creditUsageRate * 30,
          creditUsageRate: creditUsageRate
        }

        setOverview(billingOverview)

        // Generate smart notifications
        generateNotifications(billingOverview, creditPacks)

      } catch (error) {
        console.error("Failed to load billing data:", error)
        toast.error("Failed to load billing information")
      } finally {
        setLoading(false)
      }
    }

    loadBillingData()
  }, [user?.id, credits, transactions])

  const generateNotifications = (overview: BillingOverview, creditPacks: any[]) => {
    const newNotifications = []

    // Low balance warning
    if (overview.currentBalance <= 5) {
      newNotifications.push({
        id: 'low-balance',
        type: 'warning' as const,
        title: 'Low Credit Balance',
        message: `You have only ${overview.currentBalance} credits remaining. Consider purchasing more to avoid interruptions.`,
        action: 'Buy Credits'
      })
    }

    // High usage warning
    if (overview.creditUsageRate > 5) {
      const daysRemaining = Math.floor(overview.currentBalance / overview.creditUsageRate)
      newNotifications.push({
        id: 'high-usage',
        type: 'warning' as const,
        title: 'High Usage Detected',
        message: `At your current usage rate (${overview.creditUsageRate.toFixed(1)} credits/day), your credits will last approximately ${daysRemaining} days.`,
        action: 'View Usage'
      })
    }

    // Spending milestone
    if (overview.totalSpent >= 500 && overview.totalSpent < 600) {
      newNotifications.push({
        id: 'spending-milestone',
        type: 'info' as const,
        title: 'Spending Milestone',
        message: `You've spent over ₪500 on Caption Craft! Thank you for your continued support.`,
      })
    }

    // Efficiency tip
    if (overview.averageOrderValue < 50 && overview.totalSpent > 100) {
      newNotifications.push({
        id: 'efficiency-tip',
        type: 'info' as const,
        title: 'Save Money Tip',
        message: 'Consider purchasing larger credit packs to get better value per credit.',
        action: 'View Packs'
      })
    }

    setNotifications(newNotifications)
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const exportBillingData = () => {
    if (!overview) return

    const billingData = {
      'Current Balance': overview.currentBalance,
      'Monthly Spending (₪)': overview.monthlySpending.toFixed(2),
      'Total Spent (₪)': overview.totalSpent.toFixed(2),
      'Credits Earned': overview.creditsEarned,
      'Average Order Value (₪)': overview.averageOrderValue.toFixed(2),
      'Estimated Monthly Usage': overview.estimatedMonthlyUsage.toFixed(1),
      'Daily Usage Rate': overview.creditUsageRate.toFixed(2),
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    const csv = [
      'Metric,Value',
      ...Object.entries(billingData).map(([key, value]) => `"${key}","${value}"`)
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Billing data exported successfully")
  }

  const getUsageColor = (usagePercentage: number) => {
    if (usagePercentage >= 80) return "text-red-600"
    if (usagePercentage >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading || creditsLoading) {
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

  if (!overview) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No billing data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your credits, track spending, and optimize your usage
          </p>
        </div>
        <Button variant="outline" onClick={exportBillingData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`border-l-4 ${
              notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              notification.type === 'success' ? 'border-l-green-500 bg-green-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.action && (
                      <Button size="sm" variant="outline">
                        {notification.action}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{overview.monthlySpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg per purchase</span>
                <span>₪{overview.averageOrderValue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.creditsEarned}</div>
            <p className="text-xs text-muted-foreground">
              Credits purchased
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cost per credit</span>
                <span>₪{(overview.totalSpent / overview.creditsEarned || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Forecast</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(overview.currentBalance / (overview.creditUsageRate || 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Days remaining
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Monthly estimate</span>
                <span>{overview.estimatedMonthlyUsage.toFixed(0)} credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Credit Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Credit Usage Overview
              </CardTitle>
              <CardDescription>
                Your credit consumption patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {overview.currentBalance}
                    </div>
                    <div className="text-sm text-blue-700">Available Now</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {overview.creditsEarned}
                    </div>
                    <div className="text-sm text-green-700">Total Earned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.max(0, overview.creditsEarned - overview.currentBalance)}
                    </div>
                    <div className="text-sm text-purple-700">Credits Used</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Credit Usage</span>
                    <span className={getUsageColor(Math.max(0, (overview.creditsEarned - overview.currentBalance) / overview.creditsEarned * 100))}>
                      {Math.max(0, ((overview.creditsEarned - overview.currentBalance) / overview.creditsEarned * 100)).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, (overview.creditsEarned - overview.currentBalance) / overview.creditsEarned * 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="analytics">
          <PaymentAnalytics />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Manage your billing preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Low Balance Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when credits run low
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Monthly Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive monthly spending summaries
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Invoice Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      How you receive invoices
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
