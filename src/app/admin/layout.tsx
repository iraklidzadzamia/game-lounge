import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Optional: Check database profile for role
    // const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    // if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) redirect('/');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#111]">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Game Lounge
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/map"
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        Map View
                    </Link>
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Settings
                        </p>
                        <Link
                            href="/admin/settings"
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Users & Roles
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session.user.email}</p>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#111]">
                    <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Admin
                    </h2>
                    <div className="flex gap-4">
                        <Link href="/admin/dashboard" className="text-sm font-medium text-gray-300">Dash</Link>
                        <Link href="/admin/map" className="text-sm font-medium text-gray-300">Map</Link>
                    </div>
                </header>

                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
