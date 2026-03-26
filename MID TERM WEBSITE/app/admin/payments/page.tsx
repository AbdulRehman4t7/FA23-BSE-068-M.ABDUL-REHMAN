"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, CheckCircle2, XCircle, Eye, Clock } from "lucide-react"

interface Payment {
  id: string
  user: string
  email: string
  ad: string
  package: string
  amount: string
  transactionId: string
  status: "pending" | "verified" | "rejected"
  submittedAt: string
}

const payments: Payment[] = [
  {
    id: "PAY-001",
    user: "John Smith",
    email: "john@example.com",
    ad: "Premium Office Space Downtown",
    package: "Premium",
    amount: "$39.00",
    transactionId: "TXN789456123",
    status: "pending",
    submittedAt: "2 min ago",
  },
  {
    id: "PAY-002",
    user: "Sarah Chen",
    email: "sarah@example.com",
    ad: "Professional Photography Services",
    package: "Standard",
    amount: "$19.00",
    transactionId: "TXN456789012",
    status: "pending",
    submittedAt: "15 min ago",
  },
  {
    id: "PAY-003",
    user: "Mike Johnson",
    email: "mike@example.com",
    ad: "2024 Mercedes-Benz GLE",
    package: "Premium",
    amount: "$39.00",
    transactionId: "TXN123456789",
    status: "pending",
    submittedAt: "32 min ago",
  },
  {
    id: "PAY-004",
    user: "Emily Davis",
    email: "emily@example.com",
    ad: "MacBook Pro 16\" M3 Max",
    package: "Basic",
    amount: "$9.00",
    transactionId: "TXN987654321",
    status: "verified",
    submittedAt: "1 hour ago",
  },
  {
    id: "PAY-005",
    user: "Robert Wilson",
    email: "robert@example.com",
    ad: "Vintage Watch Collection",
    package: "Premium",
    amount: "$39.00",
    transactionId: "TXN654321987",
    status: "rejected",
    submittedAt: "2 hours ago",
  },
]

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleVerify = (payment: Payment) => {
    console.log("Verified payment:", payment.id)
    setSelectedPayment(null)
  }

  const handleReject = () => {
    console.log("Rejected payment:", selectedPayment?.id, "Reason:", rejectReason)
    setSelectedPayment(null)
    setRejectReason("")
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Verification</h1>
          <p className="text-muted-foreground">
            Review and verify payment submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payments.filter((p) => p.status === "verified").length}
                </p>
                <p className="text-sm text-muted-foreground">Verified Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payments.filter((p) => p.status === "rejected").length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>All payment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by user or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user}</p>
                          <p className="text-xs text-muted-foreground">{payment.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{payment.ad}</TableCell>
                      <TableCell>{payment.package}</TableCell>
                      <TableCell className="font-medium">{payment.amount}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                      <TableCell>{payment.submittedAt}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            payment.status === "verified"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : payment.status === "rejected"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {payment.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleVerify(payment)}>
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Verify
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Review payment information</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">User</dt>
                  <dd className="font-medium">{selectedPayment.user}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{selectedPayment.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ad</dt>
                  <dd className="truncate max-w-[200px]">{selectedPayment.ad}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Package</dt>
                  <dd className="font-medium">{selectedPayment.package}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-bold text-primary">{selectedPayment.amount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="font-mono">{selectedPayment.transactionId}</dd>
                </div>
              </dl>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason (optional)</label>
                <Textarea
                  placeholder="Enter reason if rejecting..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => selectedPayment && handleVerify(selectedPayment)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
