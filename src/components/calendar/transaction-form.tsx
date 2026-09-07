"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { transactionSchema, type TransactionInput } from "@/lib/validation/transaction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { getCategoryIcon } from "@/lib/icons"

export type CategoryOption = {
  id: string
  name: string
  icon: string
  kind: "income" | "expense" | "both"
}

export function TransactionForm({
  date,
  categories,
  defaultValues,
  onSubmit,
  onDone,
}: {
  date: string
  categories: CategoryOption[]
  defaultValues?: Partial<TransactionInput> & { id?: string }
  onSubmit: (input: TransactionInput) => Promise<void>
  onDone?: () => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      occurredOn: defaultValues?.occurredOn ?? date,
      amount: defaultValues?.amount ?? undefined,
      kind: defaultValues?.kind ?? "expense",
      categoryId: defaultValues?.categoryId ?? null,
      description: defaultValues?.description ?? "",
    },
  })

  const kind = watch("kind")
  const categoryId = watch("categoryId")
  const availableCategories = categories.filter(
    (c) => c.kind === kind || c.kind === "both"
  )

  async function submit(values: TransactionInput) {
    try {
      await onSubmit(values)
      toast.success(kind === "income" ? "Receita lançada." : "Despesa lançada.")
      reset({ occurredOn: date, amount: undefined, kind, categoryId: null, description: "" })
      onDone?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar lançamento.")
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        <Field>
          <Tabs value={kind} onValueChange={(v) => setValue("kind", v as TransactionInput["kind"])}>
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Despesa
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Receita
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>

        <Field data-invalid={!!errors.amount}>
          <FieldLabel htmlFor="amount">Valor</FieldLabel>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            {...register("amount", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.amount]} />
        </Field>

        <Field data-invalid={!!errors.occurredOn}>
          <FieldLabel htmlFor="occurredOn">Data</FieldLabel>
          <Input id="occurredOn" type="date" {...register("occurredOn")} />
          <FieldError errors={[errors.occurredOn]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="categoryId">Categoria</FieldLabel>
          <Select
            value={categoryId ?? "none"}
            onValueChange={(v) => setValue("categoryId", v === "none" ? null : v)}
          >
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
              {availableCategories.map((c) => {
                const Icon = getCategoryIcon(c.icon)
                return (
                  <SelectItem key={c.id} value={c.id}>
                    <Icon className="size-4" />
                    {c.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            id="description"
            placeholder="Opcional"
            rows={2}
            {...register("description")}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : "Salvar lançamento"}
        </Button>
      </FieldGroup>
    </form>
  )
}
