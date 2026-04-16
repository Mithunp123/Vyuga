require('dotenv').config()
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  try {
    const script = fs.readFileSync(path.join(__dirname, 'SQL', 'migrate_jury_system.sql'), 'utf8')
    await sql.unsafe(script)
    console.log('migrate_jury_system.sql executed successfully')
  } catch (err) {
    console.error('Error running jury migration:', err)
  } finally {
    process.exit()
  }
}

run()
