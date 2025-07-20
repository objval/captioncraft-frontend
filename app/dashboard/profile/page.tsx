"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { getUserProfile, updateUserProfile } from "@/lib/services/profiles"
import { type UserProfile } from "@/lib/api/api"
import toast from "@/lib/utils/toast"
import { Trophy, Target, CheckCircle2, Sparkles, Activity, Settings, Shield, Eye, Download, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils/general"

// Import profile components
import { ProfileCard } from "@/components/dashboard/profile/ProfileCard"
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm"
import { ActivityStats } from "@/components/dashboard/profile/ActivityStats"
import { AccountSettings } from "@/components/dashboard/profile/AccountSettings"
import { SecuritySettings } from "@/components/dashboard/profile/SecuritySettings"

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
    <div className="min-h-screen p-4 lg:p-8">
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
        <ProfileCard
          profile={profile}
          user={user}
          loading={profileLoading}
          isEditing={isEditing}
          profileCompletion={profileCompletion}
          onEditClick={() => setIsEditing(true)}
        >
          {isEditing && (
            <ProfileForm
              formData={editData}
              saving={saving}
              onChange={handleInputChange}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </ProfileCard>

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
    </div>
  )
}