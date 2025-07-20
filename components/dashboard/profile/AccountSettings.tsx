import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"

interface AccountSettingsProps {
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    autoDownload: boolean
    highQualityExport: boolean
  }
  onPreferenceChange: (key: string, value: boolean) => void
  hasPhoneNumber: boolean
}

export function AccountSettings({
  preferences,
  onPreferenceChange,
  hasPhoneNumber
}: AccountSettingsProps) {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your account preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base font-normal">
                Email Notifications
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Receive updates about your videos via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                onPreferenceChange('emailNotifications', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications" className="text-base font-normal">
                SMS Notifications
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Get text alerts for important updates
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => 
                onPreferenceChange('smsNotifications', checked)
              }
              disabled={!hasPhoneNumber}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-download" className="text-base font-normal">
                Auto-download Videos
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automatically download processed videos
              </p>
            </div>
            <Switch
              id="auto-download"
              checked={preferences.autoDownload}
              onCheckedChange={(checked) => 
                onPreferenceChange('autoDownload', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-quality" className="text-base font-normal">
                High Quality Export
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Export videos in maximum quality
              </p>
            </div>
            <Switch
              id="high-quality"
              checked={preferences.highQualityExport}
              onCheckedChange={(checked) => 
                onPreferenceChange('highQualityExport', checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}