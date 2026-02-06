"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import GlitchText from "./GlitchText";
import ContactModal from "./ContactModal";

const TOTAL_FRAMES = 84;

interface TextBeat {
    start: number;
    end: number;
    title: string;
    subtitle: string;
    align: "left" | "center" | "right";
    isCTA?: boolean;
}

const textBeats: TextBeat[] = [
    {
        start: 0,
        end: 0.2,
        title: "UNLEASH REALITY",
        subtitle: "The most advanced Game Lounge in Tbilisi.",
        align: "center",
    },
    {
        start: 0.3,
        end: 0.5,
        title: "RTX 40-SERIES POWER",
        subtitle: "360Hz Monitors. Zero Latency. Pure FPS.",
        align: "left",
    },
    {
        start: 0.6,
        end: 0.8,
        title: "VIP & PS5 ZONES",
        subtitle: "Private rooms. Soundproof. Hookah & Bar service.",
        align: "right",
    },
    {
        start: 0.85,
        end: 1.0,
        title: "GAME ON",
        subtitle: "",
        align: "center",
        isCTA: true,
    },
];

export default function GamingSetupScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [hasRealImages, setHasRealImages] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Heavy, mechanical spring for luxury feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            let realImagesFound = false;

            // Try to load real images first
            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                const frameNum = String(i).padStart(3, "0");
                img.src = `/sequence/pc_setup_${frameNum}.jpg`;

                try {
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            realImagesFound = true;
                            resolve(true);
                        };
                        img.onerror = reject;
                        // Timeout after 100ms for missing images
                        setTimeout(reject, 100);
                    });
                    loadedImages.push(img);
                } catch {
                    // Image not found, will use placeholder
                    break;
                }
            }

            if (realImagesFound && loadedImages.length > 0) {
                setImages(loadedImages);
                setHasRealImages(true);
            }

            setImagesLoaded(true);
        };

        loadImages();
    }, []);

    // Draw placeholder animation when no real images
    const drawPlaceholder = useCallback(
        (ctx: CanvasRenderingContext2D, progress: number) => {
            const canvas = ctx.canvas;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Clear canvas
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate assembly progress
            const assemblyProgress = Math.min(progress * 1.2, 1);

            // Draw PC components assembling
            ctx.save();
            ctx.translate(centerX, centerY);

            // GPU (main focal point)
            const gpuOffset = (1 - assemblyProgress) * 200;
            ctx.save();
            ctx.translate(0, -gpuOffset);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.3 + assemblyProgress * 0.7})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(-120, -40, 240, 80);

            // GPU fans
            ctx.beginPath();
            ctx.arc(-50, 0, 25, 0, Math.PI * 2);
            ctx.arc(50, 0, 25, 0, Math.PI * 2);
            ctx.stroke();

            // GPU text
            ctx.fillStyle = `rgba(0, 243, 255, ${assemblyProgress})`;
            ctx.font = "bold 12px Orbitron";
            ctx.textAlign = "center";
            ctx.fillText("RTX 4090", 0, 5);
            ctx.restore();

            // Motherboard (background)
            const mbOffset = (1 - assemblyProgress) * -150;
            ctx.save();
            ctx.translate(mbOffset * 0.5, 50);
            ctx.strokeStyle = `rgba(188, 19, 254, ${0.2 + assemblyProgress * 0.5})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(-150, -80, 300, 160);

            // Circuit traces
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(-140 + i * 35, -70);
                ctx.lineTo(-140 + i * 35, 70);
                ctx.stroke();
            }
            ctx.restore();

            // RAM sticks
            for (let i = 0; i < 4; i++) {
                const ramOffset = (1 - assemblyProgress) * (100 + i * 30);
                ctx.save();
                ctx.translate(-100 + i * 50, -100 - ramOffset * (i % 2 === 0 ? 1 : -1));
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.4 + assemblyProgress * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-15, -30, 30, 60);
                ctx.restore();
            }

            // CPU cooler (liquid cooling)
            const coolerOffset = (1 - assemblyProgress) * 180;
            ctx.save();
            ctx.translate(coolerOffset, -50 + coolerOffset * 0.5);
            ctx.strokeStyle = `rgba(188, 19, 254, ${0.5 + assemblyProgress * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.stroke();

            // Cooling pipes
            ctx.beginPath();
            ctx.moveTo(45, 0);
            ctx.bezierCurveTo(100, 0, 100, 80, 150, 80);
            ctx.stroke();
            ctx.restore();

            // Case outline (appears as components assemble)
            if (assemblyProgress > 0.5) {
                const caseOpacity = (assemblyProgress - 0.5) * 2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${caseOpacity * 0.3})`;
                ctx.lineWidth = 3;
                ctx.strokeRect(-180, -180, 360, 360);

                // Case front panel
                ctx.strokeStyle = `rgba(0, 243, 255, ${caseOpacity * 0.5})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(-170, -170, 20, 340);
            }

            // RGB lighting (appears at end)
            if (assemblyProgress > 0.7) {
                const rgbIntensity = (assemblyProgress - 0.7) / 0.3;

                // Neon glow effect
                const gradient = ctx.createRadialGradient(0, 0, 50, 0, 0, 250);
                gradient.addColorStop(0, `rgba(0, 243, 255, ${rgbIntensity * 0.1})`);
                gradient.addColorStop(
                    0.5,
                    `rgba(188, 19, 254, ${rgbIntensity * 0.05})`
                );
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(-250, -250, 500, 500);

                // Power LED
                ctx.fillStyle = `rgba(0, 243, 255, ${rgbIntensity})`;
                ctx.beginPath();
                ctx.arc(-165, 150, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Monitor frame (appears when fully assembled)
            if (assemblyProgress > 0.9) {
                const monitorOpacity = (assemblyProgress - 0.9) * 10;
                ctx.save();
                ctx.translate(centerX, centerY - 250);

                ctx.strokeStyle = `rgba(255, 255, 255, ${monitorOpacity * 0.5})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(-200, -80, 400, 160);

                // Monitor glow
                if (assemblyProgress > 0.95) {
                    const glowIntensity = (assemblyProgress - 0.95) * 20;
                    ctx.fillStyle = `rgba(0, 243, 255, ${glowIntensity * 0.1})`;
                    ctx.fillRect(-195, -75, 390, 150);

                    ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity})`;
                    ctx.font = "bold 24px Orbitron";
                    ctx.textAlign = "center";
                    ctx.fillText("GAME LOUNGE", 0, 10);
                }

                ctx.restore();
            }
        },
        []
    );

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        const unsubscribe = smoothProgress.on("change", (value) => {
            if (hasRealImages && images.length > 0) {
                // Draw real image sequence
                const frameIndex = Math.min(
                    Math.floor(value * (images.length - 1)),
                    images.length - 1
                );
                const img = images[frameIndex];

                if (img) {
                    ctx.fillStyle = "#050505";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Calculate scaling to fit image while maintaining aspect ratio
                    const scale = Math.min(
                        canvas.width / img.width,
                        canvas.height / img.height
                    );
                    const x = (canvas.width - img.width * scale) / 2;
                    const y = (canvas.height - img.height * scale) / 2;

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // Cover watermark at bottom with gradient fade
                    const coverHeight = 120;
                    const gradient = ctx.createLinearGradient(
                        0,
                        canvas.height - coverHeight,
                        0,
                        canvas.height
                    );
                    gradient.addColorStop(0, "rgba(5, 5, 5, 0)");
                    gradient.addColorStop(0.3, "rgba(5, 5, 5, 0.8)");
                    gradient.addColorStop(1, "rgba(5, 5, 5, 1)");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, canvas.height - coverHeight, canvas.width, coverHeight);
                }
            } else {
                // Draw placeholder animation
                drawPlaceholder(ctx, value);
            }
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            unsubscribe();
        };
    }, [imagesLoaded, images, hasRealImages, smoothProgress, drawPlaceholder]);

    return (
        <div ref={containerRef} className="relative" style={{ height: "500vh" }}>
            {/* Sticky Canvas */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: "contain" }}
                />

                {/* Text Overlays */}
                {textBeats.map((beat, index) => (
                    <TextOverlay
                        key={index}
                        beat={beat}
                        scrollProgress={smoothProgress}
                        onOpenContactModal={() => setIsContactModalOpen(true)}
                    />
                ))}

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
                    }}
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

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    );
}

// Text Overlay Component
function TextOverlay({
    beat,
    scrollProgress,
    onOpenContactModal,
}: {
    beat: TextBeat;
    scrollProgress: ReturnType<typeof useSpring>;
    onOpenContactModal: () => void;
}) {
    const opacity = useTransform(
        scrollProgress,
        [
            beat.start - 0.05,
            beat.start,
            beat.start + (beat.end - beat.start) * 0.8,
            beat.end,
        ],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollProgress,
        [beat.start - 0.05, beat.start, beat.end],
        [50, 0, -30]
    );

    const alignmentClasses = {
        left: "left-4 md:left-16 text-left items-start",
        center: "left-1/2 -translate-x-1/2 text-center items-center",
        right: "right-4 md:right-16 text-right items-end",
    };

    return (
        <motion.div
            className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-4 px-4 md:px-0 max-w-xl ${alignmentClasses[beat.align]}`}
            style={{ opacity, y }}
        >
            {/* Backdrop for mobile readability */}
            <div className="absolute inset-0 -m-4 bg-black/30 backdrop-blur-sm rounded-lg md:bg-transparent md:backdrop-blur-none" />

            <div className="relative">
                <GlitchText
                    as="h2"
                    className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight"
                >
                    {beat.title}
                </GlitchText>

                {beat.subtitle && (
                    <p className="text-lg md:text-xl text-white/70 font-inter mt-2 md:mt-4">
                        {beat.subtitle}
                    </p>
                )}

                {beat.isCTA && (
                    <motion.button
                        onClick={onOpenContactModal}
                        className="neon-button mt-6 md:mt-8"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        BOOK YOUR STATION
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
