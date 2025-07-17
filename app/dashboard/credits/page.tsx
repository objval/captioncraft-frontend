"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useTransactions, getTransactionDisplayName } from "@/hooks/use-transactions"
import { getCreditPacks } from "@/lib/credit-packs"
import { getUserProfile } from "@/lib/profiles"
import { api } from "@/lib/api"
import { 
  Coins, 
  CreditCard, 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Shield, 
  TrendingUp,
  Activity,
  ArrowRight,
  Gift,
  Clock,
  Info
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BillingDashboard from "@/components/payments/billing-dashboard"
import { initiateHypayPayment } from "@/app/actions/payments"

interface CreditPack {
  id: string
  name: string
  credits_amount: number
  price_nis: number
  popular?: boolean
  bonus?: number
}

export default function CreditsPage() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id)
  
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Load credit packs and transactions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load credit packs
        const packs = await getCreditPacks()
        
        // Add popular flag and bonus for display
        const enhancedPacks = packs.map((pack: any) => ({
          ...pack,
          popular: pack.credits_amount === 10, // Pro pack with 10 credits is popular
          bonus: pack.credits_amount >= 50 ? Math.floor(pack.credits_amount * 0.1) : 0
        }))
        
        setCreditPacks(enhancedPacks)
      } catch (error) {
        console.error("Failed to load credit data:", error)
        toast.error("Failed to load credit information")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load user profile for payment validation
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        const profileData = await getUserProfile()
        setProfile(profileData)
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const isProfileComplete = () => {
    if (!profile) return false
    return !!(
      profile.first_name &&
      profile.last_name &&
      profile.phone_number &&
      profile.street &&
      profile.city
    )
  }

  const handlePurchase = async (pack: CreditPack) => {
    console.log("Attempting purchase for pack:", pack)
    
    if (!user?.id) {
      toast.error("Please sign in to purchase credits")
      return
    }

    // Check if profile is complete before allowing payment
    if (!isProfileComplete()) {
      toast.error("Please complete your profile before making a purchase")
      // Redirect to profile page with a message
      setTimeout(() => {
        window.location.href = "/dashboard/profile"
      }, 1500)
      return
    }

    setPurchasing(pack.id)
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Redirecting to payment page...")
      
      // Initiate payment with backend
      console.log("Calling initiateHypayPayment with ID:", pack.id)
      const { paymentUrl } = await initiateHypayPayment(pack.id)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      // Redirect user to Hypay payment page
      console.log("Redirecting to:", paymentUrl)
      window.location.href = paymentUrl
      
    } catch (error) {
      console.error("Purchase failed:", error)
      toast.error("Failed to initiate payment. Please try again.")
    } finally {
      setPurchasing(null)
    }
  }

  const getPackIcon = (pack: CreditPack) => {
    if (pack.credits_amount >= 100) return <Crown className="h-6 w-6" />
    if (pack.credits_amount >= 50) return <Shield className="h-6 w-6" />
    if (pack.credits_amount >= 20) return <Zap className="h-6 w-6" />
    return <Coins className="h-6 w-6" />
  }

  const getPackColor = (pack: CreditPack) => {
    if (pack.credits_amount >= 100) return "from-purple-500 to-purple-600"
    if (pack.credits_amount >= 50) return "from-blue-500 to-blue-600"
    if (pack.credits_amount >= 20) return "from-green-500 to-green-600"
    return "from-gray-500 to-gray-600"
  }

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-500" />
    ) : (
              <Activity className="h-4 w-4 text-slate-500" />
    )
  }

  const calculateValuePerCredit = (pack: CreditPack) => {
    return (pack.price_nis / pack.credits_amount).toFixed(2)
  }

  const getBestValue = () => {
    if (creditPacks.length === 0) return null
    return creditPacks.reduce((best, pack) => 
      parseFloat(calculateValuePerCredit(pack)) < parseFloat(calculateValuePerCredit(best)) ? pack : best
    )
  }

  if (loading || creditsLoading || transactionsLoading || profileLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const bestValue = getBestValue()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Credits & Billing</h1>
        <p className="text-muted-foreground">
          Manage your credits, track spending, and view payment history
        </p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-blue-600" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{credits}</div>
              <div className="text-sm text-muted-foreground">Available credits</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Each credit = 1 video upload</div>
              <div className="text-sm text-muted-foreground">Enough for {credits} videos</div>
            </div>
          </div>

          {credits < 5 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Low Credit Warning</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                You're running low on credits. Consider purchasing more to continue uploading videos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Completion Warning */}
      {!isProfileComplete() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                <Info className="h-4 w-4 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-amber-900">Complete Your Profile</h3>
                <p className="text-sm text-amber-700">
                  Please complete your profile information (name, phone, and address) before making a purchase. 
                  This information is required for payment processing and invoice generation.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = "/dashboard/profile"}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Buy Credits</TabsTrigger>
          <TabsTrigger value="billing">Billing Dashboard</TabsTrigger>
          <TabsTrigger value="help">Help & Info</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6">
          {/* Credit Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Credit Packs</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>All purchases are one-time, no subscriptions</span>
          </div>
        </div>

        {/* Payment Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-blue-900">Secure Payment Processing</h3>
                <p className="text-sm text-blue-700">
                  Payments are processed securely through Hypay. You'll be redirected to their secure payment page to complete your purchase.
                </p>
                <p className="text-xs text-blue-600">
                  After successful payment, your credits will be automatically added to your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {creditPacks.map((pack) => (
            <Card 
              key={pack.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pack.popular ? 'border-primary shadow-md' : ''
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {bestValue?.id === pack.id && (
                <div className="absolute -top-2 right-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto h-12 w-12 rounded-full bg-gradient-to-r ${getPackColor(pack)} flex items-center justify-center text-white mb-2`}>
                  {getPackIcon(pack)}
                </div>
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                <div className="text-3xl font-bold">₪{pack.price_nis}</div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {pack.credits_amount}
                    {pack.bonus && (
                      <span className="text-sm text-blue-600 ml-1">
                        +{pack.bonus} bonus
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Per credit:</span>
                    <span className="font-medium">₪{calculateValuePerCredit(pack)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos:</span>
                    <span className="font-medium">{pack.credits_amount}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handlePurchase(pack)}
                  disabled={purchasing === pack.id || !isProfileComplete()}
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                >
                  {purchasing === pack.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : !isProfileComplete() ? (
                    <>
                      <Info className="h-4 w-4 mr-2" />
                      Complete Profile First
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Recent credit purchases and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.amount_changed)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{getTransactionDisplayName(transaction)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </p>
                </div>
                                  <div className={`font-semibold ${
                    transaction.amount_changed > 0 ? "text-blue-600" : "text-red-600"
                  }`}>
                  {transaction.amount_changed > 0 ? "+" : ""}{transaction.amount_changed}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Credits Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Credit Usage</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  1 credit = 1 video upload
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Includes AI transcription
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Unlimited editing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Caption burning included
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Purchase Benefits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  No subscription required
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Instant activation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  Volume discounts available
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="billing">
          <BillingDashboard />
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How Credits Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Credit Usage</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      1 credit = 1 video upload
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Includes AI transcription
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Unlimited editing
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Caption burning included
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Purchase Benefits</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      No subscription required
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Credits never expire
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Instant activation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Volume discounts available
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 