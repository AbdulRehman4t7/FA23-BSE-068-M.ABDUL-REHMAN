import { cn } from "@/lib/utils"

export type PackageType = "basic" | "standard" | "premium"

interface PackageBadgeProps {
  type?: PackageType
  packageType?: PackageType
  className?: string
}

const packageConfig: Record<PackageType, { label: string; color: string }> = {
  basic: { label: "Basic", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  standard: { label: "Standard", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  premium: { label: "Premium", color: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm" },
}

export function PackageBadge({ type, packageType, className }: PackageBadgeProps) {
  const resolvedType = type ?? packageType ?? "basic"
  const config = packageConfig[resolvedType] || packageConfig.basic
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border uppercase tracking-wider", config.color, className)}>
      {config.label}
    </span>
  )
}
