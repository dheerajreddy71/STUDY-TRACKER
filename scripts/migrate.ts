import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"

const sql = neon(process.env.NEON_NEON_DATABASE_URL || "")

async function runMigration() {
  try {
    console.log("[v0] Starting database migration...")

    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), "scripts", "01-init-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf-8")

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    console.log(`[v0] Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      try {
        console.log(`[v0] Executing statement ${i + 1}/${statements.length}...`)
        await sql.query(statement)
        console.log(`[v0] Statement ${i + 1} executed successfully`)
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes("already exists") || error.code === "42P07") {
          console.log(`[v0] Statement ${i + 1} skipped (already exists)`)
        } else {
          console.error(`[v0] Error executing statement ${i + 1}:`, error.message)
          throw error
        }
      }
    }

    console.log("[v0] Database migration completed successfully!")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

runMigration()
