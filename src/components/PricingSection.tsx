"use client";

import { motion } from "framer-motion";

interface PriceTier {
    name: string;
    specs?: string;
    prices: {
        duration: string;
        price: string;
        originalPrice?: string;
    }[];
    highlight?: boolean;
}

const pcZoneTiers: PriceTier[] = [
    {
        name: "PREMIUM",
        specs: "i9 • RTX 3090 • 240Hz",
        highlight: true,
        prices: [
            { duration: "1 hour", price: "10₾" },
            { duration: "3 hours", price: "27₾", originalPrice: "30₾" },
            { duration: "5 hours", price: "40₾", originalPrice: "50₾" },
        ],
    },
    {
        name: "PRO",
        specs: "i7 • RX 6650 XT • 240Hz",
        prices: [
            { duration: "1 hour", price: "8₾" },
            { duration: "3 hours", price: "22₾", originalPrice: "24₾" },
            { duration: "5 hours", price: "35₾", originalPrice: "40₾" },
        ],
    },
];

const psZoneTiers: PriceTier[] = [
    {
        name: "VIP ROOMS",
        specs: "Private • Soundproof • PS5",
        highlight: true,
        prices: [
            { duration: "1 hour", price: "25₾" },
            { duration: "2 hours", price: "45₾", originalPrice: "50₾" },
            { duration: "3 hours", price: "60₾", originalPrice: "75₾" },
        ],
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="relative py-20 md:py-32 px-4 md:px-8 bg-void overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px)
          `,
                    backgroundSize: "50px 50px",
                }}
            />

            <div className="relative max-w-7xl mx-auto">
                {/* Section Title */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-orbitron text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="gradient-text">PRICING</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Solo session or 5v5 with your squad—we've got you covered.
                        All setups include peripherals, headsets, and our full game library.
                    </p>
                    <p className="text-neon-cyan/80 text-sm font-orbitron mt-3 tracking-wider">
                        ⚡ LOWEST PING IN GEORGIA
                    </p>
                </motion.div>

                {/* PC Zone */}
                <div className="mb-20">
                    <motion.h3
                        className="font-orbitron text-2xl md:text-3xl text-neon-cyan mb-8 flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="w-12 h-px bg-neon-cyan" />
                        PC ZONE
                    </motion.h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {pcZoneTiers.map((tier, index) => (
                            <PricingCard key={tier.name} tier={tier} index={index} />
                        ))}
                    </div>

                    <motion.p
                        className="text-center mt-8 text-neon-cyan/80 font-inter"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        🍹 Special: 2 Hours = FREE Slushie, Coffee, or Tea
                    </motion.p>
                </div>

                {/* PlayStation Zone */}
                <div>
                    <motion.h3
                        className="font-orbitron text-2xl md:text-3xl text-electric-purple mb-8 flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="w-12 h-px bg-electric-purple" />
                        PLAYSTATION ZONE
                    </motion.h3>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                        {psZoneTiers.map((tier, index) => (
                            <PricingCard
                                key={tier.name}
                                tier={tier}
                                index={index}
                                variant="purple"
                            />
                        ))}
                    </div>

                    <motion.p
                        className="text-center mt-8 text-electric-purple/80 font-inter"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        🍹 Special: 2 Hours = 2 FREE Slushies
                    </motion.p>
                </div>
            </div>
        </section>
    );
}

function PricingCard({
    tier,
    index,
    variant = "cyan",
}: {
    tier: PriceTier;
    index: number;
    variant?: "cyan" | "purple";
}) {
    const accentColor = variant === "cyan" ? "neon-cyan" : "electric-purple";
    const accentRgb = variant === "cyan" ? "0, 243, 255" : "188, 19, 254";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className={`glass-card p-6 md:p-8 relative group ${tier.highlight ? "border-" + accentColor : ""
                }`}
            style={{
                borderColor: tier.highlight ? `rgba(${accentRgb}, 0.5)` : undefined,
            }}
        >
            {/* Hover glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    boxShadow: `0 0 40px rgba(${accentRgb}, 0.2)`,
                }}
            />

            {/* Tier name & specs */}
            <div className="mb-6">
                <h4
                    className={`font-orbitron text-xl md:text-2xl font-bold text-${accentColor} mb-2`}
                    style={{ color: `rgb(${accentRgb})` }}
                >
                    {tier.name}
                </h4>
                {tier.specs && (
                    <p className="text-white/50 text-sm font-inter">{tier.specs}</p>
                )}
            </div>

            {/* Prices */}
            <div className="space-y-4">
                {tier.prices.map((price) => (
                    <div
                        key={price.duration}
                        className="flex justify-between items-center border-b border-white/10 pb-3"
                    >
                        <span className="text-white/70">{price.duration}</span>
                        <div className="flex items-center gap-2">
                            {price.originalPrice && (
                                <span className="text-white/30 line-through text-sm">
                                    {price.originalPrice}
                                </span>
                            )}
                            <span
                                className="font-orbitron font-bold text-lg"
                                style={{ color: `rgb(${accentRgb})` }}
                            >
                                {price.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Highlight badge */}
            {tier.highlight && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-orbitron font-bold uppercase tracking-wider rounded-full"
                    style={{
                        background: `rgba(${accentRgb}, 0.2)`,
                        border: `1px solid rgba(${accentRgb}, 0.5)`,
                        color: `rgb(${accentRgb})`,
                    }}
                >
                    Popular
                </div>
            )}
        </motion.div>
    );
}
