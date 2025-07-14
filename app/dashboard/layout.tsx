"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { UploadModal } from "@/components/video/upload-modal"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { 
  BarChart3, 
  Video, 
  Plus, 
  Home, 
  Settings, 
  CreditCard,
  FolderOpen,
  User,
  CheckCircle,
  Shield
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { videos, loading } = useVideoSubscription(user?.id)

  // Calculate quick stats
  const totalVideos = videos.length
  const processingVideos = videos.filter(v => v.status === "processing" || v.status === "uploading" || v.status === "burning_in").length
  const completedVideos = videos.filter(v => v.status === "complete").length

  // Handle upload modal trigger event
  useEffect(() => {
    const handleUploadModalOpen = () => {
      setUploadModalOpen(true)
    }

    window.addEventListener('open-upload-modal', handleUploadModalOpen)
    return () => window.removeEventListener('open-upload-modal', handleUploadModalOpen)
  }, [])

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview and stats"
    },
    {
      title: "Gallery",
      href: "/dashboard/gallery",
      icon: FolderOpen,
      description: "All videos"
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
      description: "Account settings"
    },
    {
      title: "Credits",
      href: "/dashboard/credits",
      icon: CreditCard,
      description: "Purchase credits"
    },
    {
      title: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
      description: "System management"
    },
  ]

  // Sidebar content component for reuse
  const SidebarContent = ({ onItemClick, showUploadButton = false }: { onItemClick?: () => void, showUploadButton?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Upload Button - Only show on desktop */}
      {showUploadButton && (
        <>
          <Button 
            onClick={() => {
              setUploadModalOpen(true)
              onItemClick?.()
            }} 
            className="w-full mb-4 h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <Separator className="mb-6" />
        </>
      )}
      
      {/* Navigation */}
      <nav className={cn("space-y-1 flex-1", !showUploadButton && "mt-0")}>
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</h3>
        </div>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.title}</div>
                <div className={cn(
                  "text-xs opacity-75 truncate transition-colors",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-foreground/70"
                )}>{item.description}</div>
              </div>
            </Link>
          )
        })}
      </nav>
      
      <Separator className="my-6" />
      
      {/* Quick Stats */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Videos</span>
              </div>
              <span className="text-sm font-bold">{loading ? "--" : totalVideos}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <span className="text-sm font-bold">{loading ? "--" : processingVideos}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">{loading ? "--" : completedVideos}</span>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="pt-2">
          <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-muted/30">
            <div className="font-medium mb-1">Need Help?</div>
            <div>Check our guides and tutorials</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onSidebarToggle={() => setSidebarOpen(true)}
        showSidebarToggle={true}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex bg-card border-r border-border p-6">
          <SidebarContent showUploadButton={true} />
        </div>
        
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent onItemClick={() => setSidebarOpen(false)} showUploadButton={false} />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="lg:p-6 p-4">
            {children}
          </div>
        </div>
      </div>
      
      {/* Floating Upload Button */}
      <FloatingActionButton 
        onClick={() => setUploadModalOpen(true)}
        className="lg:hidden"
      />
      
      <UploadModal isOpen={uploadModalOpen} onCloseAction={() => setUploadModalOpen(false)} />
    </div>
  )
} 