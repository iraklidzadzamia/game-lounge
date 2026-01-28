export type StationType = 'PREMIUM' | 'PRO' | 'VIP' | 'STANDARD' | 'PREMIUM_X' | 'PS5';

interface PriceConfig {
    hourlyRate: number;
    bundles: {
        [hours: number]: number;
    };
}

export const PRICING: Record<StationType, PriceConfig> = {
    STANDARD: {
        hourlyRate: 7,
        bundles: {
            3: 18,
            5: 30,
        }
    },
    PRO: {
        hourlyRate: 8,
        bundles: {
            3: 22,
            5: 35,
        }
    },
    PREMIUM: {
        hourlyRate: 10,
        bundles: {
            3: 27,
            5: 40,
        }
    },
    PREMIUM_X: {
        hourlyRate: 11,
        bundles: {
            3: 30,
            5: 45,
        }
    },
    VIP: {
        hourlyRate: 25,
        bundles: {
            2: 45,
            3: 60,
        }
    },
    PS5: {
        hourlyRate: 8,
        bundles: {
            3: 22,
            5: 35,
        }
    }
};

/**
 * Calculates the total price for a booking.
 * Logic:
 * 1. Checks if there is a direct bundle for the duration (e.g. 3h -> 27).
 * 2. If no direct bundle, it falls back to hourlyRate * duration.
 *    (Future improvement: could intelligently combine bundles, e.g. 4h = 3h bundle + 1h)
 */
export const calculatePrice = (type: StationType, durationHours: number): number => {
    const config = PRICING[type];
    if (!config) return 0;

    // Check for exact bundle match
    if (config.bundles[durationHours]) {
        return config.bundles[durationHours];
    }

    // Fallback logic: 
    // If user selects 4 hours, and we have a 3h bundle. 
    // Should we do Bundle(3) + 1h? Or just 4 * 1h?
    // For now, based on typical requests, let's keep it simple: 
    // If explicit bundle exists, use it. Otherwise standard rate * duration.
    // However, if 4 hours costs 40 (4*10) and 5 hours costs 40 (bundle), it's weird.
    // Let's stick to standard rate fallback for now unless specific instructions are given for split bundles.

    return config.hourlyRate * durationHours;
};
