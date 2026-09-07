import { NextResponse } from "next/server"
import { requireHouseholdContext } from "@/lib/auth/household"
import { extractAccessKey, ufFromAccessKey, isLikelyNfceUrl } from "@/lib/receipts/sefaz/registry"
import { parseGenericSefazHtml } from "@/lib/receipts/sefaz/parsers/generic"

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
]

function isSafeExternalUrl(url: URL) {
  if (url.protocol !== "https:") return false
  return !PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname))
}

export async function POST(request: Request) {
  // Garante que só um usuário autenticado com household ativa possa disparar
  // este fetch server-side (evita virar um proxy aberto para qualquer URL).
  await requireHouseholdContext()

  const { url: rawUrl } = await request.json().catch(() => ({ url: null }))

  if (typeof rawUrl !== "string" || !isLikelyNfceUrl(rawUrl)) {
    return NextResponse.json(
      { error: "URL não parece ser de uma NFC-e válida." },
      { status: 400 }
    )
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 })
  }

  if (!isSafeExternalUrl(url)) {
    return NextResponse.json({ error: "URL não permitida." }, { status: 400 })
  }

  const accessKey = extractAccessKey(rawUrl)
  const uf = accessKey ? ufFromAccessKey(accessKey) : null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GastosDaCasa/1.0)" },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`SEFAZ respondeu ${response.status}`)
    }

    const html = await response.text()
    const parsed = parseGenericSefazHtml(html)

    return NextResponse.json({
      uf,
      accessKey,
      rawUrl,
      merchant: parsed.merchant,
      total: parsed.total,
      issuedOn: parsed.issuedOn,
      // Confiança baixa proposital: este é um parser genérico best-effort,
      // não um parser dedicado por estado — o usuário sempre revisa antes
      // de confirmar o lançamento.
      confidence: parsed.total !== null ? 0.6 : 0.2,
    })
  } catch {
    return NextResponse.json({
      uf,
      accessKey,
      rawUrl,
      merchant: null,
      total: null,
      issuedOn: null,
      confidence: 0,
      error:
        "Não foi possível ler os dados automaticamente. Abra o link da nota e confirme o valor manualmente.",
    })
  }
}
