"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCategoryIcon } from "@/lib/icons"
import { formatCurrency } from "@/lib/currency"
import { TransactionForm, type CategoryOption } from "./transaction-form"
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/(app)/calendario/actions"

export type DayTransaction = {
  id: string
  occurredOn: string
  amount: string
  kind: "income" | "expense"
  description: string | null
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
}

export function DayDialog({
  open,
  onOpenChange,
  date,
  transactions,
  categories,
  currency,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  transactions: DayTransaction[]
  categories: CategoryOption[]
  currency: string
}) {
  const [editing, setEditing] = useState<DayTransaction | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteTransactionAction(id)
        toast.success("Lançamento removido.")
      } catch {
        toast.error("Não foi possível remover.")
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setEditing(null)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        {transactions.length > 0 && (
          <div className="flex flex-col gap-2">
            {transactions.map((t) => {
              const Icon = getCategoryIcon(t.categoryIcon ?? "shapes")
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${t.categoryColor ?? "#94a3b8"}20`,
                      color: t.categoryColor ?? "#94a3b8",
                    }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <button
                    type="button"
                    className="flex-1 overflow-hidden text-left"
                    onClick={() => setEditing(t)}
                  >
                    <p className="truncate text-sm font-medium">
                      {t.categoryName ?? "Sem categoria"}
                    </p>
                    {t.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </button>
                  <span
                    className={
                      t.kind === "income"
                        ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-sm font-medium text-destructive"
                    }
                  >
                    {t.kind === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, currency)}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )
            })}
            <Separator className="my-2" />
          </div>
        )}

        <TransactionForm
          key={editing?.id ?? "new"}
          date={date}
          categories={categories}
          defaultValues={
            editing
              ? {
                  occurredOn: editing.occurredOn,
                  amount: Number(editing.amount),
                  kind: editing.kind,
                  categoryId: editing.categoryId,
                  description: editing.description,
                }
              : undefined
          }
          onSubmit={(values) =>
            editing
              ? updateTransactionAction(editing.id, values)
              : createTransactionAction(values)
          }
          onDone={() => setEditing(null)}
        />
      </DialogContent>
    </Dialog>
  )
}
