# Environment Variables Quick Reference

## ✅ Already Configured

These are already set in your `.env.local`:

```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://oxctqjbfihdvqyuvbtno.supabase.co

# Public Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ REQUIRED: Add Your Database Password

You need to get your database password from Supabase and update this line in `.env.local`:

```bash
# Current (INCOMPLETE):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.oxctqjbfihdvqyuvbtno.supabase.co:5432/postgres

# Should be (with your actual password):
DATABASE_URL=postgresql://postgres:your_actual_password_here@db.oxctqjbfihdvqyuvbtno.supabase.co:5432/postgres
```

### How to Get Your Password:
1. Go to: https://supabase.com/dashboard/project/oxctqjbfihdvqyuvbtno/settings/database
2. Click on **Connection String** tab
3. Select **URI** mode
4. Copy the full connection string (it includes your password)
5. Paste it into `.env.local` as `DATABASE_URL`

## 🔒 Security Keys (REQUIRED)

Generate random secure strings for these (minimum 32 characters):

```bash
# For JWT token encryption
JWT_SECRET=change_this_to_a_random_32_character_string_abc123

# For session management
SESSION_SECRET=change_this_to_another_random_32_char_string_xyz789
```

### Generate Secure Random Strings:

**In PowerShell:**
```powershell
# Generate 32-character random string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or use online generator:**
https://randomkeygen.com/

## 📝 All Required Variables Summary

Here's what your complete `.env.local` needs:

```bash
# ===== REQUIRED =====
NEXT_PUBLIC_SUPABASE_URL=https://oxctqjbfihdvqyuvbtno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y3RxamJmaWhkdnF5dXZidG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzA3MzcsImV4cCI6MjA3NzQwNjczN30.jeBl-kzClqLffWlzIpM-am4N6Rzss8zoHvQZTEOvCpc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y3RxamJmaWhkdnF5dXZidG5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgzMDczNywiZXhwIjoyMDc3NDA2NzM3fQ.MCuZ0hBtKrtkXnPeeS1VLi_5Dtqv0q_JFoHGqICui8M
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.oxctqjbfihdvqyuvbtno.supabase.co:5432/postgres
JWT_SECRET=YOUR_RANDOM_32_CHAR_STRING_HERE
SESSION_SECRET=YOUR_RANDOM_32_CHAR_STRING_HERE

# ===== RECOMMENDED =====
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# ===== OPTIONAL =====
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=study-resources
```

## ✅ Installation Checklist

- [x] ✅ `.env.local` file created
- [x] ✅ `.env.example` file created
- [x] ✅ `@supabase/supabase-js` package installed
- [x] ✅ `lib/supabase.ts` client created
- [ ] ⚠️ Get database password from Supabase Dashboard
- [ ] ⚠️ Update `DATABASE_URL` in `.env.local`
- [ ] ⚠️ Generate and add `JWT_SECRET`
- [ ] ⚠️ Generate and add `SESSION_SECRET`
- [ ] 📋 Run PostgreSQL schema in Supabase SQL Editor
- [ ] 📋 Test connection

## 🚀 Next Steps

1. **Get your database password:**
   - Visit: https://supabase.com/dashboard/project/oxctqjbfihdvqyuvbtno/settings/database
   - Copy the connection string
   - Update `DATABASE_URL` in `.env.local`

2. **Generate security secrets:**
   ```powershell
   # Run this twice to get two different secrets
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

3. **Set up database schema:**
   - Open Supabase SQL Editor
   - Paste content from `scripts/comprehensive-schema-postgresql.sql`
   - Click "Run"

4. **Test connection:**
   ```bash
   pnpm dev
   ```

## 📚 Documentation

- **Supabase Setup Guide:** See `SUPABASE_SETUP.md` for detailed instructions
- **PostgreSQL Migration:** See `MIGRATION_POSTGRESQL.md` for migration guide
- **Project Documentation:** See `PROJECT.md` for full project overview

## 🆘 Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in project root
- Restart your dev server after adding env variables

### Database connection fails
- Check your `DATABASE_URL` has the correct password
- Test connection in Supabase Dashboard > SQL Editor

### "Cannot find module @supabase/supabase-js"
- Run `pnpm install` to install dependencies
- Check that it's listed in `package.json` dependencies

---

**Quick Start Command:**
```bash
# After setting up .env.local with your password:
pnpm dev
```
