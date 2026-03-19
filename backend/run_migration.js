require('dotenv').config()
const supabase = require('./supabase')

async function runMigration() {
  try {
    console.log('Starting migration...')

    // Try to add the missing columns to innovation_college_registrations
    console.log('Adding columns to innovation_college_registrations...')

    const { data: collegeData, error: collegeError } = await supabase
      .from('innovation_college_registrations')
      .select('idea_description')
      .limit(1)

    if (collegeError && collegeError.details?.includes('column "idea_description" does not exist')) {
      console.log('idea_description column does not exist in innovation_college_registrations, this is expected if migration hasn\'t been run')
    } else if (!collegeError) {
      console.log('✓ idea_description column already exists in innovation_college_registrations')
    }

    // Try to add the missing columns to innovation_pwd_registrations
    console.log('Checking innovation_pwd_registrations...')

    const { data: pwdData, error: pwdError } = await supabase
      .from('innovation_pwd_registrations')
      .select('idea_description')
      .limit(1)

    if (pwdError && pwdError.details?.includes('column "idea_description" does not exist')) {
      console.log('idea_description column does not exist in innovation_pwd_registrations, this is expected if migration hasn\'t been run')
    } else if (!pwdError) {
      console.log('✓ idea_description column already exists in innovation_pwd_registrations')
    }

    // Check cricket_team_registrations table for tournament_experience column
    console.log('Checking cricket_team_registrations...')

    const { data: cricketData, error: cricketError } = await supabase
      .from('cricket_team_registrations')
      .select('tournament_experience')
      .limit(1)

    if (cricketError && cricketError.details?.includes('column "tournament_experience" does not exist')) {
      console.log('tournament_experience column does not exist in cricket_team_registrations, migration needed')
    } else if (!cricketError) {
      console.log('✓ tournament_experience column already exists in cricket_team_registrations')
    }

    console.log('Migration check completed.')
    console.log('\nPlease run the SQL migrations manually in Supabase dashboard or using psql:')
    console.log('1. Innovation tables: backend/migrate_innovation_details.sql')
    console.log('2. Cricket table: backend/migrate_cricket_tournament_experience.sql')
    process.exit(0)

  } catch (err) {
    console.error('Migration check failed:', err)
    process.exit(1)
  }
}

runMigration()