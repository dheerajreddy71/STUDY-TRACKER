const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AgRZ2bcENfz7@ep-billowing-voice-adpvsc7a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Testing Neon connection...');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: connectionString
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as time, version() as pg_version');
    console.log('');
    console.log('✅ Neon connection successful!');
    console.log('   Server time:', result.rows[0].time);
    console.log('   PostgreSQL version:', result.rows[0].pg_version.split('\n')[0]);
    console.log('');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Database Tables:', tablesResult.rowCount);
    if (tablesResult.rowCount === 0) {
      console.log('   ⚠️  No tables found!');
      console.log('   👉 Go to Neon Dashboard → SQL Editor');
      console.log('   👉 Run scripts/comprehensive-schema-postgresql.sql');
    } else {
      tablesResult.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    }
    
    await pool.end();
    console.log('');
    console.log('✅ All checks passed!');
  } catch (error) {
    console.error('');
    console.error('❌ Connection failed:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('1. Password might contain special characters that need encoding');
    console.error('2. Go to Neon Dashboard → Connection Details');
    console.error('3. Copy the "Pooled connection" string again');
    console.error('4. Make sure you selected "Pooled" not "Direct"');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
