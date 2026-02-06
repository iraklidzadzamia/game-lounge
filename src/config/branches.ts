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
        address: '4 Simon Chikovani St',
        phone: '+995 555 123 456', // Update with real phone
        googleMapsUrl: 'https://maps.app.goo.gl/example', // Update with real URL
    },
    {
        id: 'dinamo',
        name: 'Dinamo',
        slug: 'dinamo',
        address: '2 David Kipiani St',
        phone: '+995 555 123 456', // Update with real phone
        googleMapsUrl: 'https://maps.app.goo.gl/example', // Update with real URL
    }
];

export const getBranchBySlug = (slug: string): Branch | undefined => {
    return BRANCHES.find(b => b.slug === slug);
};

export const DEFAULT_BRANCH = BRANCHES[0];
