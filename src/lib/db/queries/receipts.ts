import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { receipts } from "@/lib/db/schema"

export async function createReceipt(
  householdId: string,
  input: {
    storagePath: string | null
    rawQrUrl: string | null
    rawOcrText: string | null
    parsedJson: unknown
  }
) {
  const [receipt] = await db
    .insert(receipts)
    .values({ householdId, ...input })
    .returning({ id: receipts.id })
  return receipt.id
}

export async function markReceiptConfirmed(receiptId: string, transactionId: string) {
  await db
    .update(receipts)
    .set({ status: "confirmed", transactionId })
    .where(eq(receipts.id, receiptId))
}
