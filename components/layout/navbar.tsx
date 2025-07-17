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
    <nav className="border-b border-slate-200/60 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button (Mobile) */}
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="lg:hidden hover:bg-slate-100 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Kalil</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Credit Balance - Enhanced */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full shadow-sm">
              <div className="p-1 rounded-full bg-blue-500/10">
                <Coins className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold text-sm text-slate-700">
                <span className="hidden xs:inline">{credits} credits</span>
                <span className="xs:hidden">{credits}</span>
              </span>
            </div>

            {/* Buy Credits - Enhanced */}
            <Link href="/dashboard/credits" className="hidden sm:block">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/80 border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-medium shadow-sm"
              >
                Buy Credits
              </Button>
            </Link>

            {/* User Menu - Enhanced */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-slate-100">
                  <Avatar className="h-9 w-9 ring-2 ring-slate-200 ring-offset-2">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-3">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm text-slate-800">{user?.email}</p>
                    <p className="text-xs text-slate-500">Professional Account</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem asChild className="hover:bg-slate-50">
                  <Link href="/dashboard/profile" className="text-slate-700">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden hover:bg-slate-50">
                  <Link href="/dashboard/credits" className="text-slate-700">
                    <Coins className="mr-2 h-4 w-4" />
                    Buy Credits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-slate-50">
                  <Link href="/settings" className="text-slate-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-slate-50">
                  <Link href="/dashboard/admin" className="text-slate-700">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem onClick={signOut} className="hover:bg-red-50 text-red-600">
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
