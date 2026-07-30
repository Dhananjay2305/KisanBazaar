const { createClient } = require('@supabase/supabase-js');

async function checkDatabase() {
    const url = 'https://addnaontkrvwgcotzjyy.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTE5MzIsImV4cCI6MjA5NDIyNzkzMn0.RT6jDg8Nxwa3ozZ93yDmApd_np3nCIUJTMNcjFNbpQc';
    const supabase = createClient(url, key);

    console.log('Fetching profiles...');
    const { data: profiles, error: profError } = await supabase.from('profiles').select('*').limit(5);
    if (profError) {
        console.error('❌ Error fetching profiles:', profError.message);
    } else {
        console.log('✅ Profiles:', profiles);
    }

    console.log('Fetching listings...');
    const { data: listings, error: listError } = await supabase.from('listings').select('*').limit(5);
    if (listError) {
        console.error('❌ Error fetching listings:', listError.message);
    } else {
        console.log('✅ Listings:', listings);
    }
}

checkDatabase();
