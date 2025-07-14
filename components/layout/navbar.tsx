"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/providers/auth-provider"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { Coins, LogOut, Settings, User, Menu, Shield } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  onSidebarToggle?: () => void
  showSidebarToggle?: boolean
}

export function Navbar({ onSidebarToggle, showSidebarToggle = false }: NavbarProps) {
  const { user, signOut } = useAuth()
  const { credits } = useCreditBalance(user?.id)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle Button (Mobile) */}
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CC</span>
              </div>
              <span className="font-bold text-lg sm:text-xl">CaptionCraft</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Credit Balance - Improved Mobile */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-muted rounded-full">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              <span className="font-medium text-xs sm:text-sm">
                <span className="hidden xs:inline">{credits} credits</span>
                <span className="xs:hidden">{credits}</span>
              </span>
            </div>

            {/* Buy Credits - Hidden on Mobile */}
            <Link href="/dashboard/credits" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Buy Credits
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/credits" className="sm:hidden">
                    <Coins className="mr-2 h-4 w-4" />
                    Buy Credits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
