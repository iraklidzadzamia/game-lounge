"use client";

import { motion } from "framer-motion";
import GlitchText from "./GlitchText";

export default function VideoHero() {
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    poster="/video/poster.jpg"
                >
                    <source src="/video/main video.MP4" type="video/mp4" />
                </video>

                {/* Dark overlay for text readability - Stronger gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/40 to-void/90" />

                {/* Bottom gradient to blend into next section */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-void to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative inline-block"
                >
                    <GlitchText
                        as="h1"
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl"
                    >
                        GAME LOUNGE
                    </GlitchText>
                    {/* 24/7 Badge - bottom-right of title */}
                    <div className="absolute -bottom-2 right-8 md:right-16 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm border border-green-500/40 rounded">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-[8px] md:text-[10px] font-orbitron font-bold">24/7</span>
                    </div>
                </motion.div>

                <motion.p
                    className="text-xl md:text-2xl text-white/90 font-inter max-w-2xl mb-10 mt-6 text-balance drop-shadow-lg font-medium tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Tbilisi&apos;s First Premium Gaming Lounge
                    <span className="block mt-1 text-lg md:text-xl text-white/60">Pioneering Since 2014</span>
                </motion.p>

                <motion.div
                    className="flex flex-col items-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <a
                        href="https://api.whatsapp.com/send?phone=995555201414"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-neon-cyan text-black font-orbitron font-bold tracking-wider text-xl rounded-2xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_40px_rgba(0,243,255,0.6)] hover:-translate-y-1 transform active:scale-95"
                    >
                        BOOK YOUR STATION
                    </a>

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-6">
                        {/* Google Maps */}
                        <a
                            href="https://share.google/TYNY1WyToYO47aZuY"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1"
                            title="Get Directions"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:border-neon-cyan/50 transition-all duration-300">
                                <svg className="w-5 h-5 text-white group-hover:text-neon-cyan transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <span className="text-white/50 text-xs font-inter group-hover:text-white/70 transition-colors">Maps</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="https://api.whatsapp.com/send?phone=995555201414"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1"
                            title="WhatsApp"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-green-500/20 group-hover:border-green-500/50 transition-all duration-300">
                                <svg className="w-5 h-5 text-white group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <span className="text-white/50 text-xs font-inter group-hover:text-white/70 transition-colors">WhatsApp</span>
                        </a>

                        {/* Call */}
                        <a
                            href="tel:+995555201414"
                            className="group flex flex-col items-center gap-1"
                            title="Call Us"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-electric-purple/20 group-hover:border-electric-purple/50 transition-all duration-300">
                                <svg className="w-5 h-5 text-white group-hover:text-electric-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <span className="text-white/50 text-xs font-inter group-hover:text-white/70 transition-colors">Call</span>
                        </a>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <span className="text-white/50 text-sm font-orbitron tracking-widest">
                        SCROLL TO EXPLORE
                    </span>
                    <motion.div
                        className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className="w-1.5 h-3 bg-neon-cyan rounded-full" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-electric-purple/30" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-electric-purple/30" />
        </section>
    );
}
