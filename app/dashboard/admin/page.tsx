"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge, StatusIcon } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  Video, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserCheck,
  Plus,
  Minus,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCcw,
  CreditCard,
  Shield,
  UserX,
  Eye
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAdminData } from "@/hooks/use-admin-data"
import { useAuth } from "@/components/providers/auth-provider"
import { useAdmin } from "@/hooks/use-admin"
import { createClient } from "@/utils/supabase/client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

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

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return
    
    setActionLoading(true)
    try {
      const supabase = createClient()
      const amount = parseInt(creditAmount)
      
      // Update user credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: selectedUser.credits + amount })
        .eq("id", selectedUser.id)
      
      if (updateError) throw updateError
      
      // Add credit transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: selectedUser.id,
          amount_changed: amount,
          reason: `Admin credit adjustment by ${user?.email}`,
          balance_after: selectedUser.credits + amount
        })
      
      if (transactionError) throw transactionError
      
      toast.success(`Added ${amount} credits to ${selectedUser.email}`)
      setCreditDialogOpen(false)
      setCreditAmount("")
      refetch()
    } catch (error) {
      console.error("Error adding credits:", error)
      toast.error("Failed to add credits")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveCredits = async () => {
    if (!selectedUser || !creditAmount) return
    
    setActionLoading(true)
    try {
      const supabase = createClient()
      const amount = parseInt(creditAmount)
      const newBalance = Math.max(0, selectedUser.credits - amount)
      
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
          amount_changed: -amount,
          reason: `Admin credit removal by ${user?.email}`,
          balance_after: newBalance
        })
      
      if (transactionError) throw transactionError
      
      toast.success(`Removed ${amount} credits from ${selectedUser.email}`)
      setCreditDialogOpen(false)
      setCreditAmount("")
      refetch()
    } catch (error) {
      console.error("Error removing credits:", error)
      toast.error("Failed to remove credits")
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_users || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              {totalAdmins} admin{totalAdmins !== 1 ? 's' : ''}, {totalUsers} user{totalUsers !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bannedUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {bannedUsers > 0 ? `${((bannedUsers / systemStats.total_users) * 100).toFixed(1)}% of total` : 'None'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_videos || 0}</div>
            <p className="text-xs text-slate-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.credits_distributed || 0}</div>
            <p className="text-xs text-slate-600 mt-1">In circulation</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcripts</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_transcripts || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Generated</p>
          </CardContent>
        </Card>
      </div>

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
          <Card className="border-0 shadow-lg">
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
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterRole === "all" ? "All Users" : filterRole === "admin" ? "Admins" : filterRole === "banned" ? "Banned" : "Users"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterRole("all")}>
                      All Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole("admin")}>
                      Admins Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole("user")}>
                      Regular Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterRole("banned")}>
                      Banned Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProfiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback>
                                {profile.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {profile.first_name && profile.last_name 
                                  ? `${profile.first_name} ${profile.last_name}`
                                  : profile.full_name || 'No name'}
                              </div>
                              <div className="text-xs text-slate-500">{profile.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={profile.role === "admin" ? "default" : "secondary"}
                            className={profile.role === "admin" ? "bg-purple-100 text-purple-700" : ""}
                          >
                            {profile.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {profile.role || "user"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.is_banned ? (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.credits > 0 ? "default" : "destructive"}>
                            {profile.credits} credits
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DateDisplay date={profile.created_at} format="relative" />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(profile)
                                  setViewUserDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(profile)
                                  setCreditDialogOpen(true)
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Manage Credits
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleAdmin(profile.id, profile.role)}
                                disabled={profile.id === user?.id}
                              >
                                {profile.role === "admin" ? (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {profile.is_banned ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUnbanUser(profile.id)}
                                  className="text-green-600"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Unban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(profile)
                                    setBanDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                  disabled={profile.id === user?.id || profile.role === "admin"}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No users found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>
                Latest video uploads and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVideos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{video.title}</div>
                            <div className="text-xs text-slate-500">{video.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{video.profiles?.full_name || video.profiles?.email || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{video.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={video.status} /></TableCell>
                        <TableCell>
                          <DateDisplay date={video.created_at} format="relative" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No videos found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos.length > 0 ? (
                <div className="space-y-4">
                  {recentVideos.slice(0, 20).map((video: any) => (
                    <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                      <Activity className="h-4 w-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {video.profiles?.email || 'User'} uploaded "{video.title}"
                        </div>
                        <div className="text-xs text-slate-500">
                          Status: {video.status} • <DateDisplay date={video.created_at} format="relative" />
                        </div>
                      </div>
                      <StatusIcon status={video.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credit Management Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Credits</DialogTitle>
            <DialogDescription>
              Adjust credit balance for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold">{selectedUser?.credits || 0} credits</p>
            </div>
            <div>
              <Label htmlFor="creditAmount">Amount</Label>
              <Input
                id="creditAmount"
                type="number"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRemoveCredits}
              disabled={actionLoading || !creditAmount || parseInt(creditAmount) <= 0}
            >
              <Minus className="h-4 w-4 mr-2" />
              Remove Credits
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={actionLoading || !creditAmount || parseInt(creditAmount) <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.email}? They will lose access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Reason (optional)</Label>
              <Input
                id="banReason"
                placeholder="Enter reason for ban"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={actionLoading}
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewUserDialogOpen} onOpenChange={setViewUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">User ID</Label>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Name</Label>
                  <p className="font-medium">
                    {selectedUser.first_name && selectedUser.last_name 
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`
                      : selectedUser.full_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Role</Label>
                  <Badge className={selectedUser.role === "admin" ? "bg-purple-100 text-purple-700" : ""}>
                    {selectedUser.role === "admin" && <Shield className="h-3 w-3 mr-1 inline" />}
                    {selectedUser.role || "user"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Credits</Label>
                  <p className="font-medium">{selectedUser.credits}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Status</Label>
                  {selectedUser.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Joined</Label>
                  <div className="font-medium">
                    <DateDisplay date={selectedUser.created_at} format="smart" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Last Updated</Label>
                  <div className="font-medium">
                    <DateDisplay date={selectedUser.updated_at} format="smart" />
                  </div>
                </div>
              </div>
              {selectedUser.is_banned && selectedUser.banned_reason && (
                <div>
                  <Label className="text-xs text-slate-500">Ban Reason</Label>
                  <p className="text-sm">{selectedUser.banned_reason}</p>
                  {selectedUser.banned_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      Banned <DateDisplay date={selectedUser.banned_at} format="relative" />
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}