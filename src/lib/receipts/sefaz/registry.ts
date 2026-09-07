// Código do IBGE para cada UF, usado nos 2 primeiros dígitos da chave de
// acesso de 44 dígitos da NFC-e (ex: 35... = São Paulo).
const UF_BY_CODE: Record<string, string> = {
  "11": "RO",
  "12": "AC",
  "13": "AM",
  "14": "RR",
  "15": "PA",
  "16": "AP",
  "17": "TO",
  "21": "MA",
  "22": "PI",
  "23": "CE",
  "24": "RN",
  "25": "PB",
  "26": "PE",
  "27": "AL",
  "28": "SE",
  "29": "BA",
  "31": "MG",
  "32": "ES",
  "33": "RJ",
  "35": "SP",
  "41": "PR",
  "42": "SC",
  "43": "RS",
  "50": "MS",
  "51": "MT",
  "52": "GO",
  "53": "DF",
}

export function extractAccessKey(qrUrl: string): string | null {
  const match = qrUrl.match(/\d{44}/)
  return match ? match[0] : null
}

export function ufFromAccessKey(accessKey: string): string | null {
  return UF_BY_CODE[accessKey.slice(0, 2)] ?? null
}

export function isLikelyNfceUrl(payload: string): boolean {
  return /^https?:\/\//i.test(payload) && extractAccessKey(payload) !== null
}
