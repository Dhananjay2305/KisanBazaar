import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://addnaontkrvwgcotzjyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTE5MzIsImV4cCI6MjA5NDIyNzkzMn0.RT6jDg8Nxwa3ozZ93yDmApd_np3nCIUJTMNcjFNbpQc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUp() {
    const email = `test_${Date.now()}@farmdirect.com`;
    const password = 'password123';
    console.log(`Testing signup with ${email}...`);
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name: 'Test User', role: 'farmer', phone: '9999999999', location: 'Testville' }
        }
    });

    if (error) {
        console.error('Signup error:', error);
        return;
    }
    console.log('Signup success:', data.user?.id, 'Session:', !!data.session);

    let profile = null;
    for (let i = 0; i < 5; i++) {
        const { data: p, error: pErr } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (p) {
            profile = p;
            break;
        }
        console.log(`Attempt ${i+1}: Profile not found yet...`, pErr?.message || 'No profile data');
        await new Promise((r) => setTimeout(r, 600));
    }
    
    if (profile) {
        console.log('Profile found:', profile);
    } else {
        console.log('Profile NOT found after 5 attempts.');
    }
}

testSignUp();
