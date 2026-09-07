"use server"

import { revalidatePath } from "next/cache"
import { requireHouseholdContext } from "@/lib/auth/household"
import { transactionSchema } from "@/lib/validation/transaction"
import { createTransaction } from "@/lib/db/queries/transactions"
import { createReceipt, markReceiptConfirmed } from "@/lib/db/queries/receipts"

export async function createReceiptAction(input: {
  storagePath: string | null
  rawQrUrl: string | null
  rawOcrText: string | null
  parsedJson: unknown
}) {
  const household = await requireHouseholdContext()
  return createReceipt(household.householdId, input)
}

export async function confirmReceiptTransactionAction(
  receiptId: string,
  input: unknown,
  source: "qr" | "ocr",
  confidence: number
) {
  const household = await requireHouseholdContext()
  const parsed = transactionSchema.parse(input)
  const [transaction] = await createTransaction(
    household.householdId,
    household.userId,
    parsed,
    source,
    confidence
  )
  await markReceiptConfirmed(receiptId, transaction.id)
  revalidatePath("/calendario")
  revalidatePath("/dashboards")
}
