import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida (veja .env.example).")
}

// prepare:false — necessário para o pooler em modo "transaction" do Supabase (pgbouncer).
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })
