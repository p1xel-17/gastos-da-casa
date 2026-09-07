import { and, asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import type { CategoryInput } from "@/lib/validation/category"

export function listCategories(householdId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.householdId, householdId))
    .orderBy(asc(categories.name))
}

export function createCategory(householdId: string, input: CategoryInput) {
  return db.insert(categories).values({ ...input, householdId }).returning()
}

export function updateCategory(
  householdId: string,
  categoryId: string,
  input: CategoryInput
) {
  return db
    .update(categories)
    .set(input)
    .where(and(eq(categories.id, categoryId), eq(categories.householdId, householdId)))
    .returning()
}

export function deleteCategory(householdId: string, categoryId: string) {
  return db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.householdId, householdId)))
}
