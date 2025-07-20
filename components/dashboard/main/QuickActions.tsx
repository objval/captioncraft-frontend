import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Video, Coins, FileText } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "View All Videos",
      description: "Browse your video library",
      icon: Video,
      href: "/dashboard/gallery",
      color: "blue",
      gradient: "bg-blue-50 dark:bg-card",
      border: "border-blue-200 hover:border-blue-300 dark:border-border dark:hover:border-border",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20 dark:bg-blue-500/20 dark:group-hover:bg-blue-500/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      hoverText: "group-hover:text-blue-700 dark:group-hover:text-blue-300"
    },
    {
      title: "Buy Credits",
      description: "Purchase processing credits",
      icon: Coins,
      href: "/dashboard/credits",
      color: "purple",
      gradient: "bg-purple-50 dark:bg-card",
      border: "border-purple-200 hover:border-purple-300 dark:border-border dark:hover:border-border",
      iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      hoverText: "group-hover:text-purple-700 dark:group-hover:text-purple-300"
    },
    {
      title: "Upload Video",
      description: "Add a new video project",
      icon: FileText,
      action: () => window.dispatchEvent(new CustomEvent('open-upload-modal')),
      color: "emerald",
      gradient: "bg-emerald-50 dark:bg-card",
      border: "border-emerald-200 hover:border-emerald-300 dark:border-border dark:hover:border-border",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      hoverText: "group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
    }
  ]

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
            <Zap className="h-6 w-6" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const content = (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-xl ${action.iconBg} transition-colors shadow-sm`}>
                  <action.icon className={`h-7 w-7 ${action.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-semibold text-slate-800 dark:text-slate-100 ${action.hoverText} transition-colors`}>
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                </div>
              </div>
            )

            if (action.href) {
              return (
                <div
                  key={action.title}
                  className={`group dashboard-card hover:scale-105 transition-all duration-300 cursor-pointer ${action.gradient} ${action.border}`}
                >
                  <Link href={action.href} className="block p-6 h-full">
                    {content}
                  </Link>
                </div>
              )
            }

            return (
              <div
                key={action.title}
                className={`group dashboard-card hover:scale-105 transition-all duration-300 cursor-pointer ${action.gradient} ${action.border}`}
                onClick={action.action}
              >
                <div className="block p-6 h-full">
                  {content}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}