import { eq, and, gt } from "drizzle-orm"
import { db } from "@/lib/db"
import { households, householdMembers, profiles, householdInvites } from "@/lib/db/schema"

export function listMembers(householdId: string) {
  return db
    .select({
      userId: householdMembers.userId,
      role: householdMembers.role,
      joinedAt: householdMembers.joinedAt,
      displayName: profiles.displayName,
    })
    .from(householdMembers)
    .innerJoin(profiles, eq(profiles.id, householdMembers.userId))
    .where(eq(householdMembers.householdId, householdId))
}

export function listPendingInvites(householdId: string) {
  return db
    .select()
    .from(householdInvites)
    .where(
      and(
        eq(householdInvites.householdId, householdId),
        eq(householdInvites.status, "pending"),
        gt(householdInvites.expiresAt, new Date())
      )
    )
}

export function updateHouseholdSettings(
  householdId: string,
  values: Partial<{ currency: string; themeColor: string; name: string }>
) {
  return db.update(households).set(values).where(eq(households.id, householdId))
}
