import { redirect } from "next/navigation"
import { asc, eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { households, householdMembers, profiles } from "@/lib/db/schema"

export type HouseholdContext = {
  userId: string
  displayName: string
  householdId: string
  householdName: string
  currency: string
  themeColor: string
  role: "admin" | "member"
}

/**
 * Resolves the logged-in user's active household. Every server action and
 * page under (app) calls this first — it's the single place that decides
 * "quem é você e de qual household você faz parte", em vez de repetir a
 * checagem de sessão em cada rota.
 */
export async function requireHouseholdContext(): Promise<HouseholdContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const membership = await db
    .select({
      householdId: households.id,
      householdName: households.name,
      currency: households.currency,
      themeColor: households.themeColor,
      role: householdMembers.role,
      displayName: profiles.displayName,
    })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .innerJoin(profiles, eq(profiles.id, householdMembers.userId))
    .where(eq(householdMembers.userId, user.id))
    // Sem UI de troca de casa ainda: se o usuário pertencer a mais de uma
    // (ex: criou a própria antes de aceitar um convite), fixamos sempre a
    // mais antiga em vez de uma ordem arbitrária do Postgres.
    .orderBy(asc(householdMembers.joinedAt))
    .limit(1)
    .then((rows) => rows[0])

  if (!membership) {
    redirect("/onboarding")
  }

  return {
    userId: user.id,
    displayName: membership.displayName,
    householdId: membership.householdId,
    householdName: membership.householdName,
    currency: membership.currency,
    themeColor: membership.themeColor,
    role: membership.role as "admin" | "member",
  }
}
