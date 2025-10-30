# Supabase Setup Guide

## 1. Environment Variables Setup

Your `.env.local` file has been created with the following variables:

### Required Variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client-side
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never expose to client)
- ⚠️ `DATABASE_URL` - **You need to add your database password**

### To Get Your Database Password:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/oxctqjbfihdvqyuvbtno
2. Navigate to: **Settings** > **Database**
3. Under **Connection String**, select **URI**
4. Copy the connection string (it will have your password)
5. Replace in `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.oxctqjbfihdvqyuvbtno.supabase.co:5432/postgres
   ```

### Important Security Notes:
- ✅ `.env.local` is in `.gitignore` - never commit it to Git
- ✅ Use `.env.example` as a template for team members
- ⚠️ Service role key has admin access - keep it secure

## 2. Install Supabase Package

Run this command:
```bash
pnpm add @supabase/supabase-js
```

## 3. Database Setup

### Option A: Run PostgreSQL Schema in Supabase

1. Go to Supabase Dashboard > SQL Editor
2. Open `scripts/comprehensive-schema-postgresql.sql`
3. Copy the entire content
4. Paste into Supabase SQL Editor
5. Click "Run" to create all tables

### Option B: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref oxctqjbfihdvqyuvbtno

# Run migration
supabase db push
```

## 4. Initialize Demo Data

After schema is created, run:

```bash
# In Supabase SQL Editor, paste and run:
# scripts/init-postgresql.sql
```

This creates:
- Demo user
- 5 sample subjects (Math, Physics, Computer Science, English, History)

## 5. Usage in Your Code

### Client-Side (React Components)
```typescript
import { supabase } from '@/lib/supabase'

// Fetch data
const { data, error } = await supabase
  .from('subjects')
  .select('*')
  .eq('user_id', userId)

// Insert data
const { data, error } = await supabase
  .from('study_sessions')
  .insert({
    subject_id: 'subject-id',
    start_time: new Date().toISOString(),
    duration: 3600,
  })

// Real-time subscriptions
supabase
  .channel('sessions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'study_sessions' },
    (payload) => console.log('New session:', payload)
  )
  .subscribe()
```

### Server-Side (API Routes)
```typescript
import { supabaseAdmin } from '@/lib/supabase'

// Use admin client for privileged operations
const { data, error } = await supabaseAdmin
  .from('users')
  .update({ is_active: true })
  .eq('id', userId)
```

## 6. Additional Environment Variables You May Need

### For Authentication (if using Supabase Auth)
```env
NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

### For Storage (file uploads)
```env
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=study-resources
```

### For Production
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### For Security
```env
JWT_SECRET=your_random_32_character_string_here
SESSION_SECRET=another_random_32_character_string
```

## 7. Update Database Connection (lib/db.ts)

Your app currently uses SQLite. To use Supabase PostgreSQL:

### Option A: Keep SQLite for Development, Use Supabase for Production
```typescript
// lib/db.ts
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  // Use Supabase
  const { supabase } = require('./supabase')
  // ... implement Supabase queries
} else {
  // Use SQLite for local dev
  const db = new Database(dbPath)
  // ... existing SQLite code
}
```

### Option B: Migrate Fully to Supabase
Replace `lib/db.ts` with Supabase client queries throughout the app.

## 8. Migration Checklist

- [ ] Install `@supabase/supabase-js` package
- [ ] Update `DATABASE_URL` with your password in `.env.local`
- [ ] Run `comprehensive-schema-postgresql.sql` in Supabase SQL Editor
- [ ] Run `init-postgresql.sql` to create demo data
- [ ] Test connection with a simple query
- [ ] Update API routes to use Supabase client
- [ ] Update data fetching hooks to use Supabase
- [ ] Test all CRUD operations
- [ ] Set up Row Level Security (RLS) policies in Supabase
- [ ] Deploy and test in production

## 9. Supabase Features You Can Use

### Row Level Security (RLS)
Protect data at the database level:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('study-sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'study_sessions'
  }, (payload) => {
    console.log('Change detected:', payload)
  })
  .subscribe()
```

### Storage (File Uploads)
```typescript
// Upload a file
const { data, error } = await supabase
  .storage
  .from('study-resources')
  .upload('path/to/file.pdf', file)

// Get public URL
const { data } = supabase
  .storage
  .from('study-resources')
  .getPublicUrl('path/to/file.pdf')
```

### Authentication (Optional)
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

## 10. Testing Connection

Create a test API route:

**`app/api/test-supabase/route.ts`**
```typescript
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connected successfully!',
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
```

Test by visiting: `http://localhost:3000/api/test-supabase`

## 11. Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🔧 [Supabase Dashboard](https://supabase.com/dashboard/project/oxctqjbfihdvqyuvbtno)
- 🎓 [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- 💬 [Supabase Discord](https://discord.supabase.com/)

## Need Help?

1. Check Supabase Dashboard > Logs for errors
2. Verify environment variables are loaded
3. Test database connection in SQL Editor
4. Check Row Level Security policies
5. Review API route responses

---

**Next Steps:**
1. Run `pnpm add @supabase/supabase-js`
2. Get your database password from Supabase Dashboard
3. Update `DATABASE_URL` in `.env.local`
4. Run the schema in Supabase SQL Editor
5. Test the connection!
