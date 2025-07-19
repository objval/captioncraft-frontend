"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { EmptyState } from "@/components/shared/EmptyState"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { getUserProfile, updateUserProfile } from "@/lib/profiles"
import { type UserProfile } from "@/lib/api"
import { 
  User, 
  Mail, 
  Calendar, 
  Phone,
  MapPin,
  Settings,
  Shield,
  Bell,
  Eye,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  Activity,
  Edit2,
  Save,
  X
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const { credits } = useCreditBalance(user?.id)
  const { videos } = useVideoSubscription(user?.id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    street: "",
    city: "",
    zip_code: "",
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoDownload: false,
    highQualityExport: true,
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

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profile) return 0
    const fields = ['first_name', 'last_name', 'phone_number', 'street', 'city', 'zip_code']
    const filledFields = fields.filter(field => profile[field as keyof UserProfile])
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const profileCompletion = calculateProfileCompletion()
  const joinDate = user?.created_at ? new Date(user.created_at) : new Date()

  // Calculate achievements
  const achievements = [
    {
      id: 'first_video',
      name: 'First Video',
      description: 'Upload your first video',
      icon: Trophy,
      unlocked: videos.length > 0,
      color: 'text-yellow-500'
    },
    {
      id: 'ten_videos',
      name: 'Content Creator',
      description: 'Process 10 videos',
      icon: Target,
      unlocked: videos.length >= 10,
      color: 'text-blue-500'
    },
    {
      id: 'profile_complete',
      name: 'Profile Pro',
      description: 'Complete your profile',
      icon: CheckCircle2,
      unlocked: profileCompletion === 100,
      color: 'text-green-500'
    },
    {
      id: 'power_user',
      name: 'Power User',
      description: 'Process 50 videos',
      icon: Sparkles,
      unlocked: videos.length >= 50,
      color: 'text-purple-500'
    }
  ]

  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-slate-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 overflow-hidden border-0 shadow-lg">
          <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-12 space-y-4">
              {profileLoading ? (
                <div className="h-24 w-24 rounded-full bg-slate-200 animate-pulse" />
              ) : (
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-2xl bg-white">
                    {user?.email ? getUserInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {profileLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-slate-200 rounded mx-auto animate-pulse" />
                  <div className="h-4 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
                  <div className="h-3 w-36 bg-slate-200 rounded mx-auto animate-pulse" />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                  <p className="text-sm text-slate-600 flex items-center gap-1 justify-center">
                    <Mail className="h-3 w-3" />
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 justify-center">
                    <Calendar className="h-3 w-3" />
                    Member since {formatDistanceToNow(joinDate, { addSuffix: false })}
                  </p>
                </div>
              )}

              {/* Profile Completion */}
              {profileLoading ? (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Profile Completion</span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  {profileCompletion < 100 && (
                    <p className="text-xs text-center text-slate-500">
                      Complete your profile to unlock all features
                    </p>
                  )}
                </div>
              )}

              <Separator className="w-full" />

              {profileLoading ? (
                <div className="w-full space-y-3">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
                </div>
              ) : isEditing ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="first_name" className="text-xs">First Name</Label>
                      <Input
                        id="first_name"
                        value={editData.first_name}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        placeholder="First name"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="text-xs">Last Name</Label>
                      <Input
                        id="last_name"
                        value={editData.last_name}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        placeholder="Last name"
                        className="h-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone_number" className="text-xs">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={editData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      placeholder="+972 50 123 4567"
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="street" className="text-xs">Street Address</Label>
                    <Input
                      id="street"
                      value={editData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder="123 Main St"
                      className="h-9"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-xs">City</Label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Tel Aviv"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code" className="text-xs">Zip Code</Label>
                      <Input
                        id="zip_code"
                        value={editData.zip_code}
                        onChange={(e) => handleInputChange("zip_code", e.target.value)}
                        placeholder="12345"
                        className="h-9"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      size="sm"
                      className="flex-1"
                    >
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)} 
                      disabled={saving}
                      size="sm"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    {profile?.phone_number ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{profile.phone_number}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="h-4 w-4" />
                        <span>No phone number</span>
                      </div>
                    )}
                    
                    {profile?.street || profile?.city ? (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
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
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span>No address</span>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} className="w-full" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Achievements */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity & Achievements
            </CardTitle>
            <CardDescription>
              Your account statistics and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {profileLoading ? (
                    <span className="inline-block h-8 w-12 bg-blue-200 rounded animate-pulse" />
                  ) : (
                    videos.length
                  )}
                </div>
                <div className="text-sm text-blue-600">Videos</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {profileLoading ? (
                    <span className="inline-block h-8 w-12 bg-purple-200 rounded animate-pulse" />
                  ) : (
                    credits
                  )}
                </div>
                <div className="text-sm text-purple-600">Credits</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {profileLoading ? (
                    <span className="inline-block h-8 w-12 bg-green-200 rounded animate-pulse" />
                  ) : (
                    videos.filter(v => v.status === 'complete').length
                  )}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {profileLoading ? (
                    <span className="inline-block h-8 w-12 bg-orange-200 rounded animate-pulse" />
                  ) : (
                    unlockedAchievements
                  )}
                </div>
                <div className="text-sm text-orange-600">Achievements</div>
              </div>
            </div>

            <Separator />

            {/* Achievements */}
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profileLoading ? (
                  // Loading skeleton for achievements
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 animate-pulse">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <div className="h-5 w-5 bg-slate-200 rounded" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-200 rounded mb-1" />
                        <div className="h-3 w-32 bg-slate-200 rounded" />
                      </div>
                      <div className="h-4 w-4 bg-slate-200 rounded-full" />
                    </div>
                  ))
                ) : (
                  achievements.map((achievement) => {
                    const Icon = achievement.icon
                    return (
                    <div
                      key={achievement.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        achievement.unlocked
                          ? "bg-white border-slate-200"
                          : "bg-slate-50 border-slate-100 opacity-60"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        achievement.unlocked
                          ? "bg-slate-100"
                          : "bg-slate-50"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          achievement.unlocked
                            ? achievement.color
                            : "text-slate-400"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium text-sm",
                          !achievement.unlocked && "text-slate-500"
                        )}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base font-normal">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-500">
                    Receive updates about your videos via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="text-base font-normal">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-slate-500">
                    Get text alerts for important updates
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, smsNotifications: checked }))
                  }
                  disabled={!profile?.phone_number}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-download" className="text-base font-normal">
                    Auto-download Videos
                  </Label>
                  <p className="text-sm text-slate-500">
                    Automatically download processed videos
                  </p>
                </div>
                <Switch
                  id="auto-download"
                  checked={preferences.autoDownload}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, autoDownload: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-quality" className="text-base font-normal">
                    High Quality Export
                  </Label>
                  <p className="text-sm text-slate-500">
                    Export videos in maximum quality
                  </p>
                </div>
                <Switch
                  id="high-quality"
                  checked={preferences.highQualityExport}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, highQualityExport: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Change Password
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-Factor Authentication
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Your Data
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Separator />

              <div className="pt-2">
                <p className="text-sm text-slate-600 mb-3">
                  Danger Zone
                </p>
                <Button variant="destructive" size="sm" className="w-full">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}