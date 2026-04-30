export interface Branch {
    id: string; // Internal ID (e.g., 'chikovani')
    name: string; // Display Name (e.g., 'Simon Chikovani')
    slug: string; // URL Slug (e.g., 'chikovani')
    address: string;
    phone: string;
    googleMapsUrl: string;
    // We can add specific IDs or layout configs here later if needed
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
        phone: '+995555201414',
        googleMapsUrl: 'https://share.google/S9y2L2r3Dxx2gvhDh',
    }
];

export const getBranchBySlug = (slug: string): Branch | undefined => {
    return BRANCHES.find(b => b.slug === slug);
};

export const DEFAULT_BRANCH = BRANCHES[0];
