# 🚀 Supabase Deployment Guide

## ✅ Migration Complete!

Your Study Tracker app has been successfully migrated from SQLite to Supabase PostgreSQL!

---

## 📋 What Changed

### ✨ New Files Created
- `lib/db-supabase.ts` - PostgreSQL connection pool and query wrapper
- `lib/db-sqlite.backup.ts` - Backup of original SQLite implementation

### 🔧 Files Modified
- `lib/db.ts` - Now uses Supabase instead of SQLite
- `lib/analytics/*.ts` - All 9 analytics modules updated
- `app/api/v1/recommendations/route.ts` - API route updated
- `package.json` - Removed `better-sqlite3`, added `pg`

### 🗑️ Dependencies Removed
- `better-sqlite3` - SQLite database
- `@types/better-sqlite3` - SQLite TypeScript types

### ➕ Dependencies Added
- `pg` - PostgreSQL client library
- `@types/pg` - PostgreSQL TypeScript types

---

## 🔐 Step 1: Set Up Supabase Database

### 1.1 Initialize Schema in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `scripts/comprehensive-schema-postgresql.sql`
5. Paste and click **RUN**

This creates all 15+ tables with 500+ fields.

### 1.2 Verify Tables Created

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- users
- subjects
- study_sessions
- performance_entries
- goals
- resources
- calendar_events
- achievements
- user_streaks
- user_preferences
- learning_analytics
- burnout_assessments
- spaced_repetition_items
- recommendation_patterns
- recommendations

---

## 🔑 Step 2: Configure Environment Variables

### 2.1 Get Supabase Credentials

1. **API Keys**: Dashboard → Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

2. **Database URL**: Dashboard → Settings → Database → Connection String
   - Select **URI** tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password

### 2.2 Update `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# PostgreSQL Database URL
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres

# Generate secure secrets (32+ characters)
JWT_SECRET=your_generated_secret_here
SESSION_SECRET=your_generated_secret_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2.3 Generate Secure Secrets

```bash
# Run in terminal to generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Step 3: Test Locally

### 3.1 Install Dependencies
```bash
pnpm install
```

### 3.2 Start Development Server
```bash
pnpm dev
```

### 3.3 Test Core Functionality

Visit http://localhost:3000 and test:

- ✅ **Registration** - Create a new user account
- ✅ **Login** - Sign in with credentials
- ✅ **Dashboard** - View study overview
- ✅ **Subjects** - Create/edit/delete subjects
- ✅ **Sessions** - Start and end study sessions
- ✅ **Performance** - Log assessment results
- ✅ **Analytics** - View recommendations and insights
- ✅ **Goals** - Create and track goals
- ✅ **Calendar** - Schedule sessions

### 3.4 Check Browser Console

Look for any PostgreSQL connection errors. If you see errors:
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure your IP is allowed (Supabase → Settings → Database → Connection Pooling)

---

## ☁️ Step 4: Deploy to Production

### Option A: Deploy to Vercel (Recommended)

#### 4.1 Connect Repository
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings:
   - Framework Preset: **Next.js**
   - Build Command: `pnpm build`
   - Output Directory: `.next`

#### 4.2 Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
JWT_SECRET=your_production_secret
SESSION_SECRET=your_production_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### 4.3 Deploy
Click **Deploy** and wait for build to complete.

---

### Option B: Deploy to Netlify

#### 4.1 Create Site
1. Go to https://app.netlify.com/start
2. Connect repository
3. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

#### 4.2 Add Environment Variables
Site settings → Environment variables → Add same variables as Vercel

#### 4.3 Deploy
Netlify will auto-deploy on git push.

---

### Option C: Deploy to Render

#### 4.1 Create Web Service
1. Go to https://dashboard.render.com/
2. New → Web Service
3. Connect repository
4. Settings:
   - Environment: **Node**
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

#### 4.2 Add Environment Variables
Environment → Add same variables

#### 4.3 Deploy
Render auto-deploys from main branch.

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
# Solution: Reinstall dependencies
pnpm install pg @types/pg
```

### Error: "DATABASE_URL is not set"
```bash
# Solution: Check .env.local file exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### Error: "Connection refused"
```bash
# Solution: Verify Supabase project is active
# Check: Dashboard → Settings → Database → Connection Info
```

### Error: "Role 'postgres' does not exist"
```bash
# Solution: Wrong connection string format
# Use: DATABASE_URL from Supabase dashboard (URI format)
```

### Error: "SSL connection required"
```bash
# Solution: Add SSL parameter to connection string
DATABASE_URL=postgresql://...?sslmode=require
```

### Build fails with "better-sqlite3" error
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📊 Performance Comparison

### SQLite (Before)
- ❌ File-based, not scalable
- ❌ Single connection limit
- ❌ No remote access
- ❌ Not suitable for production
- ✅ Fast for local development

### Supabase PostgreSQL (After)
- ✅ Cloud-hosted, auto-scaling
- ✅ Connection pooling (20 connections)
- ✅ Remote access from anywhere
- ✅ Production-ready
- ✅ Built-in backups and replication
- ✅ Real-time subscriptions available
- ✅ Row Level Security (RLS)

---

## 🔒 Security Best Practices

### 1. Use Service Role Key Securely
- ⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- ✅ Only use in server-side API routes
- ✅ Keep in `.env.local` (gitignored)

### 2. Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Create policies (example for subjects)
CREATE POLICY "Users can only see their own subjects"
ON subjects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own subjects"
ON subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Rotate Secrets Regularly
- Change `JWT_SECRET` and `SESSION_SECRET` every 90 days
- Update in both `.env.local` and deployment platform

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Connection Pooling**: https://supabase.com/docs/guides/database/connection-pooling

---

## ✅ Migration Checklist

- [x] Created Supabase PostgreSQL client (`lib/db-supabase.ts`)
- [x] Updated main database module (`lib/db.ts`)
- [x] Converted all analytics modules (9 files)
- [x] Updated API routes
- [x] Removed SQLite dependencies
- [x] Added PostgreSQL dependencies
- [ ] Run schema in Supabase SQL Editor
- [ ] Configure environment variables
- [ ] Test locally
- [ ] Deploy to production
- [ ] Verify all features work in production

---

## 🎉 You're Done!

Your Study Tracker is now powered by Supabase PostgreSQL and ready for production deployment!

**Need help?** Check the troubleshooting section or open an issue on GitHub.
