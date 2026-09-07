import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  jsonb,
  primaryKey,
  real,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("BRL"),
  themeColor: text("theme_color").notNull().default("#16a34a"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Mirrors auth.users (Supabase) — id must equal the auth.users.id of the account.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const householdMembers = pgTable(
  "household_members",
  {
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.householdId, t.userId] }),
    index("household_members_user_idx").on(t.userId),
  ]
)

export const householdInvites = pgTable("household_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => profiles.id),
  status: text("status", { enum: ["pending", "accepted", "expired"] })
    .notNull()
    .default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("shapes"),
    color: text("color").notNull().default("#64748b"),
    kind: text("kind", { enum: ["income", "expense", "both"] })
      .notNull()
      .default("expense"),
    isDefault: integer("is_default").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("categories_household_idx").on(t.householdId)]
)

export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  transactionId: uuid("transaction_id"),
  storagePath: text("storage_path"),
  rawQrUrl: text("raw_qr_url"),
  rawOcrText: text("raw_ocr_text"),
  parsedJson: jsonb("parsed_json"),
  status: text("status", {
    enum: ["pending_review", "confirmed", "discarded"],
  })
    .notNull()
    .default("pending_review"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    occurredOn: date("occurred_on").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    kind: text("kind", { enum: ["income", "expense"] }).notNull(),
    description: text("description"),
    source: text("source", { enum: ["manual", "qr", "ocr"] })
      .notNull()
      .default("manual"),
    confidence: real("confidence"),
    receiptId: uuid("receipt_id").references(() => receipts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("transactions_household_date_idx").on(t.householdId, t.occurredOn),
    index("transactions_category_idx").on(t.categoryId),
  ]
)

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "cascade",
    }),
    kind: text("kind", { enum: ["planned_expense", "planned_saving"] }).notNull(),
    plannedAmount: numeric("planned_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("budgets_unique_scope").on(
      t.householdId,
      t.year,
      t.month,
      t.categoryId,
      t.kind
    ),
  ]
)

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}))

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(householdMembers),
}))

export const householdMembersRelations = relations(householdMembers, ({ one }) => ({
  household: one(households, {
    fields: [householdMembers.householdId],
    references: [households.id],
  }),
  profile: one(profiles, {
    fields: [householdMembers.userId],
    references: [profiles.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  household: one(households, {
    fields: [categories.householdId],
    references: [households.id],
  }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  household: one(households, {
    fields: [transactions.householdId],
    references: [households.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  receipt: one(receipts, {
    fields: [transactions.receiptId],
    references: [receipts.id],
  }),
}))

export const receiptsRelations = relations(receipts, ({ one }) => ({
  household: one(households, {
    fields: [receipts.householdId],
    references: [households.id],
  }),
}))

export const budgetsRelations = relations(budgets, ({ one }) => ({
  household: one(households, {
    fields: [budgets.householdId],
    references: [households.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}))
