import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: "default" | "positive" | "negative"
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted",
            tone === "positive" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "bg-destructive/10 text-destructive"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
