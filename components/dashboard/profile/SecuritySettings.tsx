import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Download, ChevronRight } from "lucide-react"

interface SecuritySettingsProps {
  onChangePassword: () => void
  onEnableTwoFactor: () => void
  onDownloadData: () => void
  onDeleteAccount: () => void
}

export function SecuritySettings({
  onChangePassword,
  onEnableTwoFactor,
  onDownloadData,
  onDeleteAccount
}: SecuritySettingsProps) {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Privacy
        </CardTitle>
        <CardDescription>
          Manage your security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-between" 
            size="sm"
            onClick={onChangePassword}
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Change Password
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between" 
            size="sm"
            onClick={onEnableTwoFactor}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Two-Factor Authentication
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between" 
            size="sm"
            onClick={onDownloadData}
          >
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Your Data
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Separator />

          <div className="pt-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Danger Zone
            </p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={onDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}