"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils/general"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home,
  FolderOpen,
  User,
  CreditCard,
  Shield,
  Video,
  ChevronRight,
  ChevronLeft,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  Bell,
  Upload,
  Zap
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/database/supabase/client"

interface SimpleSidebarProps {
  isAdmin: boolean
  onUploadClick: () => void
  onItemClick?: () => void
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function SimpleSidebar({ 
  isAdmin, 
  onUploadClick, 
  onItemClick,
  className,
  collapsed = false,
  onToggleCollapse
}: SimpleSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { credits, loading: creditsLoading } = useCreditBalance(user?.id)

  const isLowCredits = credits < 50

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview and stats",
      show: true
    },
    {
      title: "Gallery",
      href: "/dashboard/gallery",
      icon: FolderOpen,
      description: "All videos",
      show: true
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
      description: "Account settings",
      show: true
    },
    {
      title: "Credits",
      href: "/dashboard/credits",
      icon: CreditCard,
      description: "Purchase credits",
      show: true,
      badge: isLowCredits ? '!' : undefined,
      badgeColor: "bg-red-500 text-white"
    },
    {
      title: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
      description: "System management",
      show: isAdmin,
      badge: "Admin",
      badgeColor: "bg-purple-500 text-white"
    },
  ].filter(item => item.show)

  if (collapsed) {
    return (
      <div className={cn("w-20 bg-white border-r border-slate-200 shadow-sm flex flex-col", className)}>
        <div className="p-4 flex flex-col items-center space-y-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="mb-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Collapsed navigation */}
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
                title={item.title}
              >
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center",
                      item.badgeColor || "bg-blue-500"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-slate-200 shadow-sm", className)}>
      {/* Sidebar Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Kalil</h2>
              <p className="text-xs text-slate-500">Video Platform</p>
            </div>
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Credit Balance Widget */}
        <div className="mb-6">
          {creditsLoading ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-300">
                    <div className="h-5 w-5 bg-slate-400 rounded" />
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-slate-300 rounded mb-2" />
                    <div className="h-7 w-16 bg-slate-300 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">Credit Balance</p>
                    <p className="text-2xl font-bold">{credits}</p>
                  </div>
                </div>
                {isLowCredits && (
                  <Badge className="bg-amber-500 text-white border-0">
                    Low
                  </Badge>
                )}
              </div>
              {isLowCredits && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => router.push('/dashboard/credits')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Buy More Credits
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadClick}
            className="h-10 flex flex-col items-center justify-center gap-1 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs">Upload</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/credits')}
            className="h-10 flex flex-col items-center justify-center gap-1 border-slate-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <Zap className="h-4 w-4" />
            <span className="text-xs">Credits</span>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
              )} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div className={cn(
                  "text-xs opacity-80 truncate",
                  isActive ? "text-white/90" : "text-slate-500 group-hover:text-slate-600"
                )}>{item.description}</div>
              </div>
              {item.badge && (
                <Badge 
                  className={cn(
                    "ml-auto",
                    item.badgeColor || "bg-blue-500",
                    isActive && "bg-white/20 text-white"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-6 pt-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-700">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/auth/login')
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}