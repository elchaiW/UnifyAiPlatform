// Quick database connection test
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Supabase connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Create connection with timeout settings
const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 10,
  idle_timeout: 20,
  max: 1
});

try {
  console.log('Attempting to connect to Supabase...');
  const result = await sql`SELECT version()`;
  console.log('✅ Database connection successful!');
  console.log('PostgreSQL version:', result[0].version);
  
  // Test if tables exist
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'ai_requests', 'analytics')
  `;
  
  console.log('Tables found:', tables.map(t => t.table_name));
  
  if (tables.length === 0) {
    console.log('⚠️  No tables found. You need to run the SQL script in Supabase SQL Editor first.');
  } else if (tables.length === 3) {
    console.log('✅ All tables exist! Database is ready.');
  } else {
    console.log('⚠️  Some tables missing. Expected: users, ai_requests, analytics');
  }
  
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.log('\n💡 Possible solutions:');
  console.log('1. Check your DATABASE_URL in Supabase Settings → Database');
  console.log('2. Make sure your Supabase project is not paused');
  console.log('3. Verify the connection string includes the correct password');
} finally {
  await sql.end();
}