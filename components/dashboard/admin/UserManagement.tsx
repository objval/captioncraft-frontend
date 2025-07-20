import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Shield,
  Ban,
  UserCheck,
  MoreVertical,
  Eye,
  CreditCard,
  ShieldCheck,
} from "lucide-react"

interface AdminProfile {
  id: string
  email: string
  credits: number
  full_name: string | null
  created_at: string
  updated_at: string
  avatar_url: string | null
  role: string | null
  is_banned: boolean
  banned_at: string | null
  banned_reason: string | null
  first_name: string | null
  last_name: string | null
}

interface UserManagementProps {
  profiles: AdminProfile[]
  currentUserId?: string
  onViewUser: (user: AdminProfile) => void
  onManageCredits: (user: AdminProfile) => void
  onToggleAdmin: (userId: string, currentRole: string | null) => void
  onBanUser: (user: AdminProfile) => void
  onUnbanUser: (userId: string) => void
}

export function UserManagement({
  profiles,
  currentUserId,
  onViewUser,
  onManageCredits,
  onToggleAdmin,
  onBanUser,
  onUnbanUser
}: UserManagementProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No users found matching your criteria
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Credits</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.full_name || 'No name'}
                  </div>
                  <div className="text-xs text-slate-500">{profile.id}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{profile.email}</TableCell>
            <TableCell>
              <Badge 
                variant={profile.role === "admin" ? "default" : "secondary"}
                className={profile.role === "admin" ? "bg-purple-100 text-purple-700" : ""}
              >
                {profile.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                {profile.role || "user"}
              </Badge>
            </TableCell>
            <TableCell>
              {profile.is_banned ? (
                <Badge variant="destructive">
                  <Ban className="h-3 w-3 mr-1" />
                  Banned
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={profile.credits > 0 ? "default" : "destructive"}>
                {profile.credits} credits
              </Badge>
            </TableCell>
            <TableCell>
              <DateDisplay date={profile.created_at} format="relative" />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewUser(profile)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageCredits(profile)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Credits
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleAdmin(profile.id, profile.role)}
                    disabled={profile.id === currentUserId}
                  >
                    {profile.role === "admin" ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Make Admin
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {profile.is_banned ? (
                    <DropdownMenuItem 
                      onClick={() => onUnbanUser(profile.id)}
                      className="text-green-600"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Unban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => onBanUser(profile)}
                      className="text-red-600"
                      disabled={profile.id === currentUserId || profile.role === "admin"}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}