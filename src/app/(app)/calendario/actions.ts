"use server"

import { revalidatePath } from "next/cache"
import { requireHouseholdContext } from "@/lib/auth/household"
import { transactionSchema } from "@/lib/validation/transaction"
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/db/queries/transactions"
import { upsertMonthlyPlan } from "@/lib/db/queries/budgets"

export async function createTransactionAction(input: unknown) {
  const household = await requireHouseholdContext()
  const parsed = transactionSchema.parse(input)
  await createTransaction(household.householdId, household.userId, parsed)
  revalidatePath("/calendario")
  revalidatePath("/dashboards")
}

export async function updateTransactionAction(transactionId: string, input: unknown) {
  const household = await requireHouseholdContext()
  const parsed = transactionSchema.parse(input)
  await updateTransaction(household.householdId, transactionId, parsed)
  revalidatePath("/calendario")
  revalidatePath("/dashboards")
}

export async function deleteTransactionAction(transactionId: string) {
  const household = await requireHouseholdContext()
  await deleteTransaction(household.householdId, transactionId)
  revalidatePath("/calendario")
  revalidatePath("/dashboards")
}

export async function savePlanAction(
  year: number,
  month: number,
  kind: "planned_expense" | "planned_saving",
  amount: number
) {
  const household = await requireHouseholdContext()
  await upsertMonthlyPlan(household.householdId, year, month, kind, amount)
  revalidatePath("/calendario")
  revalidatePath("/dashboards")
}
