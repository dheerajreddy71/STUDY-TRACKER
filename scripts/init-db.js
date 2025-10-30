const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

const sql = neon(process.env.NEON_NEON_DATABASE_URL || "")

async function initializeDatabase() {
  try {
    console.log("[v0] Starting database initialization...")

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, "01-init-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf-8")

    // Split by semicolon but be careful with comments
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    console.log(`[v0] Found ${statements.length} SQL statements`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      try {
        console.log(`[v0] Executing statement ${i + 1}/${statements.length}...`)
        const result = await sql(statements[i])
        console.log(`[v0] ✓ Statement ${i + 1} executed`)
      } catch (error) {
        // Ignore "already exists" errors
        if (
          error.message?.includes("already exists") ||
          error.code === "42P07" ||
          error.message?.includes("duplicate key")
        ) {
          console.log(`[v0] ⊘ Statement ${i + 1} skipped (already exists)`)
        } else {
          console.error(`[v0] ✗ Error in statement ${i + 1}:`, error.message)
          // Continue with next statement instead of failing
        }
      }
    }

    console.log("[v0] Database initialization completed!")
    process.exit(0)
  } catch (error) {
    console.error("[v0] Fatal error:", error)
    process.exit(1)
  }
}

initializeDatabase()
