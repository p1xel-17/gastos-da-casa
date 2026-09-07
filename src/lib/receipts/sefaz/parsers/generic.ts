import * as cheerio from "cheerio"

export type SefazParseResult = {
  merchant: string | null
  total: number | null
  issuedOn: string | null // yyyy-mm-dd
}

function parseBrlToNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,.]/g, "").trim()
  if (!cleaned) return null
  // Formato brasileiro: milhar com ponto, decimal com vírgula.
  const normalized = cleaned.replace(/\./g, "").replace(",", ".")
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

function parseBrDate(raw: string): string | null {
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Parser "melhor esforço" para páginas de consulta de NFC-e da SEFAZ.
 * Cada estado tem seu próprio HTML — este parser não é específico de
 * nenhuma UF, ele procura por padrões de texto comuns (rótulos como
 * "Valor total" / "Valor a pagar" e datas em dd/mm/aaaa) em vez de
 * depender de ids/classes que variam por portal. Quando não encontra
 * nada com confiança, retorna campos nulos para o usuário preencher.
 */
export function parseGenericSefazHtml(html: string): SefazParseResult {
  const $ = cheerio.load(html)
  const bodyText = $("body").text().replace(/\s+/g, " ")

  let total: number | null = null
  const totalMatch = bodyText.match(
    /(?:valor\s+total|valor\s+a\s+pagar|valor\s+total\s+r\$)\s*:?\s*r?\$?\s*([\d.,]+)/i
  )
  if (totalMatch) {
    total = parseBrlToNumber(totalMatch[1])
  }

  const issuedOn = parseBrDate(bodyText)

  let merchant: string | null = null
  const candidateSelectors = ["#u20", ".fonte-emitente", ".header-emitente", "h1", "h2"]
  for (const selector of candidateSelectors) {
    const text = $(selector).first().text().trim()
    if (text && text.length > 2 && text.length < 120) {
      merchant = text
      break
    }
  }

  return { merchant, total, issuedOn }
}
