import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

async function createOwner() {
    console.log('\n--- Create Initial Owner Account ---\n');

    const email = await askQuestion('Enter Email for Owner: ');
    const password = await askQuestion('Enter Password (min 6 chars): ');

    if (password.length < 6) {
        console.error('Error: Password must be at least 6 characters.');
        process.exit(1);
    }

    console.log(`\nCreating user ${email}...`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError) {
        console.error('Auth Error:', authError.message);
        process.exit(1);
    }

    if (!authData.user) {
        console.error('Unknown error: User was not created.');
        process.exit(1);
    }

    const userId = authData.user.id;
    console.log(`User created! UUID: ${userId}`);

    // 2. Create Profile
    console.log('Creating Admin Profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            role: 'owner',
            branch_access: 'all'
        });

    if (profileError) {
        console.error('Profile Error (User was created but profile failed):', profileError.message);
        console.log('You may need to run this SQL manually:');
        console.log(`INSERT INTO profiles (id, role, branch_access) VALUES ('${userId}', 'owner', 'all');`);
    } else {
        console.log('\nSUCCESS! Owner account setup complete.');
        console.log(`You can now login at http://localhost:3000/login with ${email}`);
    }

    rl.close();
    process.exit(0);
}

createOwner();
