"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { decodeQrFromImageFile } from "@/lib/receipts/qr"
import { isLikelyNfceUrl } from "@/lib/receipts/sefaz/registry"
import { recognizeReceiptImage } from "@/lib/receipts/ocr"
import { createClient } from "@/lib/supabase/client"
import { TransactionForm, type CategoryOption } from "@/components/calendar/transaction-form"
import {
  createReceiptAction,
  confirmReceiptTransactionAction,
} from "@/app/(app)/calendario/receipt-actions"
import type { TransactionInput } from "@/lib/validation/transaction"

type ReviewState = {
  receiptId: string
  source: "qr" | "ocr"
  confidence: number
  defaultValues: Partial<TransactionInput>
  note: string | null
}

export function ReceiptCapture({
  householdId,
  categories,
}: {
  householdId: string
  categories: CategoryOption[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [review, setReview] = useState<ReviewState | null>(null)

  async function uploadReceiptImage(file: File) {
    const supabase = createClient()
    const path = `${householdId}/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from("receipts").upload(path, file)
    if (error) {
      // Não bloqueia o fluxo — a leitura de valores continua funcionando
      // mesmo se o upload da foto falhar (ex: bucket ainda não configurado).
      console.error("Falha ao enviar a foto da nota:", error.message)
      return null
    }
    return path
  }

  async function handleFile(file: File) {
    setIsProcessing(true)
    try {
      const [storagePath, qrPayload] = await Promise.all([
        uploadReceiptImage(file),
        decodeQrFromImageFile(file).catch(() => null),
      ])

      if (qrPayload && isLikelyNfceUrl(qrPayload)) {
        const response = await fetch("/api/receipts/parse-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: qrPayload }),
        })
        const data = await response.json()

        const receiptId = await createReceiptAction({
          storagePath,
          rawQrUrl: qrPayload,
          rawOcrText: null,
          parsedJson: data,
        })

        setReview({
          receiptId,
          source: "qr",
          confidence: data.confidence ?? 0,
          defaultValues: {
            occurredOn: data.issuedOn ?? undefined,
            amount: data.total ?? undefined,
            kind: "expense",
            description: data.merchant ?? undefined,
          },
          note:
            data.confidence >= 0.6
              ? null
              : "Não conseguimos ler todos os dados da nota automaticamente. Confira os valores antes de salvar.",
        })
        return
      }

      const ocrResult = await recognizeReceiptImage(file)
      const receiptId = await createReceiptAction({
        storagePath,
        rawQrUrl: null,
        rawOcrText: ocrResult.text,
        parsedJson: ocrResult,
      })

      setReview({
        receiptId,
        source: "ocr",
        confidence: ocrResult.total ? 0.3 : 0,
        defaultValues: {
          occurredOn: ocrResult.issuedOn ?? undefined,
          amount: ocrResult.total ?? undefined,
          kind: "expense",
        },
        note: "Nota lida sem QR Code (OCR). Confira com atenção antes de salvar — a leitura automática de fotos é menos precisa.",
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível processar a nota."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) handleFile(file)
        }}
      />
      <Button
        variant="outline"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Camera />}
        {isProcessing ? "Lendo nota..." : "Escanear nota"}
      </Button>

      <Dialog open={!!review} onOpenChange={(open) => !open && setReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Revisar lançamento
              <Badge variant={review?.source === "qr" ? "default" : "secondary"}>
                {review?.source === "qr" ? "QR Code da NFC-e" : "Leitura por OCR"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {review?.note ??
                "Dados lidos da nota fiscal. Confira e ajuste antes de salvar."}
            </DialogDescription>
          </DialogHeader>
          {review && (
            <TransactionForm
              date={review.defaultValues.occurredOn ?? new Date().toISOString().slice(0, 10)}
              categories={categories}
              defaultValues={review.defaultValues}
              onSubmit={(values) =>
                confirmReceiptTransactionAction(
                  review.receiptId,
                  values,
                  review.source,
                  review.confidence
                )
              }
              onDone={() => setReview(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
