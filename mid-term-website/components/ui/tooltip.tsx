"use client"

import * as React from "react"

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
)
export const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
)
