const { createClient } = require('@supabase/supabase-js');

async function testUpload() {
    const url = 'https://addnaontkrvwgcotzjyy.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTE5MzIsImV4cCI6MjA5NDIyNzkzMn0.RT6jDg8Nxwa3ozZ93yDmApd_np3nCIUJTMNcjFNbpQc';
    const supabase = createClient(url, key);

    console.log('Testing upload to produce bucket with anon key...');
    const buffer = Buffer.from('hello world');
    const { data, error } = await supabase.storage.from('produce').upload('test-txt-' + Date.now() + '.txt', buffer, {
        contentType: 'text/plain',
        upsert: true
    });

    if (error) {
        console.error('❌ Upload to produce bucket failed:', error.message, error);
    } else {
        console.log('✅ Upload to produce bucket succeeded!', data);
    }
}
testUpload();
