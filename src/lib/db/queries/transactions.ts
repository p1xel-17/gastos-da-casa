import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, transactions } from "@/lib/db/schema"
import type { TransactionInput } from "@/lib/validation/transaction"

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`
  return { start, end }
}

export async function listTransactionsForMonth(
  householdId: string,
  year: number,
  month: number
) {
  const { start, end } = monthRange(year, month)
  return db
    .select({
      id: transactions.id,
      occurredOn: transactions.occurredOn,
      amount: transactions.amount,
      kind: transactions.kind,
      description: transactions.description,
      source: transactions.source,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.householdId, householdId),
        gte(transactions.occurredOn, start),
        lt(transactions.occurredOn, end)
      )
    )
    .orderBy(asc(transactions.occurredOn), desc(transactions.createdAt))
}

export function createTransaction(
  householdId: string,
  userId: string,
  input: TransactionInput,
  source: "manual" | "qr" | "ocr" = "manual",
  confidence: number | null = null
) {
  return db
    .insert(transactions)
    .values({
      householdId,
      createdBy: userId,
      occurredOn: input.occurredOn,
      amount: input.amount.toFixed(2),
      kind: input.kind,
      categoryId: input.categoryId ?? null,
      description: input.description ?? null,
      source,
      confidence,
    })
    .returning()
}

export function updateTransaction(
  householdId: string,
  transactionId: string,
  input: TransactionInput
) {
  return db
    .update(transactions)
    .set({
      occurredOn: input.occurredOn,
      amount: input.amount.toFixed(2),
      kind: input.kind,
      categoryId: input.categoryId ?? null,
      description: input.description ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.householdId, householdId))
    )
    .returning()
}

export function deleteTransaction(householdId: string, transactionId: string) {
  return db
    .delete(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.householdId, householdId))
    )
}

export async function monthlyTotals(householdId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month)
  const rows = await db
    .select({
      kind: transactions.kind,
      total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.householdId, householdId),
        gte(transactions.occurredOn, start),
        lt(transactions.occurredOn, end)
      )
    )
    .groupBy(transactions.kind)

  const income = Number(rows.find((r) => r.kind === "income")?.total ?? 0)
  const expense = Number(rows.find((r) => r.kind === "expense")?.total ?? 0)
  return { income, expense }
}

export async function expensesByCategory(
  householdId: string,
  year: number,
  month: number
) {
  const { start, end } = monthRange(year, month)
  return db
    .select({
      categoryId: transactions.categoryId,
      categoryName: sql<string>`coalesce(${categories.name}, 'Sem categoria')`,
      categoryColor: sql<string>`coalesce(${categories.color}, '#94a3b8')`,
      categoryIcon: sql<string>`coalesce(${categories.icon}, 'shapes')`,
      total: sql<string>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.householdId, householdId),
        eq(transactions.kind, "expense"),
        gte(transactions.occurredOn, start),
        lt(transactions.occurredOn, end)
      )
    )
    .groupBy(transactions.categoryId, categories.name, categories.color, categories.icon)
    .orderBy(desc(sql`sum(${transactions.amount})`))
}
