// Simple database test using existing pg dependency
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    return;
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Supabase successfully!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'ai_requests', 'analytics')
    `);
    
    console.log('Tables found:', tables.rows.map(t => t.table_name));
    
    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found. Run the SQL script in Supabase SQL Editor first.');
    } else if (tables.rows.length === 3) {
      console.log('✅ All tables exist! Database is ready.');
    } else {
      console.log('⚠️  Missing tables. Expected: users, ai_requests, analytics');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Try this:');
    console.log('1. Go to Supabase Settings → Database');
    console.log('2. Copy the "Connection string" (not the pooled one)');
    console.log('3. Make sure the password is correct');
  } finally {
    await client.end();
  }
}

testConnection();