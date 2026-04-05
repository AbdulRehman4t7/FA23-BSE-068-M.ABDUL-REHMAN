"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: "", color: "" }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" }
  if (score === 2) return { score, label: "Fair", color: "bg-amber-500" }
  return { score, label: "Strong", color: "bg-emerald-500" }
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()

  const strength = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordsMatch) return
    if (!firstName || !lastName || !email) return

    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data.error === "string"
          ? data.error
          : Array.isArray(data.error)
            ? data.error[0]?.message || "Registration failed"
            : "Registration failed"
        toast.error(msg)
        return
      }

      if (data.token) {
        try {
          localStorage.setItem("token", data.token)
        } catch {}
      }

      toast.success("Account created successfully")
      router.push("/dashboard")
    } catch {
      toast.error("Unable to register right now")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-2 text-muted-foreground">Start posting ads in minutes</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name <span className="text-destructive">*</span></Label>
            <Input
              id="firstName"
              placeholder="John"
              required
              disabled={isLoading}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name <span className="text-destructive">*</span></Label>
            <Input
              id="lastName"
              placeholder="Doe"
              required
              disabled={isLoading}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= strength.score ? strength.color : "bg-muted")}
                  />
                ))}
              </div>
              <p className={cn("text-xs", strength.score <= 1 ? "text-destructive" : strength.score === 2 ? "text-amber-600" : "text-emerald-600")}>
                {strength.label}
              </p>
            </div>
          )}
          {password.length === 0 && (
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmTouched(true)}
              className={cn("pr-10", confirmTouched && confirmPassword && !passwordsMatch && "border-destructive focus-visible:ring-destructive")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmTouched && confirmPassword && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox id="terms" required />
          <Label htmlFor="terms" className="text-sm font-normal leading-tight">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || (confirmTouched && !passwordsMatch)}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Need role signup?{" "}
        <Link href="/admin-register" className="text-primary hover:underline">Admin</Link>{" "}
        or{" "}
        <Link href="/moderator-register" className="text-primary hover:underline">Moderator</Link>
      </p>
    </div>
  )
}
