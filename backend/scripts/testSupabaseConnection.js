const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

function getRequiredEnv(name) {
    const value = process.env[name];
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? `${supabaseKey.slice(0, 10)}...` : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('\nTesting Supabase connection...\n');

    // Test 1: Check if we can query the locations table
    console.log('Test 1: Querying locations table...');
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .limit(5);

    if (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error details:', error);
        return false;
    }

    console.log(`✅ Connected successfully! Found ${data?.length || 0} records (showing first 5)`);
    if (data && data.length > 0) {
        console.log('\nSample record:');
        console.log(JSON.stringify(data[0], null, 2));
    }

    return true;
}

testConnection()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((err) => {
        console.error('❌ Test failed:', err.message);
        process.exit(1);
    });
