// Google Ads conversion IDs (account: AW-18120790872)
export const GTAG_CONVERSIONS = {
    pageViewDinamo: "AW-18120790872/O9YcCPT6uaUcENim1cBD",
    getDirections: "AW-18120790872/3x46CNjjvKUcENim1cBD",
    whatsapp: "AW-18120790872/VTKsCNvjvKUcENim1cBD",
    instagramDm: "AW-18120790872/rhfRCN7jvKUcENim1cBD",
    messenger: "AW-18120790872/7qjsCNnkvKUcENim1cBD",
    callUs: "AW-18120790872/I3N1CNzkvKUcENim1cBD",
} as const;

type GtagFn = (...args: unknown[]) => void;

interface WindowWithGtag extends Window {
    gtag?: GtagFn;
}

/**
 * Report a Google Ads conversion event.
 * Use for fire-and-forget tracking (e.g. on links with target=_blank or tel: links)
 * where we don't need to delay navigation.
 */
export function reportConversion(sendTo: string): void {
    if (typeof window === "undefined") return;
    const w = window as WindowWithGtag;
    if (typeof w.gtag !== "function") return;
    w.gtag("event", "conversion", { send_to: sendTo });
}
