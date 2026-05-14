require('dotenv').config()
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  try {
    await sql.unsafe(`ALTER TABLE talent_nominations ADD COLUMN nominator_type text;`)
    console.log('Added nominator_type')
  } catch (err) { console.log('Err nominator_type (might exist):', err.message) }

  try {
    await sql.unsafe(`ALTER TABLE talent_nominations ADD COLUMN instagram_id text;`)
    console.log('Added instagram_id')
  } catch (err) { console.log('Err instagram_id (might exist):', err.message) }
  
  process.exit()
}

run()
