import { z } from "zod"

export const transactionSchema = z.object({
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  amount: z.number().positive("O valor deve ser maior que zero"),
  kind: z.enum(["income", "expense"]),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().max(200).optional().nullable(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
