import jsQR from "jsqr"

/**
 * Tenta decodificar um QR Code a partir de um arquivo de imagem, desenhando-o
 * num canvas invisível. Retorna o payload do QR (para NFC-e, uma URL do
 * portal da SEFAZ) ou null se nenhum QR for encontrado na imagem.
 */
export async function decodeQrFromImageFile(file: File): Promise<string | null> {
  const imageBitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.drawImage(imageBitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  return result?.data ?? null
}
