'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Admin client for privileged operations (Creating users)
// Does NOT use cookies, uses Service Key directly.
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

interface CreateUserParams {
    email: string;
    password: string;
    role: 'admin' | 'owner';
    branch_access: 'all' | 'dinamo' | 'chikovani';
}

export async function createAdminUser({ email, password, role, branch_access }: CreateUserParams) {
    // 1. Verify Requesting User (Must be Owner)
    // Use createServerActionClient to automatically handle cookies in Server Actions
    const supabase = createServerActionClient<Database>({ cookies });

    const { data: { user: requester } } = await supabase.auth.getUser();
    if (!requester) {
        return { error: 'Not authenticated' };
    }

    // Check if requester is Owner in profiles table
    // Use supabaseAdmin here to ensure we can read profiles even if RLS is strict (though RLS usually allows reading own profile, admin is safer/faster for check)
    // Actually, stick to proper permissions: requester should be able to read their own profile.
    const { data: requesterProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', requester.id)
        .single();

    if (!requesterProfile || requesterProfile.role !== 'owner') {
        return { error: 'Unauthorized: Only Owners can create users.' };
    }

    // 2. Create New User (Using Admin Client)
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError) return { error: authError.message };
    if (!newUser.user) return { error: 'Failed to create user object' };

    // 3. Create Profile for New User
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: newUser.user.id,
            role,
            branch_access,
        });

    if (profileError) {
        return { error: 'Failed to create profile: ' + profileError.message };
    }

    return { success: true };
}
