export const SUPPORTED_CURRENCIES = [
  { code: "BRL", label: "Real brasileiro (R$)" },
  { code: "USD", label: "Dólar americano ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "Libra esterlina (£)" },
  { code: "ARS", label: "Peso argentino ($)" },
]

export function formatCurrency(amount: number | string, currency: string) {
  const value = typeof amount === "string" ? Number(amount) : amount
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
}
