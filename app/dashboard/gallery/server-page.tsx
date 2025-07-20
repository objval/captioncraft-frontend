import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VideoCard } from '@/components/video/video-card'
import { 
  Video, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  Upload,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'

// Server-side data fetching function
async function getVideosForUser(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      transcripts(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  return data || []
}

export default async function ServerVideoGalleryPage() {
  const supabase = await createClient()

  // Server-side auth check
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  // Fetch videos server-side
  const videos = await getVideosForUser(data.user.id)

  // Calculate statistics
  const totalVideos = videos.length
  const completedVideos = videos.filter(v => v.status === 'complete').length
  const processingVideos = videos.filter(v => 
    v.status === 'processing' || v.status === 'uploading' || v.status === 'burning_in'
  ).length
  const failedVideos = videos.filter(v => v.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Gallery</h1>
          <p className="text-muted-foreground">
            Manage and view all your video projects
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Video
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVideos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingVideos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedVideos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              No Videos Yet
            </CardTitle>
            <CardDescription>
              Upload your first video to get started with CaptionCraft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Video
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
