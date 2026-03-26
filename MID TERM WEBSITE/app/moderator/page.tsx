import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

const stats = [
  {
    label: "Pending Review",
    value: "24",
    change: "+5 today",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Approved Today",
    value: "18",
    change: "92% approval rate",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Rejected Today",
    value: "3",
    change: "Policy violations",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    label: "Flagged Ads",
    value: "7",
    change: "Needs attention",
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
]

const recentActions = [
  { id: 1, title: "Premium Office Space Downtown", action: "approved", time: "2 min ago" },
  { id: 2, title: "iPhone 15 Pro Max - Brand New", action: "rejected", time: "5 min ago" },
  { id: 3, title: "Wedding Photography Services", action: "approved", time: "12 min ago" },
  { id: 4, title: "2023 BMW X5", action: "flagged", time: "18 min ago" },
  { id: 5, title: "Luxury Apartment Downtown", action: "approved", time: "25 min ago" },
]

export default function ModeratorPage() {
  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Moderator Dashboard</h1>
            <p className="text-muted-foreground">
              Review and moderate ad submissions
            </p>
          </div>
          <Button asChild>
            <Link href="/moderator/review">
              Start Reviewing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>Your moderation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        action.action === "approved"
                          ? "bg-emerald-500/10"
                          : action.action === "rejected"
                          ? "bg-red-500/10"
                          : "bg-orange-500/10"
                      }`}>
                        {action.action === "approved" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : action.action === "rejected" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{action.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{action.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Your moderation statistics this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Ads Reviewed</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-full w-4/5 rounded-full bg-primary" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">80% of weekly target</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg. Review Time</span>
                    <span className="font-medium">3.2 min</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-full w-[90%] rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Below 5 min target</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Accuracy Rate</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-full w-[98%] rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Excellent performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="mt-2 font-medium">Content Quality</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Check for clear descriptions, proper images, and accurate information
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="mt-2 font-medium">Policy Compliance</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ensure ads comply with our terms of service and community guidelines
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <XCircle className="h-5 w-5 text-red-500" />
                <h4 className="mt-2 font-medium">Prohibited Items</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reject ads for illegal items, counterfeit goods, or restricted content
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h4 className="mt-2 font-medium">Verification</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verify seller information and listing authenticity when needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
