# SQLite to PostgreSQL Migration Guide

## Overview

This guide helps you migrate your Study Tracker application from SQLite to PostgreSQL.

## Key Differences

### Data Types

| SQLite                    | PostgreSQL            |
| ------------------------- | --------------------- |
| TEXT                      | VARCHAR(n), TEXT      |
| INTEGER                   | INTEGER, BIGINT       |
| REAL                      | DECIMAL(p,s), NUMERIC |
| TEXT (for dates)          | DATE, TIMESTAMP       |
| INTEGER (0/1 for boolean) | BOOLEAN               |
| TEXT (for JSON)           | JSONB                 |

### ID Generation

**SQLite:**

```sql
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))))
```

**PostgreSQL:**

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### Timestamps

**SQLite:**

```sql
created_at TEXT DEFAULT (datetime('now'))
```

**PostgreSQL:**

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Boolean Values

**SQLite:**

```sql
is_active INTEGER DEFAULT 1  -- 0 = false, 1 = true
```

**PostgreSQL:**

```sql
is_active BOOLEAN DEFAULT TRUE
```

## Migration Steps

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE study_tracker;

# Create user
CREATE USER study_tracker_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE study_tracker TO study_tracker_user;

# Exit
\q
```

### 3. Run Initialization Script

```bash
# Run the init script
psql -U study_tracker_user -d study_tracker -f scripts/init-postgresql.sql
```

### 4. Export Data from SQLite

```bash
# Export to CSV files
sqlite3 data/study-tracker.db <<EOF
.headers on
.mode csv
.output users.csv
SELECT * FROM users;
.output subjects.csv
SELECT * FROM subjects;
.output study_sessions.csv
SELECT * FROM study_sessions;
-- Repeat for all tables
.quit
EOF
```

### 5. Import Data to PostgreSQL

```bash
# Import CSV files
psql -U study_tracker_user -d study_tracker <<EOF
\copy users FROM 'users.csv' WITH (FORMAT csv, HEADER true);
\copy subjects FROM 'subjects.csv' WITH (FORMAT csv, HEADER true);
\copy study_sessions FROM 'study_sessions.csv' WITH (FORMAT csv, HEADER true);
-- Repeat for all tables
EOF
```

### 6. Update Connection String

Create `.env.local`:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://study_tracker_user:your_secure_password@localhost:5432/study_tracker"
```

### 7. Update Database Connection Code

**Create new file:** `lib/db-postgresql.ts`

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export { pool };
```

### 8. Install PostgreSQL Driver

```bash
pnpm add pg @types/pg
```

### 9. Update Database Functions

Example conversion:

**SQLite (better-sqlite3):**

```typescript
const users = db.prepare("SELECT * FROM users WHERE id = ?").all(userId);
```

**PostgreSQL (pg):**

```typescript
const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
const users = result.rows;
```

## Data Type Conversions

### Converting Boolean Values

```sql
-- SQLite export (convert INTEGER to BOOLEAN text)
SELECT
  id,
  is_active = 1 AS is_active,
  is_guest = 1 AS is_guest
FROM users;
```

### Converting Dates

```sql
-- SQLite export (TEXT dates are usually ISO format, compatible)
SELECT
  id,
  date_of_birth,
  created_at
FROM users;
```

### Converting JSON

```sql
-- SQLite TEXT to PostgreSQL JSONB
-- No conversion needed if already valid JSON
SELECT
  id,
  preferred_study_times::jsonb
FROM users;
```

## Connection Pooling

PostgreSQL supports connection pooling for better performance:

```typescript
import { Pool } from "pg";

const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Performance Optimization

### 1. Analyze Tables

```sql
ANALYZE users;
ANALYZE subjects;
ANALYZE study_sessions;
-- Run for all tables
```

### 2. Vacuum Database

```sql
VACUUM ANALYZE;
```

### 3. Check Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Backup & Restore

### Backup

```bash
# Full database backup
pg_dump -U study_tracker_user study_tracker > backup.sql

# Compressed backup
pg_dump -U study_tracker_user study_tracker | gzip > backup.sql.gz

# Custom format (recommended)
pg_dump -U study_tracker_user -Fc study_tracker > backup.dump
```

### Restore

```bash
# From SQL file
psql -U study_tracker_user study_tracker < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -U study_tracker_user study_tracker

# From custom format
pg_restore -U study_tracker_user -d study_tracker backup.dump
```

## Monitoring

### Check Database Size

```sql
SELECT
  pg_size_pretty(pg_database_size('study_tracker')) AS database_size;
```

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active Connections

```sql
SELECT
  count(*) AS active_connections
FROM pg_stat_activity
WHERE datname = 'study_tracker';
```

## Deployment Considerations

### Heroku

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Get connection string
heroku config:get DATABASE_URL

# Run migrations
heroku run psql DATABASE_URL < scripts/comprehensive-schema-postgresql.sql
```

### AWS RDS

1. Create RDS PostgreSQL instance
2. Configure security groups
3. Use connection string from RDS console
4. Enable SSL connection

### Docker

```yaml
# docker-compose.yml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: study_tracker
      POSTGRES_USER: study_tracker_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-postgresql.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

## Troubleshooting

### Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check port
sudo netstat -plnt | grep 5432

# Test connection
psql -U study_tracker_user -d study_tracker -h localhost
```

### Permission Issues

```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO study_tracker_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO study_tracker_user;
```

### Encoding Issues

```sql
-- Set client encoding
SET client_encoding = 'UTF8';
```

## Performance Tuning

### PostgreSQL Configuration

Edit `postgresql.conf`:

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connections
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Connection Pooling with PgBouncer

```bash
# Install
sudo apt-get install pgbouncer

# Configure
# Edit /etc/pgbouncer/pgbouncer.ini
[databases]
study_tracker = host=localhost port=5432 dbname=study_tracker

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

## Testing

```bash
# Run test queries
psql -U study_tracker_user -d study_tracker <<EOF
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM subjects;
SELECT COUNT(*) FROM study_sessions;
EOF
```

## Rollback Plan

Keep SQLite database as backup:

```bash
# Backup SQLite
cp data/study-tracker.db data/study-tracker-backup.db

# If migration fails, revert connection string
DATABASE_URL="sqlite://data/study-tracker.db"
```

## Benefits of PostgreSQL

1. **Better Concurrency**: Multiple connections without locking
2. **Advanced Features**: Full-text search, GIS, JSON operations
3. **Scalability**: Better for large datasets and high traffic
4. **Production Ready**: Industry standard for web applications
5. **Cloud Support**: Native support on all major cloud platforms
6. **Replication**: Built-in streaming replication
7. **JSON Support**: Native JSONB type with indexing
8. **Extensions**: Rich ecosystem of extensions

## Next Steps

1. Test thoroughly with sample data
2. Benchmark performance
3. Set up automated backups
4. Configure monitoring
5. Plan production deployment
6. Document connection strings
7. Train team on PostgreSQL tools

## Support

For issues:

- PostgreSQL documentation: https://www.postgresql.org/docs/
- Stack Overflow: Tag `postgresql`
- PostgreSQL mailing lists

---

**Migration Checklist:**

- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Schema deployed
- [ ] Data exported from SQLite
- [ ] Data imported to PostgreSQL
- [ ] Connection string updated
- [ ] Code updated for pg driver
- [ ] Tests passing
- [ ] Performance acceptable
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
