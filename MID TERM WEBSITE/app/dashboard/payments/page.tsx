import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Download, CreditCard, Clock, CheckCircle2 } from "lucide-react"

const payments = [
  {
    id: "PAY-001",
    date: "Mar 19, 2026",
    ad: "Professional Photography Services",
    package: "Standard",
    amount: "$19.00",
    status: "payment_pending" as const,
    transactionId: "TXN789456123",
  },
  {
    id: "PAY-002",
    date: "Mar 18, 2026",
    ad: "2023 Tesla Model S",
    package: "Premium",
    amount: "$39.00",
    status: "published" as const,
    transactionId: "TXN456789012",
  },
  {
    id: "PAY-003",
    date: "Mar 1, 2026",
    ad: "Premium Office Space Downtown",
    package: "Premium",
    amount: "$39.00",
    status: "published" as const,
    transactionId: "TXN123456789",
  },
  {
    id: "PAY-004",
    date: "Feb 28, 2026",
    ad: "Vintage Watch Collection",
    package: "Premium",
    amount: "$39.00",
    status: "published" as const,
    transactionId: "TXN987654321",
  },
]

const stats = [
  {
    label: "Total Spent",
    value: "$136.00",
    icon: CreditCard,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Pending",
    value: "$19.00",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Verified",
    value: "$117.00",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
]

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View your payment history and pending verifications
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your payment transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {payment.ad}
                      </TableCell>
                      <TableCell>{payment.package}</TableCell>
                      <TableCell className="font-medium">{payment.amount}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ol className="text-muted-foreground">
              <li>Select your desired package when creating an ad</li>
              <li>Make payment to our official account (details provided on checkout)</li>
              <li>Submit your transaction ID and payment proof</li>
              <li>Our team will verify your payment within 2-24 hours</li>
              <li>Once verified, your ad will be reviewed and published</li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              For any payment issues, contact support at{" "}
              <a href="mailto:support@adflowpro.com" className="text-primary hover:underline">
                support@adflowpro.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
