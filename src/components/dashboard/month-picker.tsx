import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MonthPicker({ year, month }: { year: number; month: number }) {
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const label = format(new Date(year, month - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        render={<Link href={`/dashboards?year=${prev.year}&month=${prev.month}`} />}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">{label}</span>
      <Button
        variant="outline"
        size="icon"
        render={<Link href={`/dashboards?year=${next.year}&month=${next.month}`} />}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
