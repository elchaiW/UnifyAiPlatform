import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking Supabase data...\n');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(connectionString, { 
  ssl: { rejectUnauthorized: false },
  max: 1 
});

try {
  console.log('📊 Users table:');
  const usersList = await sql`SELECT * FROM users`;
  console.table(usersList);
  
  console.log('\n🤖 AI Requests table:');
  const requestsList = await sql`SELECT * FROM ai_requests ORDER BY created_at DESC`;
  console.table(requestsList.map(r => ({
    id: r.id,
    type: r.type,
    content: r.content.substring(0, 50) + '...',
    category: r.category,
    selected_model: r.selected_model,
    status: r.status,
    created_at: r.created_at
  })));
  
  console.log('\n📈 Analytics table:');
  const analyticsList = await sql`SELECT * FROM analytics ORDER BY created_at DESC`;
  console.table(analyticsList);
  
  console.log(`\n✅ Summary:`);
  console.log(`- Users: ${usersList.length}`);
  console.log(`- AI Requests: ${requestsList.length}`);
  console.log(`- Analytics Records: ${analyticsList.length}`);
  
} catch (error) {
  console.error('❌ Error checking data:', error.message);
} finally {
  await sql.end();
}