require('dotenv').config()
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  try {
    const tableScript = fs.readFileSync(path.join(__dirname, 'SQL', 'table_payments.sql'), 'utf8')
    await sql.unsafe(tableScript)
    console.log('table_payments.sql executed')

    const columnsScript = fs.readFileSync(path.join(__dirname, 'SQL', 'migrate_payment_status.sql'), 'utf8')
    await sql.unsafe(columnsScript)
    console.log('migrate_payment_status.sql executed')

    const gstScript = fs.readFileSync(path.join(__dirname, 'SQL', 'migrate_add_gst_amount.sql'), 'utf8')
    await sql.unsafe(gstScript)
    console.log('migrate_add_gst_amount.sql executed')

    const receiptScript = fs.readFileSync(path.join(__dirname, 'SQL', 'migrate_add_receipt_id.sql'), 'utf8')
    await sql.unsafe(receiptScript)
    console.log('migrate_add_receipt_id.sql executed')
  } catch (err) {
    console.error('Error running migrations:', err)
  } finally {
    process.exit()
  }
}

run()
