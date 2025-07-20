"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { SimpleNavbar } from "@/components/dashboard/simple-navbar"
import { EnhancedSidebar } from "@/components/dashboard/enhanced-sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/video"
import { useAdmin } from "@/hooks/auth"
import { ModalSkeleton } from "@/components/shared/LoadingSkeleton"
import { cn } from "@/lib/utils/general"

// Lazy load the upload modal
const UploadModal = lazy(() => 
  import("@/components/video/upload-modal").then(mod => ({ default: mod.UploadModal }))
)

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useAuth()
  const { isAdmin } = useAdmin()

  // Handle upload modal trigger event
  useEffect(() => {
    const handleUploadModalOpen = () => {
      setUploadModalOpen(true)
    }

    window.addEventListener('open-upload-modal', handleUploadModalOpen)
    return () => window.removeEventListener('open-upload-modal', handleUploadModalOpen)
  }, [])


  return (
    <div className="min-h-screen bg-background">
      {/* Only show navbar on mobile */}
      <div className="lg:hidden">
        <SimpleNavbar 
          onSidebarToggle={() => setSidebarOpen(true)}
          showSidebarToggle={true}
        />
      </div>
      
      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden lg:block transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-80"
        )}>
          <EnhancedSidebar 
            isAdmin={isAdmin}
            onUploadClick={() => setUploadModalOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-full"
          />
        </div>
        
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0 bg-white/95 backdrop-blur-xl border-slate-200 dark:bg-slate-900/95 dark:border-slate-700">
            <EnhancedSidebar 
              isAdmin={isAdmin}
              onUploadClick={() => {
                setUploadModalOpen(true)
                setSidebarOpen(false)
              }}
              onItemClick={() => setSidebarOpen(false)}
              className="h-full"
            />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="h-full">
            {children}
          </div>
        </div>
      </div>
      
      {/* Floating Upload Button */}
      <FloatingActionButton 
        onClick={() => setUploadModalOpen(true)}
        className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      />
      
      {/* Lazy loaded Upload Modal */}
      <Suspense fallback={<ModalSkeleton />}>
        <UploadModal isOpen={uploadModalOpen} onCloseAction={() => setUploadModalOpen(false)} />
      </Suspense>
    </div>
  )
}