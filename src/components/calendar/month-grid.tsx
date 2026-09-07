"use client"

import { useMemo, useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { DayDialog, type DayTransaction } from "./day-dialog"
import type { CategoryOption } from "./transaction-form"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function MonthGrid({
  year,
  month,
  transactions,
  categories,
  currency,
}: {
  year: number
  month: number
  transactions: DayTransaction[]
  categories: CategoryOption[]
  currency: string
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const days = useMemo(() => {
    const monthDate = new Date(year, month - 1, 1)
    const gridStart = startOfWeek(startOfMonth(monthDate))
    const gridEnd = endOfWeek(endOfMonth(monthDate))
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [year, month])

  const byDay = useMemo(() => {
    const map = new Map<string, DayTransaction[]>()
    for (const t of transactions) {
      const list = map.get(t.occurredOn) ?? []
      list.push(t)
      map.set(t.occurredOn, list)
    }
    return map
  }, [transactions])

  const monthDate = new Date(year, month - 1, 1)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayTransactions = byDay.get(key) ?? []
          const income = dayTransactions
            .filter((t) => t.kind === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0)
          const expense = dayTransactions
            .filter((t) => t.kind === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0)
          const inMonth = isSameMonth(day, monthDate)

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(key)}
              className={cn(
                "flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/50 sm:min-h-24 sm:p-2",
                !inMonth && "opacity-40",
                isToday(day) && "border-primary"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  isToday(day) && "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5 text-[10px] leading-tight sm:text-xs">
                {income > 0 && (
                  <span className="truncate text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(income, currency)}
                  </span>
                )}
                {expense > 0 && (
                  <span className="truncate text-destructive">
                    -{formatCurrency(expense, currency)}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <DayDialog
          open={!!selectedDay}
          onOpenChange={(open) => !open && setSelectedDay(null)}
          date={selectedDay}
          transactions={byDay.get(selectedDay) ?? []}
          categories={categories}
          currency={currency}
        />
      )}
    </div>
  )
}
