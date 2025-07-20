"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/credits"
import { useVideoSubscription } from "@/hooks/video"
import { getUserProfile, updateUserProfile } from "@/lib/services/profiles"
import { type UserProfile } from "@/lib/api/api"
import toast from "@/lib/utils/toast"

// Import profile components
import { ProfileCard } from "@/components/dashboard/profile/ProfileCard"
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm"
import { ActivityStats } from "@/components/dashboard/profile/ActivityStats"
import { AccountSettings } from "@/components/dashboard/profile/AccountSettings"
import { SecuritySettings } from "@/components/dashboard/profile/SecuritySettings"

export default function ProfilePage() {
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)
  const { videos, loading: videosLoading } = useVideoSubscription(user?.id)
  
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

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleChangePassword = () => {
    toast.info("Password change feature coming soon!")
  }

  const handleEnableTwoFactor = () => {
    toast.info("Two-factor authentication coming soon!")
  }

  const handleDownloadData = () => {
    toast.info("Data export feature coming soon!")
  }

  const handleDeleteAccount = () => {
    toast.info("Account deletion feature coming soon!")
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

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
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
          <ActivityStats
            videos={videos}
            credits={credits}
            loading={profileLoading || creditsLoading || videosLoading}
            profileCompletion={profileCompletion}
          />
        </div>

        {/* Settings & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Settings */}
          <AccountSettings
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
            hasPhoneNumber={!!profile?.phone_number}
          />

          {/* Security & Privacy */}
          <SecuritySettings
            onChangePassword={handleChangePassword}
            onEnableTwoFactor={handleEnableTwoFactor}
            onDownloadData={handleDownloadData}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  )
}