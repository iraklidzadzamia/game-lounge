import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BRANCHES, getBranchBySlug } from '@/config/branches';

const SITE_URL = "https://game-lounge-nine.vercel.app";

export async function generateStaticParams() {
    return BRANCHES.map((branch) => ({
        branch: branch.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: { branch: string };
}): Promise<Metadata> {
    const branch = getBranchBySlug(params.branch);
    if (!branch) return {};

    const title = `Game Lounge ${branch.name} | Premium Gaming Lounge in Tbilisi`;
    const description = `Game Lounge ${branch.name} branch — premium gaming experience at ${branch.address}. RTX 40-Series PCs, 360Hz monitors, VIP PS5 rooms. Open 24/7.`;
    const url = `/${branch.slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_US",
            url,
            siteName: "Game Lounge",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default function BranchLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { branch: string };
}) {
    const branch = getBranchBySlug(params.branch);

    if (!branch) {
        notFound();
    }

    // Schema.org LocalBusiness JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/${branch.slug}`,
        name: `Game Lounge ${branch.name}`,
        image: `${SITE_URL}/video/poster.jpg`,
        url: `${SITE_URL}/${branch.slug}`,
        telephone: branch.phone,
        address: {
            "@type": "PostalAddress",
            streetAddress: branch.address,
            addressLocality: "Tbilisi",
            addressCountry: "GE",
        },
        priceRange: "$$",
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
            },
        ],
        hasMap: branch.googleMapsUrl,
        sameAs: [
            "https://www.instagram.com/gamelounge_tbilisi",
            "https://www.facebook.com/gamelounge.ge",
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
