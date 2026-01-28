import Link from 'next/link';
import { BRANCHES } from '@/config/branches';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden p-4">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px)
          `,
                    backgroundSize: "40px 40px",
                    maskImage: "radial-gradient(circle at center, black 0%, transparent 80%)"
                }}
            />

            <div className="z-10 text-center w-full max-w-4xl">
                <h1 className="font-orbitron text-4xl md:text-6xl text-white font-black tracking-wider mb-4 animate-fade-in-up">
                    <span className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">GAME</span> LOUNGE
                </h1>
                <p className="text-white/60 font-inter text-sm md:text-lg mb-12 tracking-widest uppercase animate-fade-in-up delay-100">
                    Select Your Arena
                </p>

                <div className="grid md:grid-cols-2 gap-6 w-full">
                    {BRANCHES.map((branch) => (
                        <Link
                            key={branch.id}
                            href={`/${branch.slug}`}
                            className="group relative h-[300px] flex flex-col items-center justify-center border border-white/10 bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden hover:border-neon-cyan transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />

                            {/* Optional: Add background image for each branch later */}
                            <div className="absolute inset-0 bg-neon-cyan/5 group-hover:bg-neon-cyan/10 transition-colors duration-500" />

                            <div className="z-20 transform group-hover:scale-110 transition-transform duration-500">
                                <h2 className="font-orbitron text-2xl md:text-3xl text-white font-bold tracking-wider mb-2 group-hover:text-neon-cyan transition-colors">
                                    {branch.name.toUpperCase()}
                                </h2>
                                <p className="text-white/50 text-xs md:text-sm font-inter uppercase tracking-widest">
                                    {branch.address}
                                </p>
                            </div>

                            {/* Hover Effect Line */}
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-neon-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </Link>
                    ))}
                </div>
            </div>

            <footer className="absolute bottom-8 text-white/20 text-xs font-inter tracking-widest">
                GAME LOUNGE TBILISI &copy; {new Date().getFullYear()}
            </footer>
        </main>
    );
}
