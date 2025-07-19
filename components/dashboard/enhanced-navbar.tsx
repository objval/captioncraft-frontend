"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { 
  Menu,
  Bell,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Video,
  Upload,
  Download,
  BarChart3,
  Sparkles,
  Command,
  Sun,
  Moon,
  Globe,
  Flame,
  Award,
  Target,
  FileVideo,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { formatDistanceToNow } from "date-fns"
// import { useTheme } from "next-themes" // Commenting out for now
import toast from "react-hot-toast"

interface EnhancedNavbarProps {
  onSidebarToggle?: () => void
  showSidebarToggle?: boolean
  className?: string
}

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  time: Date
  read: boolean
}

export function EnhancedNavbar({ 
  onSidebarToggle, 
  showSidebarToggle = true,
  className 
}: EnhancedNavbarProps) {
  const { user } = useAuth()
  const { credits } = useCreditBalance()
  const { videos } = useVideoSubscription(user?.id)
  // const { theme, setTheme } = useTheme() // Commenting out for now
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showCommandSearch, setShowCommandSearch] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time stats
  const processingVideos = videos.filter(v => 
    ["processing", "uploading", "burning_in"].includes(v.status)
  )
  const recentlyCompleted = videos.filter(v => {
    const completedAt = new Date(v.updated_at || v.created_at)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return v.status === "complete" && completedAt > oneHourAgo
  })

  // Credit health indicator
  const creditHealth = credits > 100 ? 'good' : credits > 50 ? 'warning' : 'critical'
  const creditHealthColor = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50'
  }[creditHealth]

  // Generate notifications based on video status
  useEffect(() => {
    const newNotifications: Notification[] = []
    
    // Check for recently completed videos
    recentlyCompleted.forEach(video => {
      newNotifications.push({
        id: `complete-${video.id}`,
        type: 'success',
        title: 'Video Ready!',
        message: `"${video.title}" has finished processing`,
        time: new Date(video.updated_at || video.created_at),
        read: false
      })
    })

    // Low credits warning
    if (credits < 50 && credits > 0) {
      newNotifications.push({
        id: 'low-credits',
        type: 'warning',
        title: 'Low Credits',
        message: `You have ${credits} credits remaining`,
        time: new Date(),
        read: false
      })
    }

    setNotifications(newNotifications)
  }, [videos, credits])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowCommandSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <nav className={cn(
      "h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm",
      className
    )}>
      <div className="h-full px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo/Brand for mobile */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">Kalil</h1>
            </div>
          </div>

        </div>


        {/* Right Section */}
        <div className="flex items-center gap-3">


          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    variant="destructive"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b hover:bg-slate-50 cursor-pointer",
                        !notification.read && "bg-blue-50/50"
                      )}
                      onClick={() => {
                        setNotifications(prev => 
                          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                        )
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                        {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />}
                        {notification.type === 'info' && <Bell className="h-5 w-5 text-blue-600 mt-0.5" />}
                        {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(notification.time, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No notifications
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setNotifications([])}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Theme Toggle - Temporarily disabled */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}