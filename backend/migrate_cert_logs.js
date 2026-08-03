require('dotenv').config()
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  try {
    const sqlFile = path.join(__dirname, 'SQL', 'migrate_certificate_logs.sql')
    const query = fs.readFileSync(sqlFile, 'utf8')
    console.log('Running migration...')
    await sql.unsafe(query)
    console.log('Migration successful!')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await sql.end()
  }
}

run()
