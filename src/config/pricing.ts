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
export const calculatePrice = (type: StationType, durationHours: number, options?: { guests?: number; controllers?: number }): number => {
    const config = PRICING[type];
    if (!config) return 0;

    let basePrice = 0;

    // Check for exact bundle match
    if (config.bundles[durationHours]) {
        basePrice = config.bundles[durationHours];
    } else {
        basePrice = config.hourlyRate * durationHours;
    }

    // --- Dynamic Pricing Logic (Placeholders) ---

    // PS5: 4 Controllers (2 vs 2 scenario)
    if (type === 'PS5' && options?.controllers && options.controllers > 2) {
        // Example: +50% price for 4 joysticks
        // TODO: Update with real pricing rule
        basePrice = basePrice * 1.5;
    }

    // VIP: More than 6 guests
    if (type === 'VIP' && options?.guests && options.guests > 6) {
        // Example: +10 GEL per extra guest per hour? Or flat fee?
        // Let's do a simple markup for now: +10 GEL flat for extra large group
        // TODO: Update with real pricing rule
        basePrice = basePrice + 20;
    }

    return Math.ceil(basePrice);
};
