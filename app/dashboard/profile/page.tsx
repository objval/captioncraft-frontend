"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useTransactions, getTransactionDisplayName } from "@/hooks/use-transactions"
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
  Zap
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { videos, loading: videosLoading } = useVideoSubscription(user?.id)
  const { transactions: recentTransactions, loading: transactionsLoading } = useTransactions(user?.id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [accountStats, setAccountStats] = useState({
    totalUploads: 0,
    completedVideos: 0,
    totalMinutesProcessed: 0,
    joinDate: "",
    totalCreditsUsed: 0
  })

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
    try {
      // This would normally update the user profile
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
            case "complete": return "bg-blue-100 text-blue-800"
      case "ready": return "bg-sky-100 text-sky-800"
      case "processing": return "bg-indigo-100 text-indigo-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-500" />
    ) : (
              <Activity className="h-4 w-4 text-slate-500" />
    )
  }

  if (creditsLoading || videosLoading || transactionsLoading) {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* User Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
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
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold">{displayName || "User"}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user?.email}
                    </p>
                  </div>
                )}
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

            <div className="space-y-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="md:col-span-2">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Badge className={`text-xs ${getStatusColor(video.status)}`}>
                    {video.status}
                  </Badge>
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

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
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

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
            <Button variant="outline" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing History
            </Button>
            <Button variant="outline" className="justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Email Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 