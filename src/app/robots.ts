import type { MetadataRoute } from "next";

const SITE_URL = "https://game-lounge-nine.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/api", "/login", "/my-bookings"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
