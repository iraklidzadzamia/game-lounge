"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import GlitchText from "./GlitchText";
import ContactModal from "./ContactModal";

export default function FeaturesSection() {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <section className="relative py-24 md:py-32 bg-void overflow-hidden">
            {/* Background glow effects - hidden on mobile for performance */}
            <div className="hidden md:block absolute top-1/2 left-0 w-96 h-96 bg-electric-purple/10 rounded-full blur-[150px] -translate-y-1/2" />
            <div className="hidden md:block absolute top-1/2 right-0 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px] -translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-8">
                {/* Section Header - styled like PRICING */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white">
                        <span className="gradient-text">YOUR COMFORT</span> IS OUR PRIORITY
                    </h2>
                </motion.div>

                {/* VIP Room Showcase */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                    {/* Image */}
                    <motion.div
                        className="relative aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden group"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="/images/vip-room.jpg"
                            alt="VIP Gaming Room"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />

                        {/* Corner frame */}
                        <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none" />

                        {/* Label */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="inline-block px-3 py-1 bg-electric-purple/80 backdrop-blur-sm rounded-full text-xs font-orbitron tracking-wider text-white mb-2">
                                VIP ROOM
                            </span>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        className="flex flex-col"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >

                        {/* Title with pricing badge */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <GlitchText
                                as="h2"
                                className="text-3xl md:text-5xl lg:text-6xl font-black text-white"
                            >
                                PRIVATE GAMING
                                <br />
                                <span className="text-neon-cyan">EXPERIENCE</span>
                            </GlitchText>

                            {/* Pricing Badge - right side */}
                            <a
                                href="#pricing"
                                className="self-start md:self-auto flex flex-col items-end px-4 py-3 bg-electric-purple/10 border border-electric-purple/30 rounded-xl hover:bg-electric-purple/20 transition-colors group"
                            >
                                <span className="text-electric-purple font-orbitron font-bold text-xl">from 25₾/hr</span>
                                <span className="text-white/50 text-xs flex items-center gap-1 group-hover:text-white/70 transition-colors">
                                    See all pricing
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </a>
                        </div>

                        <p className="text-lg md:text-xl text-white/70 font-inter mb-8 leading-relaxed">
                            Immerse yourself in our cozy VIP rooms—ambient lighting,
                            PS5 with the latest games, and premium comfort. Perfect for a unique date night
                            or a chill gaming session with your crew.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                "PS5 with 100+ Games",
                                "Watch Movies on Big Screen",
                                "Live Football Matches",
                                "Up to 6 Players per Room",
                            ].map((feature, index) => (
                                <motion.li
                                    key={index}
                                    className="flex items-center gap-3 text-white/80"
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <span className="w-2 h-2 bg-neon-cyan rounded-full" />
                                    <span className="font-inter">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        {/* CTA Button - always last */}
                        <motion.button
                            onClick={() => setIsContactModalOpen(true)}
                            className="neon-button self-start"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            BOOK VIP ROOM
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </section>
    );
}
