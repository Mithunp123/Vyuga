require('dotenv').config()
const supabase = require('./supabase')

async function checkDatabaseStructure() {
  try {
    console.log('Checking current database structure...')

    // Check innovation_college_registrations table
    console.log('\n=== innovation_college_registrations ===')
    const { data: collegeData, error: collegeError } = await supabase
      .from('innovation_college_registrations')
      .select('*')
      .limit(1)

    if (collegeError) {
      console.error('Error querying innovation_college_registrations:', collegeError)
    } else {
      console.log('Available columns:', collegeData.length > 0 ? Object.keys(collegeData[0]).sort() : 'No data, but table exists')
    }

    // Check innovation_pwd_registrations table
    console.log('\n=== innovation_pwd_registrations ===')
    const { data: pwdData, error: pwdError } = await supabase
      .from('innovation_pwd_registrations')
      .select('*')
      .limit(1)

    if (pwdError) {
      console.error('Error querying innovation_pwd_registrations:', pwdError)
    } else {
      console.log('Available columns:', pwdData.length > 0 ? Object.keys(pwdData[0]).sort() : 'No data, but table exists')
    }

    process.exit(0)

  } catch (err) {
    console.error('Error checking database structure:', err)
    process.exit(1)
  }
}

checkDatabaseStructure()