require('dotenv').config();
const postgres = require('postgres');
const dbUrl = process.env.DATABASE_URL.replace('Nexyuga@2026', 'Nexyuga%402026');
const sql = postgres(dbUrl);

async function migrate() {
  try {
    await sql`ALTER TABLE jury_users 
              ADD COLUMN IF NOT EXISTS name TEXT,
              ADD COLUMN IF NOT EXISTS phone TEXT,
              ADD COLUMN IF NOT EXISTS organization TEXT,
              ADD COLUMN IF NOT EXISTS designation TEXT;`;
    console.log('Jury columns Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
