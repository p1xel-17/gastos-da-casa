import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Informe um nome").max(60),
  icon: z.string().min(1, "Escolha um ícone"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  kind: z.enum(["income", "expense", "both"]),
})

export type CategoryInput = z.infer<typeof categorySchema>
