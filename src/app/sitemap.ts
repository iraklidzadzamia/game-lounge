import type { MetadataRoute } from "next";
import { BRANCHES } from "@/config/branches";

const SITE_URL = "https://game-lounge-nine.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        ...BRANCHES.map((branch) => ({
            url: `${SITE_URL}/${branch.slug}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.9,
        })),
    ];
}
