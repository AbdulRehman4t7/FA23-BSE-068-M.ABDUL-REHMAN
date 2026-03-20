import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react"

const stats = [
  {
    label: "Total Ads",
    value: "2,847",
    change: "+12% from last month",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Active Ads",
    value: "1,234",
    change: "43% of total",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Total Revenue",
    value: "$48,250",
    change: "+23% from last month",
    icon: DollarSign,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Total Users",
    value: "8,421",
    change: "+342 this week",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
]

const pendingPayments = [
  { id: 1, user: "John Smith", amount: "$39.00", package: "Premium", time: "2 min ago" },
  { id: 2, user: "Sarah Chen", amount: "$19.00", package: "Standard", time: "15 min ago" },
  { id: 3, user: "Mike Johnson", amount: "$39.00", package: "Premium", time: "32 min ago" },
  { id: 4, user: "Emily Davis", amount: "$9.00", package: "Basic", time: "1 hour ago" },
]

const systemStatus = [
  { name: "API Server", status: "operational", uptime: "99.9%" },
  { name: "Database", status: "operational", uptime: "99.8%" },
  { name: "CDN", status: "operational", uptime: "100%" },
  { name: "Payment Gateway", status: "operational", uptime: "99.9%" },
  { name: "Email Service", status: "degraded", uptime: "97.2%" },
]

export default function AdminPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/payments">
                Verify Payments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
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
          {/* Pending Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Payments awaiting verification</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/payments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.user}</p>
                        <p className="text-xs text-muted-foreground">{payment.package}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.amount}</p>
                      <p className="text-xs text-muted-foreground">{payment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current service health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        service.status === "operational"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`} />
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{service.uptime}</span>
                      <span className={`text-xs capitalize ${
                        service.status === "operational"
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-amber-500/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">Email Service Degraded</p>
                    <p className="text-xs text-muted-foreground">
                      Some email deliveries may be delayed. Team is investigating.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/payments">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Verify Payments</p>
                  <p className="text-sm text-muted-foreground">12 pending</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/ads">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Manage Ads</p>
                  <p className="text-sm text-muted-foreground">Publish & schedule</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">User Management</p>
                  <p className="text-sm text-muted-foreground">8,421 users</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/analytics">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Reports & insights</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
