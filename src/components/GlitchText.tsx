"use client";

import { ReactNode } from "react";

interface GlitchTextProps {
    children: ReactNode;
    className?: string;
    as?: "h1" | "h2" | "h3" | "span" | "p";
}

export default function GlitchText({
    children,
    className = "",
    as: Component = "h1",
}: GlitchTextProps) {
    const text = typeof children === "string" ? children : "";

    return (
        <Component
            className={`glitch-text font-orbitron ${className}`}
            data-text={text}
        >
            {children}
        </Component>
    );
}
