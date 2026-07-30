require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addFarmers() {
    const farmers = [
        { name: 'Ramesh Kumar', phone: '9876543210', location: 'Pune, Maharashtra', password: 'password123' },
        { name: 'Suresh Patil', phone: '9876543211', location: 'Nashik, Maharashtra', password: 'password123' },
        { name: 'Anand Sharma', phone: '9876543212', location: 'Nagpur, Maharashtra', password: 'password123' }
    ];

    for (const farmer of farmers) {
        const email = `${farmer.phone}@farmdirect.com`;
        
        console.log(`Creating farmer: ${farmer.name}...`);
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: farmer.password,
            email_confirm: true,
            user_metadata: { name: farmer.name, role: 'farmer', phone: farmer.phone, location: farmer.location }
        });

        if (authError) {
            console.error(`Error creating auth user ${farmer.name}:`, authError.message);
            continue;
        }

        const userId = authData.user.id;
        
        // 2. The Supabase trigger usually handles profile creation.
        // Let's check if the profile exists, if not, create it.
        // Wait a second for trigger to run
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        
        if (!profile) {
            console.log(`Inserting profile manually for ${farmer.name}...`);
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                name: farmer.name,
                role: 'farmer',
                location: farmer.location,
                phone: farmer.phone
            });
            
            if (profileError) {
                console.error(`Error creating profile for ${farmer.name}:`, profileError.message);
            }
        }
        
        console.log(`✅ Added Farmer: ${farmer.name} (ID: ${userId})`);
    }
}

addFarmers();
