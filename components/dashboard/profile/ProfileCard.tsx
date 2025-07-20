import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, Calendar, Phone, MapPin, Edit2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { UserProfile } from "@/lib/api/api"
import type { User } from "@supabase/supabase-js"

interface ProfileCardProps {
  profile: UserProfile | null
  user: User | null
  loading: boolean
  isEditing: boolean
  profileCompletion: number
  onEditClick: () => void
  children?: React.ReactNode // For the edit form
}

export function ProfileCard({
  profile,
  user,
  loading,
  isEditing,
  profileCompletion,
  onEditClick,
  children
}: ProfileCardProps) {
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

  const joinDate = user?.created_at ? new Date(user.created_at) : new Date()

  return (
    <Card className="lg:col-span-1 overflow-hidden border-0 shadow-lg">
      <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600" />
      <CardContent className="relative pt-0">
        <div className="flex flex-col items-center -mt-12 space-y-4">
          {loading ? (
            <div className="h-24 w-24 rounded-full bg-slate-200 animate-pulse" />
          ) : (
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="text-2xl bg-white">
                {user?.email ? getUserInitials(user.email) : "U"}
              </AvatarFallback>
            </Avatar>
          )}
          
          {loading ? (
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
          {loading ? (
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

          {loading ? (
            <div className="w-full space-y-3">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          ) : isEditing ? (
            <div className="w-full space-y-4">
              {children}
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
              
              <Button onClick={onEditClick} className="w-full" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}