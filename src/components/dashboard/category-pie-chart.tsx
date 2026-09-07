"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/currency"

export type CategorySlice = {
  categoryId: string | null
  categoryName: string
  categoryColor: string
  total: number
}

export function CategoryPieChart({
  data,
  currency,
}: {
  data: CategorySlice[]
  currency: string
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Nenhuma despesa lançada neste mês ainda.
      </div>
    )
  }

  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.categoryId ?? "none", { label: d.categoryName, color: d.categoryColor }])
  )

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
              nameKey="categoryName"
            />
          }
        />
        <Pie
          data={data}
          dataKey="total"
          nameKey="categoryName"
          innerRadius={50}
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId ?? "none"} fill={entry.categoryColor} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
