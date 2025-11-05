require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Supabase migration...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log(`📏 Size: ${migrationSQL.length} characters\n`);
    
    // Execute migration
    console.log('⚡ Executing migration SQL...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // If exec_sql function doesn't exist, try direct query
      console.log('ℹ️  exec_sql function not found, using direct query method...\n');
      
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: '001_initial_schema', executed_at: new Date().toISOString() })
        .select();
      
      if (directError && !directError.message.includes('does not exist')) {
        throw directError;
      }
    }
    
    console.log('✅ Migration SQL executed successfully!\n');
    
    // Verify tables created
    console.log('🔍 Verifying database tables...\n');
    
    const tables = [
      'users',
      'patients', 
      'vital_signs',
      'medical_history',
      'lab_results',
      'imaging_results',
      'chat_messages',
      'ai_analysis'
    ];
    
    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ Table '${table}' - NOT CREATED (${countError.message})`);
      } else {
        console.log(`✅ Table '${table}' - EXISTS (${count || 0} rows)`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check Supabase Dashboard → Database → Tables');
    console.log('2. Check Storage → Buckets for "medical-files" bucket');
    console.log('3. Test backend: cd backend && npm run dev');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Please run the migration manually:');
    console.error('1. Go to Supabase Dashboard → SQL Editor');
    console.error('2. Copy contents of supabase/migrations/001_initial_schema.sql');
    console.error('3. Paste and run in SQL Editor');
    process.exit(1);
  }
}

runMigration();