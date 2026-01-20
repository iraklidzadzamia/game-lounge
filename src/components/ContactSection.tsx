"use client";

import { motion } from "framer-motion";

export default function ContactSection() {
    return (
        <section className="relative py-20 md:py-32 px-4 md:px-8 bg-void">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-purple/5 to-void pointer-events-none" />

            <div className="relative max-w-5xl mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-orbitron text-4xl md:text-6xl font-bold text-white mb-4">
                        FIND <span className="gradient-text">US</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* Location Info */}
                    <motion.div
                        className="glass-card p-8 md:p-10"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Address */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-neon-cyan"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-orbitron text-xl text-white">Location</h3>
                            </div>
                            <p className="text-white/70 text-lg ml-13 pl-[52px] mb-4">
                                Simon Chikovani str 4a
                                <br />
                                <span className="text-white/50">Tbilisi, Georgia</span>
                            </p>
                            <div className="pl-[52px]">
                                <a
                                    href="https://share.google/TYNY1WyToYO47aZuY"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-neon-cyan hover:text-white transition-colors text-sm font-orbitron tracking-wider border-b border-neon-cyan/50 hover:border-white pb-1"
                                >
                                    GET DIRECTIONS
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-electric-purple/20 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-electric-purple"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-orbitron text-xl text-white">Hours</h3>
                            </div>
                            <div className="pl-[52px]">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30">
                                    <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                                    <span className="font-orbitron text-neon-cyan font-bold">
                                        24/7
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-green-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <h3 className="font-orbitron text-xl text-white">
                                    Quick Contact
                                </h3>
                            </div>
                            <a
                                href="https://api.whatsapp.com/send?phone=995555201414"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-[52px] inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-inter font-medium hover:bg-green-500/30 transition-colors"
                            >
                                <span>Message on WhatsApp</span>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </a>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        className="glass-card p-8 md:p-10"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="font-orbitron text-2xl text-white mb-8">
                            FOLLOW US
                        </h3>

                        <div className="space-y-4">
                            <SocialLink
                                name="Instagram"
                                handle="@gamelounge_tbilisi"
                                href="https://instagram.com/gamelounge_tbilisi"
                                icon={
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                }
                                color="pink"
                            />

                            <SocialLink
                                name="Facebook"
                                handle="Game Lounge"
                                href="https://www.facebook.com/gamelounge.ge"
                                icon={
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                }
                                color="blue"
                            />
                        </div>

                        {/* Since 2014 badge */}
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan/20 to-electric-purple/20 flex items-center justify-center border border-white/10">
                                    <span className="font-orbitron text-2xl font-bold gradient-text">
                                        GL
                                    </span>
                                </div>
                                <div>
                                    <p className="font-orbitron text-white font-bold">
                                        GAME LOUNGE
                                    </p>
                                    <p className="text-white/50 text-sm">Since 2014</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function SocialLink({
    name,
    handle,
    href,
    icon,
    color,
}: {
    name: string;
    handle: string;
    href: string;
    icon: React.ReactNode;
    color: "pink" | "blue";
}) {
    const colorClasses = {
        pink: "bg-pink-500/20 border-pink-500/30 text-pink-400 hover:bg-pink-500/30",
        blue: "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30",
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${colorClasses[color]}`}
        >
            {icon}
            <div>
                <p className="font-medium text-white">{name}</p>
                <p className="text-sm opacity-70">{handle}</p>
            </div>
            <svg
                className="w-5 h-5 ml-auto opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
            </svg>
        </a>
    );
}
