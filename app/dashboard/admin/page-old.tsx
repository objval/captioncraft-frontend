"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge, StatusIcon } from "@/components/shared/StatusBadge"
import { 
  Users, 
  Video, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  BarChart3
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAdminData } from "@/hooks/use-admin-data"
import { useAuth } from "@/components/providers/auth-provider"

export default function AdminPage() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useAdminData()

  // Status helpers are now imported from shared utilities

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and user management</p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and user management</p>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <Button onClick={refetch} variant="outline">
          Retry Loading
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Reload Data
          </Button>
        </div>
      </div>
    )
  }

  const { profiles, recentVideos, systemStats } = data

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and user management</p>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_videos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transcripts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_transcripts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Distributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.credits_distributed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Status Overview */}
      {Object.keys(systemStats.videos_by_status).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video Processing Status</CardTitle>
            <CardDescription>Current status distribution of all videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(systemStats.videos_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <StatusIcon status={status} />
                  <div>
                    <div className="font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="videos">Recent Videos</TabsTrigger>
          <TabsTrigger value="activity">System Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>
                Manage user accounts and credit balances ({profiles.length} users)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback>
                                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{profile.full_name || 'No name'}</div>
                              <div className="text-xs text-muted-foreground">{profile.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={profile.credits > 0 ? "default" : "destructive"}>
                            {profile.credits} credits
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No user profiles found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>
                Latest video uploads and processing status ({recentVideos.length} videos)
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
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVideos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{video.title}</div>
                            <div className="text-xs text-muted-foreground">{video.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{video.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{video.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={video.status} /></TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No videos found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos.length > 0 ? (
                <div className="space-y-4">
                  {recentVideos.slice(0, 20).map((video) => (
                    <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {video.profiles?.full_name || 'User'} {video.status === 'uploading' ? 'uploaded' : 'updated'} "{video.title}"
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status changed to {video.status} • {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <StatusIcon status={video.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={refetch} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  )
} 