"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { getCategoryIcon } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Pencil } from "lucide-react"
import { CategoryForm } from "./category-form"
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/(app)/categorias/actions"
import type { CategoryInput } from "@/lib/validation/category"

type CategoryRow = {
  id: string
  name: string
  icon: string
  color: string
  kind: "income" | "expense" | "both"
}

const KIND_LABELS: Record<CategoryRow["kind"], string> = {
  expense: "Despesa",
  income: "Receita",
  both: "Ambos",
}

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCategoryAction(id)
        toast.success("Categoria removida.")
      } catch {
        toast.error("Não foi possível remover a categoria.")
      }
    })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon)
        return (
          <Card key={category.id}>
            <CardContent className="flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{category.name}</p>
                <Badge variant="secondary" className="mt-0.5">
                  {KIND_LABELS[category.kind]}
                </Badge>
              </div>
              <div className="flex gap-1">
                <CategoryForm
                  trigger={
                    <Button size="icon-sm" variant="ghost">
                      <Pencil />
                    </Button>
                  }
                  defaultValues={category}
                  onSubmit={(values: CategoryInput) => updateCategoryAction(category.id, values)}
                />
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button size="icon-sm" variant="ghost" disabled={isPending} />}
                  >
                    <Trash2 />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Lançamentos que usam &quot;{category.name}&quot; ficarão sem
                        categoria. Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(category.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function NewCategoryButton() {
  return (
    <CategoryForm
      trigger={<Button>Nova categoria</Button>}
      onSubmit={(values: CategoryInput) => createCategoryAction(values)}
    />
  )
}
