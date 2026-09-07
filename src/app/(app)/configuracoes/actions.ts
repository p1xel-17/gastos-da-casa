"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { requireHouseholdContext } from "@/lib/auth/household"
import { db } from "@/lib/db"
import { householdInvites, householdMembers } from "@/lib/db/schema"
import { updateHouseholdSettings } from "@/lib/db/queries/households"

export async function updateCurrencyAction(currency: string) {
  const household = await requireHouseholdContext()
  await updateHouseholdSettings(household.householdId, { currency })
  revalidatePath("/", "layout")
}

export async function updateThemeColorAction(themeColor: string) {
  const parsed = z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .parse(themeColor)
  const household = await requireHouseholdContext()
  await updateHouseholdSettings(household.householdId, { themeColor: parsed })
  revalidatePath("/", "layout")
}

export async function createInviteAction(email: string) {
  const parsedEmail = z.string().email().parse(email)
  const household = await requireHouseholdContext()

  if (household.role !== "admin") {
    throw new Error("Apenas administradores podem convidar novos moradores.")
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(householdInvites).values({
    householdId: household.householdId,
    email: parsedEmail,
    token,
    invitedBy: household.userId,
    expiresAt,
  })

  revalidatePath("/configuracoes")
  return token
}

export async function removeMemberAction(userId: string) {
  const household = await requireHouseholdContext()

  if (household.role !== "admin") {
    throw new Error("Apenas administradores podem remover moradores.")
  }
  if (userId === household.userId) {
    throw new Error("Você não pode remover a si mesmo.")
  }

  await db
    .delete(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, household.householdId),
        eq(householdMembers.userId, userId)
      )
    )

  revalidatePath("/configuracoes")
}
