import { requireHouseholdContext } from "@/lib/auth/household"
import { listCategories } from "@/lib/db/queries/categories"
import { CategoryList, NewCategoryButton } from "@/components/categories/category-list"

export default async function CategoriasPage() {
  const household = await requireHouseholdContext()
  const categories = await listCategories(household.householdId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize receitas e despesas para ver de onde vem e para onde vai o
            dinheiro da casa.
          </p>
        </div>
        <NewCategoryButton />
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma categoria ainda. Crie a primeira acima.
        </p>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  )
}
