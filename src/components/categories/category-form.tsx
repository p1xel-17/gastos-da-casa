"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { categorySchema, type CategoryInput } from "@/lib/validation/category"
import { ICON_NAMES, getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

const COLOR_SWATCHES = [
  "#16a34a",
  "#0ea5e9",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#64748b",
  "#eab308",
  "#6366f1",
]

const KIND_LABELS: Record<CategoryInput["kind"], string> = {
  expense: "Despesa",
  income: "Receita",
  both: "Ambos",
}

export function CategoryForm({
  trigger,
  defaultValues,
  onSubmit,
}: {
  trigger: React.ReactElement
  defaultValues?: Partial<CategoryInput>
  onSubmit: (input: CategoryInput) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      icon: defaultValues?.icon ?? "shapes",
      color: defaultValues?.color ?? "#16a34a",
      kind: defaultValues?.kind ?? "expense",
    },
  })

  const icon = watch("icon")
  const color = watch("color")
  const kind = watch("kind")

  async function submit(values: CategoryInput) {
    try {
      await onSubmit(values)
      toast.success("Categoria salva.")
      setOpen(false)
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar categoria.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            Categorias ajudam a organizar seus lançamentos e aparecem nos dashboards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input id="name" placeholder="Ex: Supermercado" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="kind">Tipo</FieldLabel>
              <Select
                value={kind}
                onValueChange={(v) => setValue("kind", v as CategoryInput["kind"])}
              >
                <SelectTrigger id="kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KIND_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Cor</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    className={cn(
                      "size-7 rounded-full border-2 transition-transform",
                      color === swatch
                        ? "scale-110 border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: swatch }}
                    aria-label={`Cor ${swatch}`}
                    onClick={() => setValue("color", swatch)}
                  />
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel>Ícone</FieldLabel>
              <div className="grid grid-cols-8 gap-2 rounded-lg border p-2">
                {ICON_NAMES.map((name) => {
                  const Icon = getCategoryIcon(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md hover:bg-muted",
                        icon === name && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setValue("icon", name)}
                      aria-label={name}
                    >
                      <Icon className="size-4" />
                    </button>
                  )
                })}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
