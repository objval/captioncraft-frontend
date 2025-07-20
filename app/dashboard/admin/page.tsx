"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Video, 
  Activity, 
  AlertTriangle,
  RefreshCcw,
} from "lucide-react"
import { useAdminData } from "@/hooks/use-admin-data"
import { useAuth } from "@/components/providers/auth-provider"
import { useAdmin } from "@/hooks/use-admin"
import { createClient } from "@/lib/database/supabase/client"
import toast from "@/lib/utils/toast"
import { useRouter } from "next/navigation"

// Import admin components
import { SystemStats } from "@/components/dashboard/admin/SystemStats"
import { AdminFilters } from "@/components/dashboard/admin/AdminFilters"
import { UserManagement } from "@/components/dashboard/admin/UserManagement"
import { UserDialogs } from "@/components/dashboard/admin/UserDialogs"
import { RecentVideos } from "@/components/dashboard/admin/RecentVideos"
import { SystemActivity } from "@/components/dashboard/admin/SystemActivity"

interface AdminProfile {
  id: string
  email: string
  credits: number
  full_name: string | null
  created_at: string
  updated_at: string
  avatar_url: string | null
  role: string | null
  is_banned: boolean
  banned_at: string | null
  banned_reason: string | null
  first_name: string | null
  last_name: string | null
}

export default function AdminPage() {
  const { user } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const { data, loading, error, refetch } = useAdminData()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user" | "banned">("all")
  
  // User management states
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null)
  const [creditAmount, setCreditAmount] = useState("")
  const [banReason, setBanReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  
  // Dialogs
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [viewUserDialogOpen, setViewUserDialogOpen] = useState(false)

  // Check admin access
  useEffect(() => {
    // Only redirect if we've finished loading and user is definitely not an admin
    if (!adminLoading && !loading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.")
      router.push("/dashboard")
    }
  }, [adminLoading, isAdmin, loading, user, router])

  const handleCreditAdjustment = async (amount: number, isAddition: boolean) => {
    if (!selectedUser || !amount) return
    
    setActionLoading(true)
    try {
      const supabase = createClient()
      const newBalance = isAddition 
        ? selectedUser.credits + amount 
        : Math.max(0, selectedUser.credits - amount)
      const actualChange = newBalance - selectedUser.credits
      
      // Update user credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: newBalance })
        .eq("id", selectedUser.id)
      
      if (updateError) throw updateError
      
      // Add credit transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: selectedUser.id,
          amount_changed: actualChange,
          reason: `Admin credit ${isAddition ? 'addition' : 'removal'} by ${user?.email}`,
          balance_after: newBalance
        })
      
      if (transactionError) throw transactionError
      
      const action = isAddition ? 'Added' : 'Removed'
      const absAmount = Math.abs(actualChange)
      toast.success(`${action} ${absAmount} credits ${isAddition ? 'to' : 'from'} ${selectedUser.email}`)
      setCreditDialogOpen(false)
      setCreditAmount("")
      refetch()
    } catch (error) {
      console.error(`Error ${isAddition ? 'adding' : 'removing'} credits:`, error)
      toast.error(`Failed to ${isAddition ? 'add' : 'remove'} credits`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return
    
    setActionLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_reason: banReason || `Banned by admin ${user?.email}`
        })
        .eq("id", selectedUser.id)
      
      if (error) throw error
      
      toast.success(`Banned ${selectedUser.email}`)
      setBanDialogOpen(false)
      setBanReason("")
      refetch()
    } catch (error) {
      console.error("Error banning user:", error)
      toast.error("Failed to ban user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    setActionLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_banned: false,
          banned_at: null,
          banned_reason: null
        })
        .eq("id", userId)
      
      if (error) throw error
      
      toast.success("User unbanned successfully")
      refetch()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast.error("Failed to unban user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const newRole = currentRole === "admin" ? "user" : "admin"
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)
      
      if (error) throw error
      
      toast.success(`User role updated to ${newRole}`)
      refetch()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    } finally {
      setActionLoading(false)
    }
  }

  // Show loading state while checking admin status or loading data
  if (adminLoading || loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Admin Dashboard
          </h1>
          <p className="text-slate-600">System overview and user management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    )
  }

  // Don't show anything while redirecting
  if (!isAdmin && !adminLoading) {
    return null // Will redirect in useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refetch} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { profiles = [], recentVideos = [], systemStats = {} } = data

  // Filter profiles based on search and role
  const filteredProfiles = (profiles as AdminProfile[]).filter(profile => {
    const matchesSearch = profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterRole === "all") return matchesSearch
    if (filterRole === "admin") return matchesSearch && profile.role === "admin"
    if (filterRole === "user") return matchesSearch && (profile.role === "user" || !profile.role)
    if (filterRole === "banned") return matchesSearch && profile.is_banned
    return matchesSearch
  })

  const totalAdmins = (profiles as AdminProfile[]).filter(p => p.role === "admin").length
  const bannedUsers = (profiles as AdminProfile[]).filter(p => p.is_banned).length
  const totalUsers = (profiles as AdminProfile[]).filter(p => p.role !== "admin").length

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Admin Dashboard
        </h1>
        <p className="text-slate-600">System overview and user management</p>
      </div>

      {/* System Stats Cards */}
      <SystemStats 
        systemStats={systemStats}
        totalAdmins={totalAdmins}
        totalUsers={totalUsers}
        bannedUsers={bannedUsers}
      />

      <Tabs defaultValue="users" className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border-0 p-1.5 inline-flex gap-1">
          <TabsList className="grid grid-cols-3 w-full bg-transparent h-auto p-0">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-lg font-medium transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-lg font-medium transition-all"
            >
              <Video className="h-4 w-4 mr-2" />
              Recent Videos
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-lg font-medium transition-all"
            >
              <Activity className="h-4 w-4 mr-2" />
              System Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and credit balances
                  </CardDescription>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {/* Search and Filter */}
              <AdminFilters
                searchQuery={searchQuery}
                filterRole={filterRole}
                onSearchChange={setSearchQuery}
                onFilterChange={setFilterRole}
              />
            </CardHeader>
            <CardContent>
              <UserManagement
                profiles={filteredProfiles}
                currentUserId={user?.id}
                onViewUser={(profile) => {
                  setSelectedUser(profile)
                  setViewUserDialogOpen(true)
                }}
                onManageCredits={(profile) => {
                  setSelectedUser(profile)
                  setCreditDialogOpen(true)
                }}
                onToggleAdmin={handleToggleAdmin}
                onBanUser={(profile) => {
                  setSelectedUser(profile)
                  setBanDialogOpen(true)
                }}
                onUnbanUser={handleUnbanUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>
                Latest video uploads and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentVideos videos={recentVideos} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemActivity recentVideos={recentVideos} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Dialogs */}
      <UserDialogs
        selectedUser={selectedUser}
        creditDialogOpen={creditDialogOpen}
        banDialogOpen={banDialogOpen}
        viewUserDialogOpen={viewUserDialogOpen}
        onCreditDialogChange={setCreditDialogOpen}
        onBanDialogChange={setBanDialogOpen}
        onViewUserDialogChange={setViewUserDialogOpen}
        onAddCredits={async (amount) => {
          if (!selectedUser || !amount) return
          const parsedAmount = parseInt(amount)
          await handleCreditAdjustment(parsedAmount, true)
        }}
        onRemoveCredits={async (amount) => {
          if (!selectedUser || !amount) return
          const parsedAmount = parseInt(amount)
          await handleCreditAdjustment(parsedAmount, false)
        }}
        onBanUser={async (reason) => {
          if (!selectedUser) return
          setBanReason(reason)
          await handleBanUser()
        }}
        actionLoading={actionLoading}
      />
      </div>
    </div>
  )
}