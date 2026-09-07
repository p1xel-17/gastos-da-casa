import { TrendingUp, TrendingDown, CalendarClock, Wallet } from "lucide-react"
import { requireHouseholdContext } from "@/lib/auth/household"
import {
  monthlyTotals,
  expensesByCategory,
} from "@/lib/db/queries/transactions"
import { formatCurrency } from "@/lib/currency"
import { getCategoryIcon } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart"
import { MonthPicker } from "@/components/dashboard/month-picker"

export default async function DashboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const household = await requireHouseholdContext()
  const params = await searchParams
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1

  const [totals, categoryBreakdown] = await Promise.all([
    monthlyTotals(household.householdId, year, month),
    expensesByCategory(household.householdId, year, month),
  ])

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const daysElapsed = isCurrentMonth
    ? now.getDate()
    : new Date(year, month, 0).getDate()
  const dailyAverage = totals.expense / Math.max(daysElapsed, 1)

  const categoryData = categoryBreakdown.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    categoryColor: c.categoryColor,
    categoryIcon: c.categoryIcon,
    total: Number(c.total),
  }))

  const topCategories = categoryData.slice(0, 5)
  const totalExpense = categoryData.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das finanças da casa no mês selecionado.
          </p>
        </div>
        <MonthPicker year={year} month={month} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Receitas do mês"
          value={formatCurrency(totals.income, household.currency)}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          label="Despesas do mês"
          value={formatCurrency(totals.expense, household.currency)}
          icon={TrendingDown}
          tone="negative"
        />
        <StatCard
          label="Média diária de despesas"
          value={formatCurrency(dailyAverage, household.currency)}
          icon={CalendarClock}
        />
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(totals.income - totals.expense, household.currency)}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} currency={household.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categorias</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa lançada neste mês ainda.
              </p>
            )}
            {topCategories.map((c) => {
              const Icon = getCategoryIcon(c.categoryIcon)
              const percentage = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0
              return (
                <div key={c.categoryId ?? "none"} className="flex items-center gap-3">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${c.categoryColor}20`, color: c.categoryColor }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.categoryName}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(c.total, household.currency)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: c.categoryColor }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
