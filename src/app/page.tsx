"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BiosLoader from "@/components/BiosLoader";
import VideoHero from "@/components/VideoHero";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <main className="relative bg-void min-h-screen">
            {/* BIOS Loader */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <BiosLoader onComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <AnimatePresence>
                {!isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Video Hero Section */}
                        <VideoHero />

                        {/* VIP Room Features */}
                        <FeaturesSection />

                        {/* Pricing Section */}
                        <PricingSection />

                        {/* Testimonials - Google Reviews */}
                        <TestimonialsSection />

                        {/* Contact Section */}
                        <ContactSection />

                        {/* Footer */}
                        <Footer />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
