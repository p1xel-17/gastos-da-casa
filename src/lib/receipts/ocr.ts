export type OcrParseResult = {
  text: string
  total: number | null
  issuedOn: string | null // yyyy-mm-dd
}

function parseBrlToNumber(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".")
  return Number(normalized)
}

/**
 * Extrai o maior valor monetário no formato brasileiro (R$ 1.234,56) do
 * texto reconhecido — na prática, costuma ser o total da nota, já que
 * subtotais de itens tendem a ser menores. Best-effort: notas amassadas ou
 * com impressão térmica desbotada vão exigir correção manual mesmo assim.
 */
function extractLikelyTotal(text: string): number | null {
  const matches = [...text.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})/g)].map((m) =>
    parseBrlToNumber(m[1])
  )
  const valid = matches.filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length === 0) return null
  return Math.max(...valid)
}

function extractDate(text: string): string | null {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

export async function recognizeReceiptImage(file: File): Promise<OcrParseResult> {
  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker("por")

  try {
    const {
      data: { text },
    } = await worker.recognize(file)

    return {
      text,
      total: extractLikelyTotal(text),
      issuedOn: extractDate(text),
    }
  } finally {
    await worker.terminate()
  }
}
