import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Game Lounge | Tbilisi's #1 Gaming Lounge",
    description: "Premium gaming experience in Tbilisi. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.",
    keywords: ["gaming lounge", "Tbilisi", "PC gaming", "PS5", "esports", "Game Lounge"],
    authors: [{ name: "Game Lounge" }],
    openGraph: {
        title: "Game Lounge | Tbilisi's Premier Gaming Destination",
        description: "Premium gaming experience in Tbilisi. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.",
        type: "website",
        locale: "en_US",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Preload video so it's ready when user enters */}
                <link rel="preload" href="/video/main video.MP4" as="video" type="video/mp4" />
            </head>
            <body className="antialiased">
                <div className="scan-line" />
                {children}
            </body>
        </html>
    );
}
