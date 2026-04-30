import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://game-lounge-nine.vercel.app"),
    title: "Game Lounge | Tbilisi's #1 Gaming Lounge",
    description: "Premium gaming experience in Tbilisi. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.",
    keywords: ["gaming lounge", "Tbilisi", "PC gaming", "PS5", "esports", "Game Lounge"],
    authors: [{ name: "Game Lounge" }],
    alternates: {
        canonical: "/",
    },
    verification: {
        google: "v2QZid5iLXdNI82aQ23dbl6xUI6dibCeP8Oo3IVZpIs",
    },
    openGraph: {
        title: "Game Lounge | Tbilisi's Premier Gaming Destination",
        description: "Premium gaming experience in Tbilisi. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.",
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Game Lounge",
    },
    twitter: {
        card: "summary_large_image",
        title: "Game Lounge | Tbilisi's #1 Gaming Lounge",
        description: "Premium gaming experience in Tbilisi. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.",
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
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=AW-18120790872"
                    strategy="afterInteractive"
                />
                <Script id="google-ads-gtag" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'AW-18120790872');
                    `}
                </Script>
                {/* Organization JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Game Lounge",
                            url: "https://game-lounge-nine.vercel.app",
                            logo: "https://game-lounge-nine.vercel.app/video/poster.jpg",
                            foundingDate: "2014",
                            description:
                                "Tbilisi's premier 24/7 gaming lounge with RTX 40-Series PCs, 360Hz monitors, and VIP PS5 rooms.",
                            sameAs: [
                                "https://www.instagram.com/gamelounge_tbilisi",
                                "https://www.facebook.com/gamelounge.ge",
                            ],
                        }),
                    }}
                />
            </head>
            <body className="antialiased">
                <div className="scan-line" />
                {children}
            </body>
        </html>
    );
}
