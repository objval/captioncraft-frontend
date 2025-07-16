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
            className="w-full mb-6 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <Separator className="mb-6 bg-slate-200" />
        </>
      )}
      
      {/* Navigation */}
      <nav className={cn("space-y-2 flex-1", !showUploadButton && "mt-0")}>
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Navigation</h3>
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
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-800 hover:shadow-sm"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
              )} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div className={cn(
                  "text-xs opacity-80 truncate transition-colors",
                  isActive ? "text-white/90" : "text-slate-500 group-hover:text-slate-600"
                )}>{item.description}</div>
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none" />
              )}
            </Link>
          )
        })}
      </nav>
      
      <Separator className="my-6 bg-slate-200" />
      
      {/* Quick Stats */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Video className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Total Videos</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{loading ? "--" : totalVideos}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Processing</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{loading ? "--" : processingVideos}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Completed</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{loading ? "--" : completedVideos}</span>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="pt-2">
          <div className="text-xs text-slate-600 text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50">
            <div className="font-semibold mb-1 text-slate-700">Need Help?</div>
            <div className="text-slate-500">Check our guides and tutorials</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar 
        onSidebarToggle={() => setSidebarOpen(true)}
        showSidebarToggle={true}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-sm">
          <div className="w-full p-6 bg-gradient-to-b from-white/50 to-slate-50/50">
            <SidebarContent showUploadButton={true} />
          </div>
        </div>
        
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-6 bg-white/95 backdrop-blur-xl border-slate-200">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-slate-800 font-bold">Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent onItemClick={() => setSidebarOpen(false)} showUploadButton={false} />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto lg:p-8 p-4">
            {children}
          </div>
        </div>
      </div>
      
      {/* Floating Upload Button */}
      <FloatingActionButton 
        onClick={() => setUploadModalOpen(true)}
        className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      />
      
      <UploadModal isOpen={uploadModalOpen} onCloseAction={() => setUploadModalOpen(false)} />
    </div>
  )
} 