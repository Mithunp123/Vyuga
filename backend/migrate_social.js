require('dotenv').config();
const postgres = require('postgres');
// URL decode the database URL to fix the '@' in password if necessary,
// but let's just replace the password inline to be safe.
const dbUrl = process.env.DATABASE_URL.replace('Nexyuga@2026', 'Nexyuga%402026');
const sql = postgres(dbUrl);

async function migrate() {
  try {
    await sql`ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS social_media_link TEXT;`;
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
