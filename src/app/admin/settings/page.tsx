'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { createAdminUser } from '@/app/actions/createUser';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function SettingsPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const supabase = createClientComponentClient<Database>();

    // Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin'>('admin'); // Only creating admins for now
    const [newUserBranch, setNewUserBranch] = useState<'dinamo' | 'chikovani' | 'all'>('dinamo');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchProfiles = async () => {
        setLoading(true);
        // 1. Check if I am owner
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((myProfile as any)?.role === 'owner') setIsOwner(true);
        }

        // 2. Fetch all profiles (Wait, RLS might block if not owner? Owner policy allows all)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching profiles:', error);
        if (data) setProfiles(data);

        setLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setMessage(null);

        try {
            const result = await createAdminUser({
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole,
                branch_access: newUserBranch,
            });

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'User created successfully!' });
                setNewUserEmail('');
                setNewUserPassword('');
                fetchProfiles(); // Refresh list
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading settings...</div>;

    if (!isOwner) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-gray-400">You do not have permission to view this page. Only Owners can manage users.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>

            {/* Create User Form */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Create New Administrator</h2>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm border ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            value={newUserPassword}
                            onChange={e => setNewUserPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Branch Access</label>
                        <select
                            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            value={newUserBranch}
                            onChange={e => setNewUserBranch(e.target.value as any)}
                        >
                            <option value="dinamo">Dinamo Only</option>
                            <option value="chikovani">Chikovani Only</option>
                            <option value="all">All Branches</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>

            {/* User List */}
            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 font-semibold text-white">
                    Existing Users
                </div>
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {profiles.map(profile => (
                            <tr key={profile.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-mono text-xs">{profile.id}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${profile.role === 'owner' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {profile.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 capitalize">{profile.branch_access}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
