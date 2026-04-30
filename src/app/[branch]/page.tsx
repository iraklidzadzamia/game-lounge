"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BiosLoader from "@/components/BiosLoader";
import VideoHero from "@/components/VideoHero";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home({ params }: { params: { branch: string } }) {
    const [isLoading, setIsLoading] = useState(true);

    // Fire Google Ads conversion on Dinamo page load
    useEffect(() => {
        if (params.branch === "dinamo" && typeof window !== "undefined") {
            // @ts-expect-error - gtag is injected by the global Google tag script
            if (typeof window.gtag === "function") {
                // @ts-expect-error - gtag global
                window.gtag("event", "conversion", {
                    send_to: "AW-18120790872/O9YcCPT6uaUcENim1cBD",
                });
            }
        }
    }, [params.branch]);

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
                        <VideoHero branchSlug={params.branch} />

                        {/* VIP Room Features */}
                        <FeaturesSection />

                        {/* Pricing Section */}
                        <PricingSection />

                        {/* Testimonials - Google Reviews */}
                        <TestimonialsSection />

                        {/* Contact Section */}
                        <ContactSection branchSlug={params.branch} />

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
