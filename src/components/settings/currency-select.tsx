"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import { updateCurrencyAction } from "@/app/(app)/configuracoes/actions"

export function CurrencySelect({ currency }: { currency: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      value={currency}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          if (!value) return
          try {
            await updateCurrencyAction(value)
            toast.success("Moeda atualizada.")
          } catch {
            toast.error("Não foi possível atualizar a moeda.")
          }
        })
      }
    >
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
