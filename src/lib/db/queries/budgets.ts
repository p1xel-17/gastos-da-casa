import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { budgets } from "@/lib/db/schema"

export async function getMonthlyPlan(householdId: string, year: number, month: number) {
  const rows = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.householdId, householdId),
        eq(budgets.year, year),
        eq(budgets.month, month),
        isNull(budgets.categoryId)
      )
    )

  const plannedExpense = rows.find((r) => r.kind === "planned_expense")
  const plannedSaving = rows.find((r) => r.kind === "planned_saving")

  return {
    plannedExpense: plannedExpense ? Number(plannedExpense.plannedAmount) : 0,
    plannedSaving: plannedSaving ? Number(plannedSaving.plannedAmount) : 0,
  }
}

export async function upsertMonthlyPlan(
  householdId: string,
  year: number,
  month: number,
  kind: "planned_expense" | "planned_saving",
  amount: number
) {
  const existing = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(
        eq(budgets.householdId, householdId),
        eq(budgets.year, year),
        eq(budgets.month, month),
        eq(budgets.kind, kind),
        isNull(budgets.categoryId)
      )
    )
    .then((rows) => rows[0])

  if (existing) {
    await db
      .update(budgets)
      .set({ plannedAmount: amount.toFixed(2), updatedAt: new Date() })
      .where(eq(budgets.id, existing.id))
    return
  }

  await db.insert(budgets).values({
    householdId,
    year,
    month,
    kind,
    plannedAmount: amount.toFixed(2),
  })
}
