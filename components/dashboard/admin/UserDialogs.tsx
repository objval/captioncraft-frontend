import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Minus, Ban, Shield, Eye } from "lucide-react"

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

interface UserDialogsProps {
  selectedUser: AdminProfile | null
  creditDialogOpen: boolean
  banDialogOpen: boolean
  viewUserDialogOpen: boolean
  onCreditDialogChange: (open: boolean) => void
  onBanDialogChange: (open: boolean) => void
  onViewUserDialogChange: (open: boolean) => void
  onAddCredits: (amount: string) => Promise<void>
  onRemoveCredits: (amount: string) => Promise<void>
  onBanUser: (reason: string) => Promise<void>
  actionLoading: boolean
}

export function UserDialogs({
  selectedUser,
  creditDialogOpen,
  banDialogOpen,
  viewUserDialogOpen,
  onCreditDialogChange,
  onBanDialogChange,
  onViewUserDialogChange,
  onAddCredits,
  onRemoveCredits,
  onBanUser,
  actionLoading
}: UserDialogsProps) {
  const [creditAmount, setCreditAmount] = useState("")
  const [banReason, setBanReason] = useState("")

  const handleAddCredits = async () => {
    await onAddCredits(creditAmount)
    setCreditAmount("")
  }

  const handleRemoveCredits = async () => {
    await onRemoveCredits(creditAmount)
    setCreditAmount("")
  }

  const handleBanUser = async () => {
    await onBanUser(banReason)
    setBanReason("")
  }

  return (
    <>
      {/* Credit Management Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={onCreditDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Credits</DialogTitle>
            <DialogDescription>
              Adjust credit balance for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Label className="text-sm text-slate-600">Current Balance</Label>
              <p className="text-3xl font-bold text-slate-900">{selectedUser?.credits || 0} credits</p>
            </div>
            
            {/* Amount Input */}
            <div>
              <Label htmlFor="creditAmount">Amount to Add/Remove</Label>
              <Input
                id="creditAmount"
                type="number"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            
            {/* Preview Section */}
            {creditAmount && parseInt(creditAmount) > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-800">After Adding</p>
                    <p className="text-xs text-green-600">Current + {creditAmount}</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {(selectedUser?.credits || 0) + parseInt(creditAmount)} credits
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-800">After Removing</p>
                    <p className="text-xs text-red-600">Current - {creditAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">
                      {Math.max(0, (selectedUser?.credits || 0) - parseInt(creditAmount))} credits
                    </p>
                    {(selectedUser?.credits || 0) - parseInt(creditAmount) < 0 && (
                      <p className="text-xs text-red-600 mt-1">Cannot go below 0</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleRemoveCredits}
              disabled={actionLoading || !creditAmount || parseInt(creditAmount) <= 0}
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-2" />
              Remove {creditAmount || 0} Credits
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={actionLoading || !creditAmount || parseInt(creditAmount) <= 0}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {creditAmount || 0} Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={onBanDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.email}? They will lose access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Reason (optional)</Label>
              <Input
                id="banReason"
                placeholder="Enter reason for ban"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onBanDialogChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={actionLoading}
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewUserDialogOpen} onOpenChange={onViewUserDialogChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">User ID</Label>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Name</Label>
                  <p className="font-medium">
                    {selectedUser.first_name && selectedUser.last_name 
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`
                      : selectedUser.full_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Role</Label>
                  <Badge className={selectedUser.role === "admin" ? "bg-purple-100 text-purple-700" : ""}>
                    {selectedUser.role === "admin" && <Shield className="h-3 w-3 mr-1 inline" />}
                    {selectedUser.role || "user"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Credits</Label>
                  <p className="font-medium">{selectedUser.credits}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Status</Label>
                  {selectedUser.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Joined</Label>
                  <div className="font-medium">
                    <DateDisplay date={selectedUser.created_at} format="smart" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Last Updated</Label>
                  <div className="font-medium">
                    <DateDisplay date={selectedUser.updated_at} format="smart" />
                  </div>
                </div>
              </div>
              {selectedUser.is_banned && selectedUser.banned_reason && (
                <div>
                  <Label className="text-xs text-slate-500">Ban Reason</Label>
                  <p className="text-sm">{selectedUser.banned_reason}</p>
                  {selectedUser.banned_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      Banned <DateDisplay date={selectedUser.banned_at} format="relative" />
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}