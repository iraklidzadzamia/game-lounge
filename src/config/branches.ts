export interface Branch {
    id: string; // Internal ID (e.g., 'chikovani')
    name: string; // Display Name (e.g., 'Simon Chikovani')
    slug: string; // URL Slug (e.g., 'chikovani')
    address: string;
    /** Phone used for tel: links (Call Us, Call icon) */
    phone: string;
    /** Phone used for WhatsApp deep links. Falls back to `phone` if omitted. */
    whatsappPhone?: string;
    googleMapsUrl: string;
}

export const BRANCHES: Branch[] = [
    {
        id: 'chikovani',
        name: 'Simon Chikovani',
        slug: 'chikovani',
        address: '4 Simon Chikovani St, Tbilisi, Georgia',
        phone: '+995555201414',
        googleMapsUrl: 'https://share.google/TYNY1WyToYO47aZuY',
    },
    {
        id: 'dinamo',
        name: 'Dinamo',
        slug: 'dinamo',
        address: '2 David Kipiani St, Tbilisi, Georgia',
        phone: '+995500121288',
        whatsappPhone: '+995555554343',
        googleMapsUrl: 'https://share.google/S9y2L2r3Dxx2gvhDh',
    }
];

export const getBranchBySlug = (slug: string): Branch | undefined => {
    return BRANCHES.find(b => b.slug === slug);
};

export const DEFAULT_BRANCH = BRANCHES[0];
