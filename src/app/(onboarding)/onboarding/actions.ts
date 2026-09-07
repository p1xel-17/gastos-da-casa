"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { households, householdMembers, profiles, categories } from "@/lib/db/schema"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_CATEGORIES: Array<{
  name: string
  icon: string
  color: string
  kind: "income" | "expense" | "both"
}> = [
  { name: "Moradia", icon: "home", color: "#0ea5e9", kind: "expense" },
  { name: "Alimentação", icon: "utensils", color: "#f97316", kind: "expense" },
  { name: "Transporte", icon: "car", color: "#8b5cf6", kind: "expense" },
  { name: "Saúde", icon: "heart-pulse", color: "#ef4444", kind: "expense" },
  { name: "Lazer", icon: "party-popper", color: "#ec4899", kind: "expense" },
  { name: "Educação", icon: "graduation-cap", color: "#6366f1", kind: "expense" },
  { name: "Mercado", icon: "shopping-cart", color: "#14b8a6", kind: "expense" },
  { name: "Salário", icon: "banknote", color: "#16a34a", kind: "income" },
  { name: "Outros", icon: "shapes", color: "#64748b", kind: "both" },
]

async function ensureProfile(userId: string, fallbackName: string) {
  await db
    .insert(profiles)
    .values({ id: userId, displayName: fallbackName })
    .onConflictDoNothing()
}

export async function createHousehold(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  if (!name) {
    throw new Error("Informe um nome para a casa/família.")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const existingMembership = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, user.id))
    .limit(1)
    .then((rows) => rows[0])

  if (existingMembership) {
    redirect("/")
  }

  await ensureProfile(
    user.id,
    (user.user_metadata?.display_name as string | undefined) ?? user.email ?? "Usuário"
  )

  const [household] = await db
    .insert(households)
    .values({ name })
    .returning({ id: households.id })

  await db.insert(householdMembers).values({
    householdId: household.id,
    userId: user.id,
    role: "admin",
  })

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, householdId: household.id, isDefault: 1 }))
  )

  redirect("/")
}
