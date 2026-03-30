import { cn } from "@/lib/utils"

export type AdStatus = "published" | "under_review" | "payment_pending" | "payment_submitted" | "payment_verified" | "scheduled" | "submitted" | "draft" | "expired" | "archived" | "rejected"

interface StatusBadgeProps {
  status: AdStatus
  className?: string
}

const statusConfig: Record<AdStatus, { label: string; color: string }> = {
  published: { label: "Published", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  under_review: { label: "Under Review", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  payment_pending: { label: "Payment Pending", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  payment_submitted: { label: "Payment Submitted", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  payment_verified: { label: "Payment Verified", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  scheduled: { label: "Scheduled", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  submitted: { label: "Submitted", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  draft: { label: "Draft", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  expired: { label: "Expired", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  archived: { label: "Archived", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
  rejected: { label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", config.color, className)}>
      {config.label}
    </span>
  )
}
