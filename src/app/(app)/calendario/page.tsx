import { requireHouseholdContext } from "@/lib/auth/household"
import { listCategories } from "@/lib/db/queries/categories"
import { listTransactionsForMonth, monthlyTotals } from "@/lib/db/queries/transactions"
import { getMonthlyPlan } from "@/lib/db/queries/budgets"
import { MonthHeader } from "@/components/calendar/month-header"
import { MonthGrid } from "@/components/calendar/month-grid"
import { ReceiptCapture } from "@/components/receipts/receipt-capture"

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const household = await requireHouseholdContext()
  const params = await searchParams
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1

  const [categories, transactions, totals, plan] = await Promise.all([
    listCategories(household.householdId),
    listTransactionsForMonth(household.householdId, year, month),
    monthlyTotals(household.householdId, year, month),
    getMonthlyPlan(household.householdId, year, month),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <ReceiptCapture householdId={household.householdId} categories={categories} />
      </div>
      <MonthHeader
        year={year}
        month={month}
        income={totals.income}
        expense={totals.expense}
        plannedExpense={plan.plannedExpense}
        plannedSaving={plan.plannedSaving}
        currency={household.currency}
      />
      <MonthGrid
        year={year}
        month={month}
        transactions={transactions}
        categories={categories}
        currency={household.currency}
      />
    </div>
  )
}
