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
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <main className="relative bg-void min-h-screen">
            {/* Hidden Video Preloader - loads during BIOS screen */}
            <video
                src="/video/snaptik_7597248535855123730_v2 2.mp4"
                preload="auto"
                muted
                playsInline
                className="hidden"
                aria-hidden="true"
            />

            {/* BIOS Loader */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <BiosLoader onComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <AnimatePresence>
                {!isLoading && (
                    <div>
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

                        {/* Scroll to Top Button */}
                        <ScrollToTop />
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
