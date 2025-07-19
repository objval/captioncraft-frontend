"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useTransactions, getTransactionDisplayName } from "@/hooks/use-transactions"
import { getUserProfile, updateUserProfile } from "@/lib/profiles"
import { getUserPayments } from "@/lib/payments"
import { api, type UserProfile, type Payment } from "@/lib/api"
import { 
  User, 
  Mail, 
  Calendar, 
  Coins, 
  Video, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Settings,
  Shield,
  CreditCard,
  Activity,
  Star,
  Award,
  Zap,
  Phone,
  MapPin,
  Download,
  Receipt
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { videos, loading: videosLoading } = useVideoSubscription(user?.id)
  const { transactions: recentTransactions, loading: transactionsLoading } = useTransactions(user?.id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    street: "",
    city: "",
    zip_code: "",
  })

  const [accountStats, setAccountStats] = useState({
    totalUploads: 0,
    completedVideos: 0,
    totalMinutesProcessed: 0,
    joinDate: "",
    totalCreditsUsed: 0
  })

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        const profileData = await getUserProfile()
        setProfile(profileData)
        setEditData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone_number: profileData.phone_number || "",
          street: profileData.street || "",
          city: profileData.city || "",
          zip_code: profileData.zip_code || "",
        })
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  // Load payment history
  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.id) return
      
      try {
        const paymentData = await getUserPayments()
        setPayments(paymentData)
      } catch (error) {
        console.error("Failed to load payment history:", error)
      } finally {
        setPaymentsLoading(false)
      }
    }

    loadPayments()
  }, [user?.id])

  // Calculate statistics
  useEffect(() => {
    if (videos.length > 0) {
      const completed = videos.filter(v => v.status === "complete").length
      const joinDate = videos.reduce((earliest, video) => {
        const videoDate = new Date(video.created_at)
        return videoDate < earliest ? videoDate : earliest
      }, new Date())

      setAccountStats({
        totalUploads: videos.length,
        completedVideos: completed,
        totalMinutesProcessed: Math.round(videos.length * 3.5), // Estimated
        joinDate: formatDistanceToNow(joinDate, { addSuffix: true }),
        totalCreditsUsed: videos.length // 1 credit per video
      })
    }
  }, [videos])

  const handleSaveProfile = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const updatedProfile = await updateUserProfile(editData)
      setProfile(updatedProfile)
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getUserInitials = (email: string) => {
    const name = profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : email.split('@')[0]
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    return user?.email?.split('@')[0] || "User"
  }

  // Status helpers are now imported from shared utilities

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
      <TrendingUp className="h-4 w-4 text-blue-500" />
    ) : (
      <Activity className="h-4 w-4 text-slate-500" />
    )
  }

  if (creditsLoading || videosLoading || transactionsLoading || profileLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your activity
        </p>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user?.email ? getUserInitials(user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{getDisplayName()}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                    <Mail className="h-3 w-3" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {accountStats.joinDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{credits} credits</span>
              </div>
            </div>

            <Separator />

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={editData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={editData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">Zip Code</Label>
                    <Input
                      id="zip_code"
                      value={editData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="Zip code"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)} 
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  {profile?.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                  
                  {(profile?.street || profile?.city) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        {profile?.street && <div>{profile.street}</div>}
                        {profile?.city && (
                          <div>
                            {profile.city}
                            {profile?.zip_code && `, ${profile.zip_code}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!profile?.first_name && !profile?.phone_number && !profile?.street && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Complete your profile to enable payments
                    </p>
                  )}
                </div>
                
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Account Statistics
            </CardTitle>
            <CardDescription>
              Your activity and usage overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Video className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{accountStats.totalUploads}</div>
                <div className="text-sm text-muted-foreground">Total Videos</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{accountStats.completedVideos}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{accountStats.totalMinutesProcessed}</div>
                <div className="text-sm text-muted-foreground">Minutes Processed</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{accountStats.totalCreditsUsed}</div>
                <div className="text-sm text-muted-foreground">Credits Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videos.slice(0, 5).map((video) => (
                <div key={video.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <StatusBadge status={video.status} className="text-xs" />
                </div>
              ))}
              {videos.length === 0 && (
                <div className="text-center py-8">
                  <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No videos yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse p-3 bg-muted rounded-lg">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : payments.length > 0 ? (
                payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-shrink-0">
                      <Receipt className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {payment.credit_packs?.name || "Credit Purchase"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                      </p>
                      {payment.invoices?.[0]?.invoice_url && (
                        <a 
                          href={payment.invoices[0].invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download Invoice
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <StatusBadge status={payment.status} className="text-xs" />
                      <div className="text-sm font-medium text-muted-foreground">
                        ₪{payment.amount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No payments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Credit Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Credit Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.slice(0, 10).map((transaction) => (
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
            {recentTransactions.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}