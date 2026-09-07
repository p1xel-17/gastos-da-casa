"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, PiggyBank, Target } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { formatCurrency } from "@/lib/currency"
import { savePlanAction } from "@/app/(app)/calendario/actions"

export function MonthHeader({
  year,
  month,
  income,
  expense,
  plannedExpense,
  plannedSaving,
  currency,
}: {
  year: number
  month: number
  income: number
  expense: number
  plannedExpense: number
  plannedSaving: number
  currency: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const monthLabel = format(new Date(year, month - 1, 1), "MMMM 'de' yyyy", {
    locale: ptBR,
  })

  function handleSavePlan(formData: FormData) {
    const expenseValue = Number(formData.get("plannedExpense") ?? 0)
    const savingValue = Number(formData.get("plannedSaving") ?? 0)
    startTransition(async () => {
      try {
        await savePlanAction(year, month, "planned_expense", expenseValue)
        await savePlanAction(year, month, "planned_saving", savingValue)
        toast.success("Planejamento do mês atualizado.")
        setOpen(false)
      } catch {
        toast.error("Não foi possível salvar o planejamento.")
      }
    })
  }

  const expenseProgress =
    plannedExpense > 0 ? Math.min(100, (expense / plannedExpense) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/calendario?year=${prev.year}&month=${prev.month}`} />}
          >
            <ChevronLeft />
          </Button>
          <h1 className="min-w-40 text-center text-xl font-semibold capitalize tracking-tight">
            {monthLabel}
          </h1>
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/calendario?year=${next.year}&month=${next.month}`} />}
          >
            <ChevronRight />
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" />}>
            <Target />
            Planejamento do mês
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planejamento de {monthLabel}</DialogTitle>
            </DialogHeader>
            <form action={handleSavePlan}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="plannedExpense">Gasto previsto</FieldLabel>
                  <Input
                    id="plannedExpense"
                    name="plannedExpense"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={plannedExpense || ""}
                  />
                  <FieldDescription>
                    Quanto você espera gastar neste mês.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="plannedSaving">Meta de poupança</FieldLabel>
                  <Input
                    id="plannedSaving"
                    name="plannedSaving"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={plannedSaving || ""}
                  />
                  <FieldDescription>Quanto você quer guardar neste mês.</FieldDescription>
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Receitas no mês</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income, currency)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Despesas no mês</p>
              <p className="text-lg font-semibold text-destructive">
                {formatCurrency(expense, currency)}
              </p>
            </div>
            {plannedExpense > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${expenseProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatCurrency(expense, currency)} de{" "}
                  {formatCurrency(plannedExpense, currency)} previstos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Meta de poupança</p>
              <p className="text-lg font-semibold">
                {formatCurrency(plannedSaving, currency)}
              </p>
            </div>
            <PiggyBank className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
