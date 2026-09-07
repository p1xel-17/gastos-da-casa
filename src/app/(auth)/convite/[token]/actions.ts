"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { householdInvites, householdMembers, profiles } from "@/lib/db/schema"
import { createClient } from "@/lib/supabase/server"

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/convite/${token}`)
  }

  const invite = await db.query.householdInvites.findFirst({
    where: eq(householdInvites.token, token),
  })

  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    throw new Error("Este convite não é mais válido.")
  }

  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    throw new Error(
      "Este convite foi enviado para outro e-mail. Entre com a conta correta."
    )
  }

  await db
    .insert(profiles)
    .values({
      id: user.id,
      displayName:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email ??
        "Usuário",
    })
    .onConflictDoNothing()

  await db
    .insert(householdMembers)
    .values({ householdId: invite.householdId, userId: user.id, role: "member" })
    .onConflictDoNothing()

  await db
    .update(householdInvites)
    .set({ status: "accepted" })
    .where(eq(householdInvites.id, invite.id))

  redirect("/")
}
