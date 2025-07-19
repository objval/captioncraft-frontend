"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { 
  Menu,
  Video,
  Settings,
  LogOut,
  CreditCard,
  User
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface SimpleNavbarProps {
  onSidebarToggle?: () => void
  showSidebarToggle?: boolean
  className?: string
}

export function SimpleNavbar({ 
  onSidebarToggle, 
  showSidebarToggle = true,
  className 
}: SimpleNavbarProps) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <nav className={cn(
      "h-16 bg-white border-b border-slate-200 shadow-sm",
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
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/credits')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Credits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
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