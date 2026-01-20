"use client";

import { motion } from "framer-motion";

const reviews = [
    {
        rating: 5,
        text: "Best gaming lounge in Tbilisi. Highly recommend. Pretty much any popular game available and staff are willing to help you download any game they don't have. Computers have their own Steam accounts. Haven't tried the consoles but everyone seemed to be having a wonderful time. Keep this place open forever!",
        name: "Veniamin A.",
    },
    {
        rating: 5,
        text: "Just visited this gaming lounge and I was blown away by the incredible atmosphere and the top-notch gaming computers. The prices were just the cherry on top. Hands down, this is the best playroom in Georgia. Whether you're a hardcore gamer or just looking for a fun time with friends, this place has it all!",
        name: "Irakli D.",
    },
    {
        rating: 5,
        text: "The vibe is unmatched, with an energetic atmosphere that instantly pulls you into the gaming world. The computers are state-of-the-art, offering a seamless gaming experience. It's not just a gaming lounge; it's the ultimate gaming destination in Georgia. A must-visit!",
        name: "Ere B.",
    },
    {
        rating: 5,
        text: "Fantastic lounge with reasonable prices! Latest games, all updated. Staff is kind and helpful. Top-notch gaming gear - keyboards, mice, monitors, and super comfy chairs. Best gaming atmosphere in town!",
        name: "All you N.",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="relative py-20 md:py-28 bg-void overflow-hidden">
            {/* Background effects - hidden on mobile for performance */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-cyan/5 rounded-full blur-[150px]" />

            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="flex items-center gap-1">
                            {/* 4 full stars */}
                            {[...Array(4)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            {/* Half star */}
                            <svg className="w-5 h-5" viewBox="0 0 20 20">
                                <defs>
                                    <linearGradient id="halfStar">
                                        <stop offset="50%" stopColor="#FACC15" />
                                        <stop offset="50%" stopColor="#3f3f46" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <span className="text-white/80 font-orbitron font-bold">4.5</span>
                        <span className="text-white/40 font-inter text-sm">• 430+ reviews on Google</span>
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white">
                        WHAT <span className="gradient-text">GAMERS</span> SAY
                    </h2>
                </motion.div>

                {/* Reviews Grid */}
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            className="glass-card p-6 md:p-8 relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Quote icon */}
                            <div className="absolute top-4 right-4 text-neon-cyan/20">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Review text */}
                            <p className="text-white/80 font-inter leading-relaxed mb-6">
                                &ldquo;{review.text}&rdquo;
                            </p>

                            {/* Reviewer */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {review.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{review.name}</p>
                                    <p className="text-white/50 text-sm flex items-center gap-1">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google Review
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <a
                        href="https://share.google/TYNY1WyToYO47aZuY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors font-inter"
                    >
                        See all reviews on Google
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
