import type React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  children: React.ReactNode
  className?: string
}

export function Steps({ children, className }: StepsProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>
}

interface StepItemProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function StepItem({ title, children, className }: StepItemProps) {
  return (
    <div className={cn("border-l-2 border-muted pl-4 pb-4", className)}>
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
