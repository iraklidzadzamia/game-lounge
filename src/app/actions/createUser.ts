'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
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
    // Check if requester is Owner (Basic check based on cookie session isn't enough for SR key usage)
    // We should verify the session using normal client first?
    // Ideally: 1. Get current user from cookies. 2. Check if they are 'owner' in profiles.

    // Verify requester permissions
    const cookieStore = cookies();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user: requester } } = await supabase.auth.getUser();
    if (!requester) {
        return { error: 'Not authenticated' };
    }

    const { data: requesterProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', requester.id)
        .single();

    if (!requesterProfile || requesterProfile.role !== 'owner') {
        return { error: 'Unauthorized: Only Owners can create users.' };
    }

    // Proceed with creation
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError) return { error: authError.message };
    if (!newUser.user) return { error: 'Failed to create user object' };

    // Create Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: newUser.user.id,
            role,
            branch_access,
        });

    if (profileError) {
        // Rollback auth user if profile fails? 
        // Manual cleanup: await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return { error: 'Failed to create profile: ' + profileError.message };
    }

    return { success: true };
}
