"use server"

import { revalidatePath } from "next/cache"
import { requireHouseholdContext } from "@/lib/auth/household"
import { categorySchema } from "@/lib/validation/category"
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db/queries/categories"

export async function createCategoryAction(input: unknown) {
  const household = await requireHouseholdContext()
  const parsed = categorySchema.parse(input)
  await createCategory(household.householdId, parsed)
  revalidatePath("/categorias")
}

export async function updateCategoryAction(categoryId: string, input: unknown) {
  const household = await requireHouseholdContext()
  const parsed = categorySchema.parse(input)
  await updateCategory(household.householdId, categoryId, parsed)
  revalidatePath("/categorias")
}

export async function deleteCategoryAction(categoryId: string) {
  const household = await requireHouseholdContext()
  await deleteCategory(household.householdId, categoryId)
  revalidatePath("/categorias")
}
